'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { RecordClassAttendanceSchema } from '~/lib/kinder/attendance/schemas/attendance.schema';
import {
  checkInAction,
  checkOutAction,
  recordClassAttendanceAction,
} from '~/lib/kinder/attendance/server-actions';
import type { ClassRosterStudent } from '~/lib/kinder/attendance/types';

const STATUSES = [
  'present',
  'absent',
  'late',
  'excused',
  'early_leave',
] as const;

export function DailyAttendancePanel({
  schoolId,
  classId,
  attendanceDate,
  roster,
}: {
  schoolId: string;
  classId: string;
  attendanceDate: string;
  roster: ClassRosterStudent[];
}) {
  const { t } = useTranslation('kinder');

  const defaultRecords = useMemo(
    () =>
      roster.map((student) => ({
        studentId: student.studentId,
        status: (student.record?.status ?? 'present') as (typeof STATUSES)[number],
        checkInAt: student.record?.check_in_at
          ? student.record.check_in_at.slice(0, 16)
          : '',
        checkOutAt: student.record?.check_out_at
          ? student.record.check_out_at.slice(0, 16)
          : '',
        lateMinutes: student.record?.late_minutes ?? 0,
        notes: student.record?.notes ?? '',
      })),
    [roster],
  );

  const form = useForm({
    resolver: zodResolver(RecordClassAttendanceSchema),
    defaultValues: {
      schoolId,
      classId,
      attendanceDate,
      records: defaultRecords,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'records',
  });

  if (roster.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:attendance.emptyClass" />
      </p>
    );
  }

  const presentCount = roster.filter(
    (s) => s.record?.status === 'present' || s.record?.status === 'late',
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          <Trans
            i18nKey="kinder:attendance.summary.enrolled"
            values={{ count: roster.length }}
          />
        </Badge>
        <Badge>
          <Trans
            i18nKey="kinder:attendance.summary.marked"
            values={{ count: roster.filter((s) => s.record).length }}
          />
        </Badge>
        <Badge variant="outline">
          <Trans
            i18nKey="kinder:attendance.summary.present"
            values={{ count: presentCount }}
          />
        </Badge>
      </div>

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = recordClassAttendanceAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('attendance.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    <Trans i18nKey="kinder:students.fullName" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <Trans i18nKey="kinder:attendance.status" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <Trans i18nKey="kinder:attendance.lateMinutes" />
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <Trans i18nKey="kinder:attendance.quickActions" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fields.map((field, index) => {
                  const student = roster[index]!;

                  return (
                    <tr key={field.id}>
                      <td className="px-4 py-3">
                        <p>{student.fullName}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {student.studentCode}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <FormField
                          control={form.control}
                          name={`records.${index}.status`}
                          render={({ field: statusField }) => (
                            <FormItem>
                              <Select
                                onValueChange={statusField.onChange}
                                value={statusField.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      <Trans
                                        i18nKey={`kinder:attendance.statuses.${status}`}
                                      />
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FormField
                          control={form.control}
                          name={`records.${index}.lateMinutes`}
                          render={({ field: lateField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-20"
                                  min={0}
                                  type="number"
                                  {...lateField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            onClick={async () => {
                              const promise = checkInAction({
                                schoolId,
                                classId,
                                studentId: student.studentId,
                                attendanceDate,
                              });
                              toast.promise(promise, {
                                loading: t('schoolSettings.saving'),
                                success: t('attendance.checkInDone'),
                                error: t('common:genericServerError', {
                                  ns: 'common',
                                }),
                              });
                              await promise;
                            }}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Trans i18nKey="kinder:attendance.checkIn" />
                          </Button>
                          <Button
                            onClick={async () => {
                              const promise = checkOutAction({
                                schoolId,
                                classId,
                                studentId: student.studentId,
                                attendanceDate,
                              });
                              toast.promise(promise, {
                                loading: t('schoolSettings.saving'),
                                success: t('attendance.checkOutDone'),
                                error: t('common:genericServerError', {
                                  ns: 'common',
                                }),
                              });
                              await promise;
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <Trans i18nKey="kinder:attendance.checkOut" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button type="submit">
            <Trans i18nKey="kinder:attendance.save" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
