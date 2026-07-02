'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCheck, LogIn, LogOut, UserX } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

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

import {
  DataTableCard,
  KinderSubmitButton,
  PanelEmpty,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { RecordClassAttendanceSchema } from '~/lib/kinder/attendance/schemas/attendance.schema';
import {
  checkInAction,
  checkOutAction,
  recordClassAttendanceAction,
} from '~/lib/kinder/attendance/server-actions';
import type {
  AttendanceStatus,
  ClassRosterStudent,
} from '~/lib/kinder/attendance/types';

const STATUSES = [
  'present',
  'absent',
  'late',
  'excused',
  'early_leave',
] as const satisfies readonly AttendanceStatus[];

const STATUS_TONE: Record<
  AttendanceStatus,
  'success' | 'warning' | 'danger' | 'info' | 'muted'
> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  excused: 'info',
  early_leave: 'muted',
};

function formatTime(iso: string | null | undefined) {
  if (!iso) {
    return '—';
  }

  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
  const defaultRecords = useMemo(
    () =>
      roster.map((student) => ({
        studentId: student.studentId,
        status: (student.record?.status ?? 'present') as AttendanceStatus,
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

  const saveAttendance = useKinderMutation({
    mutationFn: recordClassAttendanceAction,
    invalidateKeys: [kinderQueryKeys.attendance(schoolId)],
    toast: {
      success: 'Đã lưu điểm danh',
    },
  });

  const checkIn = useKinderMutation({
    mutationFn: checkInAction,
    invalidateKeys: [kinderQueryKeys.attendance(schoolId)],
    toast: {
      success: 'Đã ghi nhận vào lớp',
    },
  });

  const checkOut = useKinderMutation({
    mutationFn: checkOutAction,
    invalidateKeys: [kinderQueryKeys.attendance(schoolId)],
    toast: {
      success: 'Đã ghi nhận tan học',
    },
  });

  if (roster.length === 0) {
    return <PanelEmpty messageKey="kinder:attendance.emptyClass" />;
  }

  const setAllStatus = (status: AttendanceStatus) => {
    fields.forEach((_, index) => {
      form.setValue(`records.${index}.status`, status, { shouldDirty: true });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => saveAttendance.mutate(data))}
      >
        <DataTableCard
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setAllStatus('present')}
                size="sm"
                type="button"
                variant="outline"
              >
                <CheckCheck className="mr-1.5 size-4" />
                <Trans i18nKey="kinder:attendance.bulk.present" />
              </Button>
              <Button
                onClick={() => setAllStatus('absent')}
                size="sm"
                type="button"
                variant="outline"
              >
                <UserX className="mr-1.5 size-4" />
                <Trans i18nKey="kinder:attendance.bulk.absent" />
              </Button>
              <KinderSubmitButton
                loading={saveAttendance.isPending}
                size="sm"
              >
                <Trans i18nKey="kinder:attendance.save" />
              </KinderSubmitButton>
            </div>
          }
          description={<Trans i18nKey="kinder:attendance.dailyHint" />}
          title={<Trans i18nKey="kinder:attendance.dailyTitle" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:students.fullName" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:attendance.status" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:attendance.checkInTime" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:attendance.checkOutTime" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:attendance.lateMinutes" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <Trans i18nKey="kinder:attendance.quickActions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const student = roster[index]!;
                const currentStatus = form.watch(`records.${index}.status`);

                return (
                  <tr key={field.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{student.fullName}</p>
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
                                <SelectTrigger className="w-[150px]">
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
                      <div className="mt-1 md:hidden">
                        <StatusBadge tone={STATUS_TONE[currentStatus]}>
                          <Trans
                            i18nKey={`kinder:attendance.statuses.${currentStatus}`}
                          />
                        </StatusBadge>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 tabular-nums">
                      {formatTime(student.record?.check_in_at)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 tabular-nums">
                      {formatTime(student.record?.check_out_at)}
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
                                disabled={currentStatus !== 'late'}
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
                          disabled={checkIn.isPending}
                          onClick={() =>
                            checkIn.mutate({
                              schoolId,
                              classId,
                              studentId: student.studentId,
                              attendanceDate,
                            })
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <LogIn className="mr-1 size-3.5" />
                          <Trans i18nKey="kinder:attendance.checkIn" />
                        </Button>
                        <Button
                          disabled={checkOut.isPending}
                          onClick={() =>
                            checkOut.mutate({
                              schoolId,
                              classId,
                              studentId: student.studentId,
                              attendanceDate,
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <LogOut className="mr-1 size-3.5" />
                          <Trans i18nKey="kinder:attendance.checkOut" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableCard>
      </form>
    </Form>
  );
}
