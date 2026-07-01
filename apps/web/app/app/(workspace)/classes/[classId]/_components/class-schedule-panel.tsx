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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, PanelEmpty } from '~/components/kinder-ui';
import { CreateScheduleSchema } from '~/lib/kinder/classes/schemas/class.schema';
import { createScheduleAction } from '~/lib/kinder/classes/server-actions';
import type { ClassSchedule } from '~/lib/kinder/classes/types';

export function ClassSchedulePanel({
  classId,
  schoolId,
  schedules,
}: {
  classId: string;
  schoolId: string;
  schedules: ClassSchedule[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreateScheduleSchema),
    defaultValues: {
      classId,
      schoolId,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:00',
      label: 'Hoạt động buổi sáng',
    },
  });

  return (
    <div className="space-y-6">
      <DataTableCard
        description={<Trans i18nKey="kinder:classes.timetableHint" />}
        title={<Trans i18nKey="kinder:classes.timetable" />}
      >
        {schedules.length === 0 ? (
          <PanelEmpty messageKey="kinder:classes.noSchedule" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:classes.day" />
                </th>
                <th>
                  <Trans i18nKey="kinder:classes.activity" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:classes.time" />
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((slot) => (
                <tr key={slot.id}>
                  <td>
                    <Trans i18nKey={`kinder:classes.days.${slot.day_of_week}`} />
                  </td>
                  <td className="font-medium">{slot.label}</td>
                  <td className="text-muted-foreground text-right">
                    {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableCard>

      <Form {...form}>
        <form
          className="kinder-form-panel rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createScheduleAction(data);
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
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.day" />
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        <Trans i18nKey={`kinder:classes.days.${d}`} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.activity" />
                </FormLabel>
                <FormControl>
                  <Input className="rounded-lg" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.startTime" />
                </FormLabel>
                <FormControl>
                  <Input className="rounded-lg" type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.endTime" />
                </FormLabel>
                <FormControl>
                  <Input className="rounded-lg" type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button className="rounded-lg" type="submit">
              <Trans i18nKey="kinder:classes.addSlot" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
