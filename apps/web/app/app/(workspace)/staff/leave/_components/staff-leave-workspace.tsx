'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { DatePicker } from '@kit/ui/date-picker';
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
  createStaffLeaveRequestAction,
  reviewStaffLeaveRequestAction,
} from '~/lib/kinder/staff/hr-server-actions';
import type { StaffLeaveRequestWithEmployee } from '~/lib/kinder/staff/hr-types';
import { CreateStaffLeaveRequestSchema } from '~/lib/kinder/staff/schemas/hr.schema';
import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700',
  approved: 'bg-emerald-500/10 text-emerald-700',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export function StaffLeaveWorkspace({
  requests,
  employees,
  schoolId,
  permissions,
  statusFilter,
}: {
  requests: StaffLeaveRequestWithEmployee[];
  employees: StaffEmployeeListItem[];
  schoolId: string;
  permissions: StaffModulePermissions;
  statusFilter: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activeEmployees = employees.filter(
    (employee) => employee.employment_status === 'active',
  );

  const form = useForm({
    resolver: zodResolver(CreateStaffLeaveRequestSchema),
    defaultValues: {
      schoolId,
      employeeId: activeEmployees[0]?.id ?? '',
      leaveType: 'annual' as const,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      reason: '',
    },
  });

  const createMutation = useKinderMutation({
    mutationFn: createStaffLeaveRequestAction,
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
  });

  const reviewMutation = useKinderMutation({
    mutationFn: reviewStaffLeaveRequestAction,
    onSuccess: () => router.refresh(),
  });

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:staff.leave.hint" />}
          title={<Trans i18nKey="kinder:staff.leave.title" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={(value) => {
              const params = new URLSearchParams(window.location.search);
              params.set('status', value);
              router.push(`?${params.toString()}`);
            }}
            value={statusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Trans i18nKey="kinder:staff.leave.filterAll" />
              </SelectItem>
              <SelectItem value="pending">
                <Trans i18nKey="kinder:staff.leave.statuses.pending" />
              </SelectItem>
              <SelectItem value="approved">
                <Trans i18nKey="kinder:staff.leave.statuses.approved" />
              </SelectItem>
              <SelectItem value="rejected">
                <Trans i18nKey="kinder:staff.leave.statuses.rejected" />
              </SelectItem>
            </SelectContent>
          </Select>
          {permissions.canViewLeave ?
            <Button onClick={() => setOpen(true)} size="sm" type="button">
              <Plus className="mr-1.5 size-4" />
              <Trans i18nKey="kinder:staff.leave.create" />
            </Button>
          : null}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {requests.length > 0 ?
          <ul className="flex flex-col gap-3">
            {requests.map((request) => (
              <li
                className="rounded-2xl border border-border bg-muted/20 p-4"
                key={request.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.employee.full_name}</p>
                      <Badge
                        className={cn(
                          'rounded-full border-0',
                          STATUS_TONE[request.status],
                        )}
                      >
                        <Trans
                          i18nKey={`kinder:staff.leave.statuses.${request.status}`}
                        />
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      <Trans
                        i18nKey={`kinder:staff.leave.types.${request.leave_type}`}
                      />
                      {' · '}
                      {request.start_date} → {request.end_date}
                      {' · '}
                      <Trans
                        i18nKey="kinder:staff.leave.daysCount"
                        values={{ count: request.days_count }}
                      />
                    </p>
                    {request.reason ?
                      <p className="text-muted-foreground mt-2 text-sm">
                        {request.reason}
                      </p>
                    : null}
                  </div>
                  {permissions.canManageLeave &&
                  request.status === 'pending' ?
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            schoolId,
                            requestId: request.id,
                            status: 'approved',
                          })
                        }
                        size="sm"
                        type="button"
                      >
                        <Trans i18nKey="kinder:staff.leave.approve" />
                      </Button>
                      <Button
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            schoolId,
                            requestId: request.id,
                            status: 'rejected',
                          })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trans i18nKey="kinder:staff.leave.reject" />
                      </Button>
                    </div>
                  : null}
                </div>
              </li>
            ))}
          </ul>
        : <PanelEmpty messageKey="kinder:staff.leave.empty" />}
      </div>

      <KinderFormDialog
        onOpenChange={setOpen}
        open={open}
        size="md"
        title={<Trans i18nKey="kinder:staff.leave.create" />}
        footer={
          <KinderSubmitButton
            loading={createMutation.isPending}
            onClick={form.handleSubmit((data) => createMutation.mutate(data))}
            type="button"
          >
            <Trans i18nKey="kinder:staff.leave.submit" />
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
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.leave.type" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['annual', 'sick', 'unpaid', 'other'] as const).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            <Trans i18nKey={`kinder:staff.leave.types.${type}`} />
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.leave.startDate" />
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.leave.endDate" />
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.leave.reason" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </KinderFormDialog>
    </BentoTile>
  );
}
