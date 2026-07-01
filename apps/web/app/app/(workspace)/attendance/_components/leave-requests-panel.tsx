'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateLeaveRequestSchema } from '~/lib/kinder/attendance/schemas/attendance.schema';
import {
  createLeaveRequestAction,
  reviewLeaveRequestAction,
} from '~/lib/kinder/attendance/server-actions';
import type { LeaveRequestWithStudent } from '~/lib/kinder/attendance/types';

const STATUS_VARIANT: Record<
  LeaveRequestWithStudent['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

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
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
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
                  const promise = createLeaveRequestAction(data);
                  toast.promise(promise, {
                    loading: t('schoolSettings.saving'),
                    success: t('attendance.leave.created'),
                    error: t('common:genericServerError', { ns: 'common' }),
                  });
                  await promise;
                  form.reset();
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <Button className="w-full" type="submit">
                  <Trans i18nKey="kinder:attendance.leave.submit" />
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {leaveRequests.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:attendance.leave.empty" />
        </p>
      ) : (
        <div className="space-y-3">
          {leaveRequests.map((request) => (
            <div className="rounded-lg border p-4" key={request.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{request.student.full_name}</p>
                  <p className="text-muted-foreground text-sm">
                    {request.start_date} → {request.end_date}
                  </p>
                  {request.reason ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {request.reason}
                    </p>
                  ) : null}
                </div>
                <Badge variant={STATUS_VARIANT[request.status]}>
                  <Trans
                    i18nKey={`kinder:attendance.leave.statuses.${request.status}`}
                  />
                </Badge>
              </div>

              {request.status === 'pending' ? (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={async () => {
                      const promise = reviewLeaveRequestAction({
                        schoolId,
                        leaveRequestId: request.id,
                        status: 'approved',
                      });
                      toast.promise(promise, {
                        loading: t('schoolSettings.saving'),
                        success: t('attendance.leave.reviewed'),
                        error: t('common:genericServerError', { ns: 'common' }),
                      });
                      await promise;
                    }}
                    size="sm"
                    type="button"
                  >
                    <Trans i18nKey="kinder:attendance.leave.approve" />
                  </Button>
                  <Button
                    onClick={async () => {
                      const promise = reviewLeaveRequestAction({
                        schoolId,
                        leaveRequestId: request.id,
                        status: 'rejected',
                      });
                      toast.promise(promise, {
                        loading: t('schoolSettings.saving'),
                        success: t('attendance.leave.reviewed'),
                        error: t('common:genericServerError', { ns: 'common' }),
                      });
                      await promise;
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trans i18nKey="kinder:attendance.leave.reject" />
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
