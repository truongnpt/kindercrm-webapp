'use client';

import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { Tabs, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  kinderQueryKeys,
  PanelEmpty,
  StatusBadge,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateLeaveRequestSchema } from '~/lib/kinder/attendance/schemas/attendance.schema';
import {
  createLeaveRequestAction,
  reviewLeaveRequestAction,
} from '~/lib/kinder/attendance/server-actions';
import type { LeaveRequestWithStudent } from '~/lib/kinder/attendance/types';

const STATUS_TONE: Record<
  LeaveRequestWithStudent['status'],
  'default' | 'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

type LeaveFilter = 'pending' | 'all' | 'approved' | 'rejected';

export function LeaveRequestsPanel({
  schoolId,
  leaveRequests,
  students,
}: {
  schoolId: string;
  leaveRequests: LeaveRequestWithStudent[];
  students: Array<{
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LeaveFilter>('pending');

  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return leaveRequests;
    }

    return leaveRequests.filter((request) => request.status === filter);
  }, [filter, leaveRequests]);

  const form = useForm({
    resolver: zodResolver(CreateLeaveRequestSchema),
    defaultValues: {
      schoolId,
      studentId: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      reason: '',
    },
  });

  const createLeave = useKinderMutation({
    mutationFn: createLeaveRequestAction,
    invalidateKeys: [kinderQueryKeys.attendance(schoolId)],
    toast: { success: 'Đã tạo đơn nghỉ' },
  });

  const reviewLeave = useKinderMutation({
    mutationFn: reviewLeaveRequestAction,
    invalidateKeys: [kinderQueryKeys.attendance(schoolId)],
    toast: { success: 'Đã xử lý đơn' },
  });

  return (
    <DataTableCard
      actions={
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              <Trans i18nKey="kinder:attendance.leave.create" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="kinder:attendance.leave.create" />
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (data) => {
                  await createLeave.mutateAsync(data);
                  form.reset({ ...form.getValues(), studentId: '', reason: '' });
                  setOpen(false);
                })}
              >
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.invoices.student" />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name} ({student.student_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:attendance.leave.startDate" />
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required />
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
                          <Trans i18nKey="kinder:attendance.leave.endDate" />
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required />
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
                        <Trans i18nKey="kinder:attendance.leave.reason" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full"
                  disabled={createLeave.isPending}
                  type="submit"
                >
                  <Trans i18nKey="kinder:attendance.leave.submit" />
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      }
      description={<Trans i18nKey="kinder:attendance.leave.description" />}
      title={<Trans i18nKey="kinder:attendance.leave.title" />}
      toolbar={
        <Tabs
          onValueChange={(value) => setFilter(value as LeaveFilter)}
          value={filter}
        >
          <TabsList>
            <TabsTrigger value="pending">
              <Trans i18nKey="kinder:attendance.leave.filters.pending" />
            </TabsTrigger>
            <TabsTrigger value="approved">
              <Trans i18nKey="kinder:attendance.leave.filters.approved" />
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <Trans i18nKey="kinder:attendance.leave.filters.rejected" />
            </TabsTrigger>
            <TabsTrigger value="all">
              <Trans i18nKey="kinder:attendance.leave.filters.all" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {filteredRequests.length === 0 ? (
        <div className="p-6">
          <PanelEmpty messageKey="kinder:attendance.leave.empty" />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:students.fullName" />
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:attendance.leave.period" />
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:attendance.leave.reason" />
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:attendance.status" />
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <Trans i18nKey="kinder:attendance.quickActions" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{request.student.full_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {request.student.class_name ?? request.student.student_code}
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {request.start_date} → {request.end_date}
                </td>
                <td className="text-muted-foreground max-w-[240px] truncate px-4 py-3">
                  {request.reason ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[request.status]}>
                    <Trans
                      i18nKey={`kinder:attendance.leave.statuses.${request.status}`}
                    />
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  {request.status === 'pending' ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        disabled={reviewLeave.isPending}
                        onClick={() =>
                          reviewLeave.mutate({
                            schoolId,
                            leaveRequestId: request.id,
                            status: 'approved',
                          })
                        }
                        size="sm"
                        type="button"
                      >
                        <Trans i18nKey="kinder:attendance.leave.approve" />
                      </Button>
                      <Button
                        disabled={reviewLeave.isPending}
                        onClick={() =>
                          reviewLeave.mutate({
                            schoolId,
                            leaveRequestId: request.id,
                            status: 'rejected',
                          })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trans i18nKey="kinder:attendance.leave.reject" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DataTableCard>
  );
}
