'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarOff, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { DatePicker } from '@kit/ui/date-picker';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { ParentEmptyState, ParentSectionHeader } from '~/components/parent-portal';
import { ParentCreateLeaveRequestSchema } from '~/lib/kinder/parent/schemas/parent.schema';
import { createParentLeaveRequestAction } from '~/lib/kinder/parent/server-actions';

type LeaveRequestRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700',
  approved: 'bg-emerald-500/10 text-emerald-700',
  rejected: 'bg-destructive/10 text-destructive',
};

export function ParentLeavePanel({
  studentId,
  leaveRequests,
}: {
  studentId: string;
  leaveRequests: LeaveRequestRow[];
}) {
  const router = useRouter();
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm({
    resolver: zodResolver(ParentCreateLeaveRequestSchema),
    defaultValues: {
      studentId,
      startDate: today,
      endDate: today,
      reason: '',
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader
        action={
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <Button className="min-h-11" size="sm">
                <Plus data-icon="inline-start" />
                <Trans i18nKey="kinder:attendance.leave.create" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  <Trans i18nKey="kinder:attendance.leave.create" />
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={form.handleSubmit(async (values) => {
                    const promise = createParentLeaveRequestAction(values);
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('attendance.leave.created'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                    setOpen(false);
                    form.reset({
                      studentId,
                      startDate: today,
                      endDate: today,
                      reason: '',
                    });
                    router.refresh();
                  })}
                >
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:attendance.leave.startDate" />
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
                          <Trans i18nKey="kinder:attendance.leave.endDate" />
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
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:attendance.leave.reason" />
                        </FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button className="min-h-11 w-full" type="submit">
                    <Trans i18nKey="kinder:attendance.leave.submit" />
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
        description={<Trans i18nKey="kinder:parent.leave.hint" />}
        title={<Trans i18nKey="kinder:parent.tabs.leave" />}
      />

      {leaveRequests.length === 0 ? (
        <ParentEmptyState
          descriptionKey="kinder:parent.leave.empty"
          icon={CalendarOff}
          titleKey="kinder:parent.tabs.leave"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {leaveRequests.map((request) => (
            <div
              className="rounded-xl border border-border bg-muted/40 p-4"
              key={request.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {request.start_date}
                    {request.end_date !== request.start_date
                      ? ` → ${request.end_date}`
                      : ''}
                  </p>
                  {request.reason ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {request.reason}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    STATUS_TONE[request.status] ?? 'bg-muted text-foreground',
                  )}
                >
                  <Trans
                    i18nKey={`kinder:attendance.leave.statuses.${request.status}`}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
