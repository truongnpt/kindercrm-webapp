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

import { UpsertDailyReportSchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import {
  publishDailyReportAction,
  upsertDailyReportAction,
} from '~/lib/kinder/daily-reports/server-actions';
import type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';

export function DailyReportsPanel({
  schoolId,
  studentId,
  reports,
}: {
  schoolId: string;
  studentId: string;
  reports: StudentDailyReport[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpsertDailyReportSchema),
    defaultValues: {
      schoolId,
      studentId,
      reportDate: new Date().toISOString().slice(0, 10),
      mood: '',
      meals: '',
      nap: '',
      activities: '',
      teacherNote: '',
    },
  });

  return (
    <div className="space-y-6">
      {reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((report) => (
            <div className="rounded-lg border p-4 text-sm" key={report.id}>
              <p className="font-medium">{report.report_date}</p>
              {report.teacher_note ? (
                <p className="text-muted-foreground mt-1">{report.teacher_note}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:parent.reports.empty" />
        </p>
      )}

      <Form {...form}>
        <form
          className="grid max-w-2xl gap-4 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertDailyReportAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <FormField
            control={form.control}
            name="reportDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:attendance.date" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
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
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:parent.reports.meals" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
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
                  <Trans i18nKey="kinder:parent.reports.activities" />
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
                <FormLabel>
                  <Trans i18nKey="kinder:parent.reports.note" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">
            <Trans i18nKey="kinder:parent.reports.save" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
