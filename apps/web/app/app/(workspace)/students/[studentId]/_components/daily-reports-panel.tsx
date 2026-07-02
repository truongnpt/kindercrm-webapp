'use client';

import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  FileText,
  ImageIcon,
  Pencil,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { DailyReportMediaPanel } from '../../../daily-reports/_components/daily-report-media-panel';
import {
  DataTableCard,
  KinderConfirmDialog,
  KinderSubmitButton,
  PanelEmpty,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  buildDailyReportFormValues,
  buildEmptyDailyReportFormValues,
} from '~/lib/kinder/daily-reports/build-form-values';
import { UpsertDailyReportSchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import type { UpsertDailyReportFormValues } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import {
  deleteDailyReportAction,
  publishDailyReportAction,
  upsertDailyReportAction,
} from '~/lib/kinder/daily-reports/server-actions';
import type {
  DailyReportAttachment,
  StudentDailyReport,
} from '~/lib/kinder/daily-reports/types';

export function DailyReportsPanel({
  schoolId,
  studentId,
  reports,
  attachmentsByReportId,
}: {
  schoolId: string;
  studentId: string;
  reports: StudentDailyReport[];
  attachmentsByReportId: Record<string, DailyReportAttachment[]>;
}) {
  const { t } = useTranslation('kinder');
  const formRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentDailyReport | null>(
    null,
  );
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  const invalidateKeys = [kinderQueryKeys.students.detail(schoolId, studentId)];

  const form = useForm<UpsertDailyReportFormValues>({
    resolver: zodResolver(UpsertDailyReportSchema),
    defaultValues: buildEmptyDailyReportFormValues(schoolId, studentId),
  });

  const saveReport = useKinderMutation({
    mutationFn: upsertDailyReportAction,
    invalidateKeys,
    toast: {
      success: t('dailyReports.saveDraftSuccess'),
    },
    onSuccess: (data) => {
      if (data.reportId) {
        setEditingReportId(data.reportId);
      }
    },
  });

  const publishReport = useKinderMutation({
    mutationFn: publishDailyReportAction,
    invalidateKeys,
    toast: {
      success: t('dailyReports.published'),
    },
  });

  const deleteReport = useKinderMutation({
    mutationFn: deleteDailyReportAction,
    invalidateKeys,
    toast: {
      success: t('dailyReports.reportDeleted'),
    },
    onSuccess: () => {
      if (deleteTarget && editingReportId === deleteTarget.id) {
        setEditingReportId(null);
        form.reset(buildEmptyDailyReportFormValues(schoolId, studentId));
      }

      setDeleteTarget(null);
    },
  });

  const editingDate = form.watch('reportDate');
  const editingReport = editingReportId
    ? (reports.find((report) => report.id === editingReportId) ?? null)
    : null;
  const isEditingLocked = !!editingReport?.parent_acknowledged_at;
  const activeAttachments = editingReportId
    ? (attachmentsByReportId[editingReportId] ?? [])
    : [];

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function loadReportIntoForm(report: StudentDailyReport) {
    if (report.parent_acknowledged_at) {
      return;
    }

    setEditingReportId(report.id);
    form.reset(
      buildDailyReportFormValues(
        schoolId,
        studentId,
        report.report_date.slice(0, 10),
        report,
      ),
    );
    scrollToForm();
  }

  function resetFormForNewReport() {
    setEditingReportId(null);
    form.reset(buildEmptyDailyReportFormValues(schoolId, studentId));
  }

  async function handleSaveAndPublish(data: UpsertDailyReportFormValues) {
    await saveReport.mutateAsync(data);
    await publishReport.mutateAsync({
      schoolId,
      studentId,
      reportDate: data.reportDate,
    });
    setEditingReportId(null);
    form.reset(buildEmptyDailyReportFormValues(schoolId, studentId));
  }

  const formPending = saveReport.isPending || publishReport.isPending;

  return (
    <div className="space-y-6">
      <DataTableCard
        description={<Trans i18nKey="kinder:dailyReports.draftParentHint" />}
        title={<Trans i18nKey="kinder:dailyReports.title" />}
      >
        {reports.length > 0 ? (
          <div className="space-y-2 p-4">
            {reports.map((report) => {
              const isDraft = report.status !== 'published';
              const isLocked = !!report.parent_acknowledged_at;
              const mediaCount = attachmentsByReportId[report.id]?.length ?? 0;

              return (
                <div
                  className="kinder-mobile-card flex items-start justify-between gap-3 text-sm"
                  key={report.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{report.report_date}</p>
                    {report.daily_summary ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {report.daily_summary}
                      </p>
                    ) : report.teacher_note ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {report.teacher_note}
                      </p>
                    ) : null}
                    {mediaCount > 0 ? (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <ImageIcon className="size-3.5" />
                        <Trans
                          i18nKey="kinder:dailyReports.mediaCount"
                          values={{ count: mediaCount }}
                        />
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex flex-wrap justify-end gap-1">
                      <StatusBadge
                        tone={report.status === 'published' ? 'success' : 'info'}
                      >
                        <Trans
                          i18nKey={
                            report.status === 'published'
                              ? 'kinder:dailyReports.published'
                              : 'kinder:dailyReports.draft'
                          }
                        />
                      </StatusBadge>
                      {isLocked ? (
                        <StatusBadge tone="default">
                          <Trans i18nKey="kinder:dailyReports.acknowledged" />
                        </StatusBadge>
                      ) : null}
                    </div>

                    {!isLocked ? (
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          onClick={() => loadReportIntoForm(report)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Pencil className="mr-1.5 size-3.5" />
                          <Trans i18nKey="kinder:dailyReports.editReport" />
                        </Button>

                        {isDraft ? (
                          <>
                            <Button
                              disabled={publishReport.isPending}
                              onClick={() =>
                                publishReport.mutate({
                                  schoolId,
                                  studentId,
                                  reportDate: report.report_date.slice(0, 10),
                                })
                              }
                              size="sm"
                              type="button"
                            >
                              <Send className="mr-1.5 size-3.5" />
                              <Trans i18nKey="kinder:dailyReports.publish" />
                            </Button>

                            <Button
                              onClick={() => setDeleteTarget(report)}
                              size="sm"
                              type="button"
                              variant="destructive"
                            >
                              <Trash2 className="mr-1.5 size-3.5" />
                              <Trans i18nKey="common:delete" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <PanelEmpty messageKey="kinder:parent.reports.empty" />
          </div>
        )}
      </DataTableCard>

      <div ref={formRef}>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => saveReport.mutate(data))}
          >
            <DataTableCard
              description={
                isEditingLocked ? (
                  <Trans i18nKey="kinder:dailyReports.acknowledgedReadOnly" />
                ) : editingReportId ? (
                  <Trans
                    i18nKey="kinder:dailyReports.editingReport"
                    values={{ date: editingDate }}
                  />
                ) : (
                  <Trans i18nKey="kinder:dailyReports.classHint" />
                )
              }
              title={
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <Trans i18nKey="kinder:dailyReports.save" />
                </span>
              }
            >
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="reportDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <Trans i18nKey="kinder:attendance.date" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                          <Input
                            className="pl-9"
                            disabled={isEditingLocked}
                            type="date"
                            {...field}
                            required
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:parent.reports.mood" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isEditingLocked} />
                      </FormControl>
                      <FormMessage />
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
                        <Input {...field} disabled={isEditingLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meals"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <Trans i18nKey="kinder:parent.reports.meals" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isEditingLocked} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:parent.reports.nap" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isEditingLocked} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:parent.reports.activities" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isEditingLocked} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacherNote"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <Trans i18nKey="kinder:parent.reports.note" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isEditingLocked} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditingLocked ? (
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <KinderSubmitButton loading={formPending} type="submit">
                      <FileText className="mr-2 size-4" />
                      <Trans i18nKey="kinder:dailyReports.saveDraft" />
                    </KinderSubmitButton>

                    <Button
                      disabled={formPending}
                      onClick={form.handleSubmit(handleSaveAndPublish)}
                      type="button"
                    >
                      <Send className="mr-2 size-4" />
                      <Trans i18nKey="kinder:dailyReports.saveAndPublish" />
                    </Button>

                    {editingReportId ? (
                      <Button
                        disabled={formPending}
                        onClick={resetFormForNewReport}
                        type="button"
                        variant="outline"
                      >
                        <Trans i18nKey="kinder:dailyReports.newReport" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </DataTableCard>

            <DataTableCard
              description={
                isEditingLocked ? (
                  <Trans i18nKey="kinder:dailyReports.acknowledgedReadOnly" />
                ) : editingReportId ? (
                  <Trans i18nKey="kinder:dailyReports.mediaUploadHint" />
                ) : (
                  <Trans i18nKey="kinder:dailyReports.saveBeforeMedia" />
                )
              }
              title={
                <span className="inline-flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  <Trans i18nKey="kinder:dailyReports.tabs.media" />
                </span>
              }
            >
              <div className="p-4">
                <DailyReportMediaPanel
                  attachments={activeAttachments}
                  readOnly={isEditingLocked}
                  reportId={editingReportId}
                  schoolId={schoolId}
                />
              </div>
            </DataTableCard>
          </form>
        </Form>
      </div>

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="common:delete" />}
        description={
          <Trans i18nKey="kinder:dailyReports.deleteReportConfirm" />
        }
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }

          deleteReport.mutate({
            schoolId,
            studentId,
            reportId: deleteTarget.id,
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        pending={deleteReport.isPending}
        title={<Trans i18nKey="kinder:dailyReports.deleteReport" />}
      />
    </div>
  );
}
