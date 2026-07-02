'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Input } from '@kit/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  KinderSubmitButton,
  PanelEmpty,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
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

  const saveReports = useKinderMutation({
    mutationFn: bulkUpsertClassDailyReportsAction,
    invalidateKeys: [kinderQueryKeys.dailyReports(schoolId)],
  });

  if (roster.length === 0) {
    return <PanelEmpty messageKey="kinder:dailyReports.emptyClass" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => saveReports.mutate(data))}>
        <DataTableCard
          actions={
            <KinderSubmitButton loading={saveReports.isPending} size="sm">
              <Trans i18nKey="kinder:dailyReports.save" />
            </KinderSubmitButton>
          }
          description={<Trans i18nKey="kinder:dailyReports.classHint" />}
          title={<Trans i18nKey="kinder:dailyReports.classTitle" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:dailyReports.student" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:dailyReports.mood" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:dailyReports.teacherNote" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:dailyReports.status" />
                </th>
                <th className="px-4 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {roster.map((student, index) => (
                <tr key={student.studentId}>
                  <td className="px-4 py-3">
                    <FormField
                      control={form.control}
                      name={`reports.${index}.studentId`}
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
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
                            <Input {...field} className="h-8 w-[140px]" />
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
                            <Input {...field} className="h-8 min-w-[200px]" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        student.report?.status === 'published'
                          ? 'success'
                          : student.report
                            ? 'info'
                            : 'muted'
                      }
                    >
                      <Trans
                        i18nKey={
                          student.report?.status === 'published'
                            ? 'kinder:dailyReports.published'
                            : student.report
                              ? 'kinder:dailyReports.draft'
                              : 'kinder:dailyReports.stats.missing'
                        }
                      />
                    </StatusBadge>
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
        </DataTableCard>
      </form>
    </Form>
  );
}
