'use client';

import { useEffect, useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpsertDailyReportSchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import {
  fetchDailyReportBundleAction,
  publishDailyReportAction,
  upsertDailyReportAction,
} from '~/lib/kinder/daily-reports/server-actions';
import { suggestDailyCommentAction } from '~/lib/kinder/ai/server-actions';
import type {
  ClassDailyReportStudent,
  DailyReportAttachment,
  DailyReportTimelineEntry,
  MealRecord,
  StudentDailyReport,
} from '~/lib/kinder/daily-reports/types';

import { DailyReportMediaPanel } from './daily-report-media-panel';
import { DailyReportTimelinePanel } from './daily-report-timeline-panel';

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack'] as const;
const CONSUMED_LEVELS = ['full', 'half', 'none', 'refused'] as const;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
}

function parseJsonObject<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }

  return undefined;
}

export function StudentDailyReportDialog({
  schoolId,
  reportDate,
  student,
  aiEnabled = false,
}: {
  schoolId: string;
  reportDate: string;
  student: ClassDailyReportStudent;
  aiEnabled?: boolean;
}) {
  const { t } = useTranslation('kinder');
  const [aiPending, startAiTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(
    student.report?.id ?? null,
  );
  const [timeline, setTimeline] = useState<DailyReportTimelineEntry[]>([]);
  const [attachments, setAttachments] = useState<DailyReportAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const report = student.report;

  const form = useForm({
    resolver: zodResolver(UpsertDailyReportSchema),
    defaultValues: buildFormValues(schoolId, student.studentId, reportDate, report),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    void (async () => {
      setLoading(true);

      try {
        const bundle = await fetchDailyReportBundleAction({
          schoolId,
          studentId: student.studentId,
          reportDate,
        });

        if (bundle) {
          setReportId(bundle.report.id);
          setTimeline(bundle.timeline);
          setAttachments(bundle.attachments);
          form.reset(
            buildFormValues(
              schoolId,
              student.studentId,
              reportDate,
              bundle.report,
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open, schoolId, student.studentId, reportDate, form]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Trans i18nKey="kinder:dailyReports.tabs.detail" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{student.fullName}</DialogTitle>
            {report?.status === 'published' ? (
              <Badge>
                <Trans i18nKey="kinder:dailyReports.published" />
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Trans i18nKey="kinder:dailyReports.draft" />
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="common:loading" defaults="Loading..." />
          </p>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="flex h-auto flex-wrap">
              <TabsTrigger value="overview">
                <Trans i18nKey="kinder:dailyReports.tabs.overview" />
              </TabsTrigger>
              <TabsTrigger value="meals">
                <Trans i18nKey="kinder:dailyReports.meals" />
              </TabsTrigger>
              <TabsTrigger value="health">
                <Trans i18nKey="kinder:dailyReports.health" />
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Trans i18nKey="kinder:dailyReports.timeline" />
              </TabsTrigger>
              <TabsTrigger value="media">
                <Trans i18nKey="kinder:dailyReports.tabs.media" />
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                className="mt-4 space-y-4"
                onSubmit={form.handleSubmit(async (data) => {
                  const promise = upsertDailyReportAction(data);
                  toast.promise(promise, {
                    loading: t('schoolSettings.saving'),
                    success: t('schoolSettings.saved'),
                    error: t('common:genericServerError', { ns: 'common' }),
                  });
                  const result = await promise;

                  if (result.reportId) {
                    setReportId(result.reportId);
                  }
                })}
              >
                <TabsContent className="space-y-3" value="overview">
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.mood" />
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dailySummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.dailySummary" />
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.activities" />
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teacherNote"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>
                            <Trans i18nKey="kinder:dailyReports.teacherNote" />
                          </FormLabel>
                          {aiEnabled ? (
                            <Button
                              disabled={aiPending}
                              onClick={() => {
                                startAiTransition(async () => {
                                  const values = form.getValues();
                                  const mealSummary = values.mealRecords
                                    ?.map(
                                      (meal) =>
                                        `${meal.slot}: ${meal.consumed}`,
                                    )
                                    .join(', ');

                                  try {
                                    const result =
                                      await suggestDailyCommentAction({
                                        schoolId,
                                        studentName: student.fullName,
                                        mood: values.mood,
                                        mealSummary,
                                        activities: values.activities,
                                      });
                                    form.setValue(
                                      'teacherNote',
                                      result.suggestion,
                                    );
                                    toast.success(t('ai.commentSuggested'));
                                  } catch (error) {
                                    toast.error(
                                      error instanceof Error
                                        ? error.message
                                        : t('common:genericServerError', {
                                            ns: 'common',
                                          }),
                                    );
                                  }
                                });
                              }}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              <Trans i18nKey="kinder:ai.suggestComment" />
                            </Button>
                          ) : null}
                        </div>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent className="space-y-3" value="meals">
                  {MEAL_SLOTS.map((slot, index) => (
                    <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2" key={slot}>
                      <p className="font-medium sm:col-span-2">
                        <Trans i18nKey={`kinder:dailyReports.mealSlots.${slot}`} />
                      </p>
                      <FormField
                        control={form.control}
                        name={`mealRecords.${index}.slot`}
                        render={({ field }) => (
                          <input type="hidden" {...field} value={slot} />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mealRecords.${index}.consumed`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Trans i18nKey="kinder:dailyReports.consumedLabel" />
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? 'full'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONSUMED_LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    <Trans
                                      i18nKey={`kinder:dailyReports.consumed.${level}`}
                                    />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mealRecords.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Trans i18nKey="kinder:crm.notes" />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sleepRecord.from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Trans i18nKey="kinder:dailyReports.sleepFrom" />
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sleepRecord.to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Trans i18nKey="kinder:dailyReports.sleepTo" />
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="sleepRecord.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.sleep" />
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent className="space-y-3" value="health">
                  <FormField
                    control={form.control}
                    name="healthObservation.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.temperature" />
                        </FormLabel>
                        <FormControl>
                          <Input step="0.1" type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthObservation.symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:dailyReports.symptoms" />
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="timeline">
                  <DailyReportTimelinePanel
                    entries={timeline}
                    reportId={reportId}
                    schoolId={schoolId}
                  />
                </TabsContent>

                <TabsContent value="media">
                  <DailyReportMediaPanel
                    attachments={attachments}
                    reportId={reportId}
                    schoolId={schoolId}
                  />
                </TabsContent>

                <div className="flex gap-2 border-t pt-4">
                  <Button type="submit">
                    <Trans i18nKey="kinder:dailyReports.save" />
                  </Button>
                  <Button
                    onClick={async () => {
                      const values = form.getValues();
                      const savePromise = upsertDailyReportAction(values);
                      await savePromise;

                      const promise = publishDailyReportAction({
                        schoolId,
                        studentId: student.studentId,
                        reportDate,
                      });

                      toast.promise(promise, {
                        loading: t('schoolSettings.saving'),
                        success: t('dailyReports.published'),
                        error: t('common:genericServerError', { ns: 'common' }),
                      });

                      await promise;
                      setOpen(false);
                    }}
                    type="button"
                    variant="secondary"
                  >
                    <Trans i18nKey="kinder:dailyReports.publish" />
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function buildFormValues(
  schoolId: string,
  studentId: string,
  reportDate: string,
  report: StudentDailyReport | null,
) {
  const mealRecords = parseJsonArray<MealRecord>(report?.meal_records);
  const normalizedMeals: MealRecord[] = MEAL_SLOTS.map((slot) => {
    const existing = mealRecords.find((meal) => meal.slot === slot);

    return (
      existing ?? {
        slot,
        consumed: 'full' as const,
        notes: '',
      }
    );
  });

  return {
    schoolId,
    studentId,
    reportDate,
    mood: report?.mood ?? '',
    teacherNote: report?.teacher_note ?? '',
    dailySummary: report?.daily_summary ?? '',
    meals: report?.meals ?? '',
    nap: report?.nap ?? '',
    activities: report?.activities ?? '',
    mealRecords: normalizedMeals,
    sleepRecord: parseJsonObject<{
      from?: string;
      to?: string;
      quality?: string;
      notes?: string;
    }>(report?.sleep_record) ?? { from: '', to: '', notes: '' },
    toiletRecords: parseJsonArray(report?.toilet_records),
    healthObservation: parseJsonObject<{
      temperature?: number;
      symptoms?: string;
      notes?: string;
    }>(report?.health_observation) ?? { symptoms: '' },
    medicationRecords: parseJsonArray(report?.medication_records),
    learningActivities: parseJsonArray(report?.learning_activities),
  };
}
