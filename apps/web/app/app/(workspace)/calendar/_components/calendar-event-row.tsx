'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash2 } from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpdateCalendarEventSchema } from '~/lib/kinder/calendar/schemas/calendar.schema';
import {
  deleteCalendarEventAction,
  updateCalendarEventAction,
} from '~/lib/kinder/calendar/server-actions';
import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';
import { CALENDAR_CATEGORY_TONES } from '~/lib/kinder/calendar/types';
import type { z } from 'zod';

import type { CalendarEventFormValues } from './calendar-event-form-fields';
import { CalendarEventFormFields } from './calendar-event-form-fields';

type UpdateCalendarEventFormValues = z.infer<typeof UpdateCalendarEventSchema>;

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function toTimeKey(iso: string) {
  const date = new Date(iso);

  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

export function CalendarEventRow({
  event,
  schoolId,
  canManage,
  scopeLabel,
  campuses,
  classes,
  teacherClassOnly,
}: {
  event: SchoolCalendarEvent;
  schoolId: string;
  canManage: boolean;
  scopeLabel?: string;
  campuses: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  classMap: Map<string, string>;
  teacherClassOnly: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<UpdateCalendarEventFormValues>({
    resolver: zodResolver(UpdateCalendarEventSchema) as never,
    defaultValues: {
      schoolId,
      eventId: event.id,
      title: event.title,
      description: event.description ?? '',
      category: event.category,
      scopeType: event.scope_type,
      campusId: event.campus_id ?? '',
      classId: event.class_id ?? '',
      startDate: toDateKey(event.starts_at),
      endDate: toDateKey(event.ends_at),
      allDay: event.all_day,
      startTime: toTimeKey(event.starts_at),
      endTime: toTimeKey(event.ends_at),
      remindDaysBefore: event.remind_days_before,
      notifyOnCreate: event.notify_on_create,
    },
  });

  const updateEvent = useKinderMutation({
    mutationFn: updateCalendarEventAction,
    invalidateKeys: [kinderQueryKeys.calendar.all(schoolId)],
    onSuccess: () => setEditOpen(false),
  });

  const deleteEvent = useKinderMutation({
    mutationFn: deleteCalendarEventAction,
    invalidateKeys: [kinderQueryKeys.calendar.all(schoolId)],
    onSuccess: () => setDeleteOpen(false),
  });

  const tone = CALENDAR_CATEGORY_TONES[event.category];

  return (
    <>
      <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{event.title}</p>
            <Badge
              className="rounded-full"
              variant={tone === 'danger' ? 'destructive' : 'secondary'}
            >
              <Trans i18nKey={`kinder:calendar.categories.${event.category}`} />
            </Badge>
            <Badge className="rounded-full" variant="outline">
              <Trans i18nKey={`kinder:calendar.scopes.${event.scope_type}`} />
              {scopeLabel ? `: ${scopeLabel}` : ''}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {toDateKey(event.starts_at)}
            {toDateKey(event.ends_at) !== toDateKey(event.starts_at)
              ? ` → ${toDateKey(event.ends_at)}`
              : ''}
            {!event.all_day
              ? ` · ${toTimeKey(event.starts_at)}–${toTimeKey(event.ends_at)}`
              : null}
          </p>
          {event.description ? (
            <p className="text-muted-foreground mt-2 text-sm">{event.description}</p>
          ) : null}
        </div>

        {canManage ? (
          <div className="flex shrink-0 gap-1">
            <Button
 aria-label="Edit event"
 onClick={() => setEditOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
 aria-label="Delete event"
 onClick={() => setDeleteOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <KinderFormDialog
        footer={
          <KinderSubmitButton
            loading={updateEvent.isPending}
            onClick={form.handleSubmit((data) => updateEvent.mutate(data))}
            type="button"
          >
            <Trans i18nKey="common:save" />
          </KinderSubmitButton>
        }
        onOpenChange={setEditOpen}
        open={editOpen}
        size="lg"
        title={<Trans i18nKey="kinder:calendar.edit" />}
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

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="kinder:calendar.delete" />}
        description={<Trans i18nKey="kinder:calendar.deleteConfirm" />}
        onConfirm={() =>
          deleteEvent.mutate({ schoolId, eventId: event.id })
        }
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteEvent.isPending}
        title={<Trans i18nKey="kinder:calendar.delete" />}
      />
    </>
  );
}
