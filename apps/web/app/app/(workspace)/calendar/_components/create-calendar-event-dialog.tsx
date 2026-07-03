'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { z } from 'zod';

import { CreateCalendarEventSchema } from '~/lib/kinder/calendar/schemas/calendar.schema';
import { createCalendarEventAction } from '~/lib/kinder/calendar/server-actions';

import { CalendarEventFormFields, type CalendarEventFormValues } from './calendar-event-form-fields';

type CreateCalendarEventFormValues = z.infer<typeof CreateCalendarEventSchema>;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateCalendarEventDialog({
  schoolId,
  defaultDate,
  campuses,
  classes,
  teacherClassOnly = false,
}: {
  schoolId: string;
  defaultDate?: string;
  campuses: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  teacherClassOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const date = defaultDate ?? todayString();

  const form = useForm<CreateCalendarEventFormValues>({
    resolver: zodResolver(CreateCalendarEventSchema) as never,
    defaultValues: {
      schoolId,
      title: '',
      description: '',
      category: 'event' as const,
      scopeType: teacherClassOnly ? 'class' : 'school',
      campusId: '',
      classId: teacherClassOnly ? (classes[0]?.id ?? '') : '',
      startDate: date,
      endDate: date,
      allDay: true,
      startTime: '08:00',
      endTime: '17:00',
      remindDaysBefore: 1,
      notifyOnCreate: true,
    },
  });

  const createEvent = useKinderMutation({
    mutationFn: createCalendarEventAction,
    invalidateKeys: [kinderQueryKeys.calendar.all(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        title: '',
        description: '',
        category: 'event',
        scopeType: teacherClassOnly ? 'class' : 'school',
        campusId: '',
        classId: teacherClassOnly ? (classes[0]?.id ?? '') : '',
        startDate: date,
        endDate: date,
        allDay: true,
        startTime: '08:00',
        endTime: '17:00',
        remindDaysBefore: 1,
        notifyOnCreate: true,
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:calendar.workspaceHint" />}
      footer={
        <KinderSubmitButton
          loading={createEvent.isPending}
          onClick={form.handleSubmit((data) => createEvent.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:calendar.create" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:calendar.create" />}
      trigger={
        <Button type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:calendar.create" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <CalendarEventFormFields
            campuses={campuses}
            classes={classes}
            form={form as unknown as UseFormReturn<CalendarEventFormValues>}
            teacherClassOnly={teacherClassOnly}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}
