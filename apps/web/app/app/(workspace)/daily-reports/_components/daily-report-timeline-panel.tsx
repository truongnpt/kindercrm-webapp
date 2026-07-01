'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { AddTimelineEntrySchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import {
  addTimelineEntryAction,
  deleteTimelineEntryAction,
} from '~/lib/kinder/daily-reports/server-actions';
import type { DailyReportTimelineEntry } from '~/lib/kinder/daily-reports/types';

const ENTRY_TYPES = [
  'meal',
  'sleep',
  'activity',
  'health',
  'medication',
  'toilet',
  'note',
] as const;

export function DailyReportTimelinePanel({
  schoolId,
  reportId,
  entries,
  readOnly = false,
}: {
  schoolId: string;
  reportId: string | null;
  entries: DailyReportTimelineEntry[];
  readOnly?: boolean;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(AddTimelineEntrySchema),
    defaultValues: {
      schoolId,
      reportId: reportId ?? '',
      entryType: 'note',
      title: '',
      content: '',
      recordedAt: new Date().toISOString().slice(0, 16),
    },
  });

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <PanelEmpty messageKey="kinder:dailyReports.timelineEmpty" />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li className="kinder-mobile-card text-sm" key={entry.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(entry.recorded_at).toLocaleString('vi-VN')} ·{' '}
                    {entry.entry_type}
                  </p>
                  {entry.content ? (
                    <p className="text-muted-foreground mt-1">{entry.content}</p>
                  ) : null}
                </div>
                {!readOnly && reportId ? (
                  <Button
                    onClick={async () => {
                      const promise = deleteTimelineEntryAction({
                        schoolId,
                        reportId,
                        entryId: entry.id,
                      });

                      toast.promise(promise, {
                        loading: t('schoolSettings.saving'),
                        success: t('schoolSettings.saved'),
                        error: t('common:genericServerError', { ns: 'common' }),
                      });

                      await promise;
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trans i18nKey="common:delete" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!readOnly && reportId ? (
        <Form {...form}>
          <form
            className="kinder-form-panel grid-cols-1"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = addTimelineEntryAction({
                ...data,
                reportId,
              });

              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('common:genericServerError', { ns: 'common' }),
              });

              await promise;
              form.reset({
                schoolId,
                reportId,
                entryType: 'note',
                title: '',
                content: '',
                recordedAt: new Date().toISOString().slice(0, 16),
              });
            })}
          >
            <FormField
              control={form.control}
              name="entryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:dailyReports.timelineType" />
                  </FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                      {...field}
                    >
                      {ENTRY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:dailyReports.timelineTitle" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:crm.notes" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recordedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:attendance.date" />
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">
              <Trans i18nKey="kinder:dailyReports.addTimeline" />
            </Button>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
