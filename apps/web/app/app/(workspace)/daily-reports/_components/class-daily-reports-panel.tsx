'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { BulkUpsertClassDailyReportsSchema } from '~/lib/kinder/daily-reports/schemas/daily-report.schema';
import { bulkUpsertClassDailyReportsAction } from '~/lib/kinder/daily-reports/server-actions';
import type { ClassDailyReportStudent } from '~/lib/kinder/daily-reports/types';

import { StudentDailyReportDialog } from './student-daily-report-dialog';

export function ClassDailyReportsPanel({
  schoolId,
  classId,
  reportDate,
  roster,
  aiEnabled = false,
}: {
  schoolId: string;
  classId: string;
  reportDate: string;
  roster: ClassDailyReportStudent[];
  aiEnabled?: boolean;
}) {
  const { t } = useTranslation('kinder');

  const defaultReports = useMemo(
    () =>
      roster.map((student) => ({
        studentId: student.studentId,
        mood: student.report?.mood ?? '',
        teacherNote: student.report?.teacher_note ?? '',
        dailySummary: student.report?.daily_summary ?? '',
      })),
    [roster],
  );

  const form = useForm({
    resolver: zodResolver(BulkUpsertClassDailyReportsSchema),
    defaultValues: {
      schoolId,
      classId,
      reportDate,
      reports: defaultReports,
    },
  });

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = bulkUpsertClassDailyReportsAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Trans i18nKey="kinder:dailyReports.student" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Trans i18nKey="kinder:dailyReports.mood" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Trans i18nKey="kinder:dailyReports.teacherNote" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Trans i18nKey="kinder:dailyReports.status" />
                  </th>
                  <th className="px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {roster.map((student, index) => (
                  <tr key={student.studentId}>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`reports.${index}.studentId`}
                        render={({ field }) => <input type="hidden" {...field} />}
                      />
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {student.studentCode}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`reports.${index}.mood`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FormField
                        control={form.control}
                        name={`reports.${index}.teacherNote`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          student.report?.status === 'published'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        <Trans
                          i18nKey={
                            student.report?.status === 'published'
                              ? 'kinder:dailyReports.published'
                              : 'kinder:dailyReports.draft'
                          }
                        />
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StudentDailyReportDialog
                        aiEnabled={aiEnabled}
                        reportDate={reportDate}
                        schoolId={schoolId}
                        student={student}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button type="submit">
            <Trans i18nKey="kinder:dailyReports.save" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
