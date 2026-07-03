'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, LogIn, LogOut, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import {
  BentoTile,
  BentoTileHeader,
  KinderFormDialog,
  KinderSubmitButton,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { StaffModulePermissions } from '~/lib/kinder/permissions';
import {
  staffCheckInAction,
  staffCheckOutAction,
  staffManualAttendanceAction,
} from '~/lib/kinder/staff/hr-server-actions';
import type { StaffAttendanceWithEmployee } from '~/lib/kinder/staff/hr-types';
import { StaffManualAttendanceSchema } from '~/lib/kinder/staff/schemas/hr.schema';
import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

function formatTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHours(minutes: number | null) {
  if (!minutes) {
    return '—';
  }

  return `${(minutes / 60).toFixed(1)}h`;
}

export function StaffAttendanceWorkspace({
  attendance,
  employees,
  schoolId,
  selectedDate,
  permissions,
}: {
  attendance: StaffAttendanceWithEmployee[];
  employees: StaffEmployeeListItem[];
  schoolId: string;
  selectedDate: string;
  permissions: StaffModulePermissions;
}) {
  const router = useRouter();
  const { t } = useTranslation('kinder');
  const [manualOpen, setManualOpen] = useState(false);
  const activeEmployees = employees.filter(
    (employee) => employee.employment_status === 'active',
  );

  const form = useForm({
    resolver: zodResolver(StaffManualAttendanceSchema),
    defaultValues: {
      schoolId,
      employeeId: activeEmployees[0]?.id ?? '',
      attendanceDate: selectedDate,
      checkInAt: '08:00',
      checkOutAt: '17:00',
      isLate: false,
      isEarlyLeave: false,
      notes: '',
    },
  });

  const manualMutation = useKinderMutation({
    mutationFn: staffManualAttendanceAction,
    onSuccess: () => {
      setManualOpen(false);
      router.refresh();
    },
  });

  const checkInMutation = useKinderMutation({
    mutationFn: staffCheckInAction,
    onSuccess: () => router.refresh(),
  });

  const checkOutMutation = useKinderMutation({
    mutationFn: staffCheckOutAction,
    onSuccess: () => router.refresh(),
  });

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.attendance.hint" />}
          title={<Trans i18nKey="kinder:staff.attendance.title" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-full sm:w-auto"
            onChange={(event) => {
              const params = new URLSearchParams(window.location.search);
              params.set('date', event.target.value);
              router.push(`?${params.toString()}`);
            }}
            type="date"
            value={selectedDate}
          />
          {permissions.canManageAttendance ? (
            <Button
              onClick={() => setManualOpen(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-1.5 size-4" />
              <Trans i18nKey="kinder:staff.attendance.manual" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {attendance.length > 0 ?
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.fullName" />
                  </th>
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.department" />
                  </th>
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.attendance.checkIn" />
                  </th>
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.attendance.checkOut" />
                  </th>
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.attendance.totalHours" />
                  </th>
                  <th className="px-2 py-3 font-medium">
                    <Trans i18nKey="kinder:staff.attendance.flags" />
                  </th>
                  {permissions.canManageAttendance ?
                    <th className="px-2 py-3 font-medium" />
                  : null}
                </tr>
              </thead>
              <tbody>
                {attendance.map((row) => (
                  <tr className="border-b border-border/60" key={row.id}>
                    <td className="px-2 py-3">
                      <p className="font-medium">{row.employee.full_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {row.employee.employee_code}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {row.employee.department?.name ?? '—'}
                    </td>
                    <td className="px-2 py-3">{formatTime(row.check_in_at)}</td>
                    <td className="px-2 py-3">{formatTime(row.check_out_at)}</td>
                    <td className="px-2 py-3 font-medium">
                      {formatHours(row.total_minutes)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.is_late ?
                          <Badge variant="secondary">
                            <Trans i18nKey="kinder:staff.attendance.late" />
                          </Badge>
                        : null}
                        {row.is_early_leave ?
                          <Badge variant="secondary">
                            <Trans i18nKey="kinder:staff.attendance.earlyLeave" />
                          </Badge>
                        : null}
                      </div>
                    </td>
                    {permissions.canManageAttendance ?
                      <td className="px-2 py-3">
                        {!row.check_out_at ?
                          <Button
                            disabled={checkOutMutation.isPending}
                            onClick={() =>
                              checkOutMutation.mutate({
                                schoolId,
                                attendanceId: row.id,
                                isEarlyLeave: false,
                              })
                            }
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <LogOut className="mr-1 size-4" />
                            <Trans i18nKey="kinder:staff.attendance.checkOutAction" />
                          </Button>
                        : null}
                      </td>
                    : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        : <PanelEmpty messageKey="kinder:staff.attendance.empty" />}

        {permissions.canManageAttendance && activeEmployees.length > 0 ?
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">
              <Trans i18nKey="kinder:staff.attendance.quickCheckIn" />
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeEmployees.map((employee) => {
                const existing = attendance.find(
                  (row) => row.employee_id === employee.id,
                );

                return (
                  <div
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-3"
                    key={employee.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{employee.full_name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {employee.employee_code}
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      disabled={
                        Boolean(existing?.check_in_at) ||
                        checkInMutation.isPending
                      }
                      onClick={() =>
                        checkInMutation.mutate({
                          schoolId,
                          employeeId: employee.id,
                          attendanceDate: selectedDate,
                        })
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <LogIn className="mr-1 size-4" />
                      <Trans i18nKey="kinder:staff.attendance.checkInAction" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        : null}
      </div>

      {permissions.canManageAttendance ?
        <KinderFormDialog
          onOpenChange={setManualOpen}
          open={manualOpen}
          size="md"
          title={<Trans i18nKey="kinder:staff.attendance.manual" />}
          footer={
            <KinderSubmitButton
              loading={manualMutation.isPending}
              onClick={form.handleSubmit((data) => manualMutation.mutate(data))}
              type="button"
            >
              <Trans i18nKey="kinder:staff.save" />
            </KinderSubmitButton>
          }
        >
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.fullName" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeEmployees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="checkInAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:staff.attendance.checkIn" />
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOutAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:staff.attendance.checkOut" />
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.notes" />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </KinderFormDialog>
      : null}
    </BentoTile>
  );
}
