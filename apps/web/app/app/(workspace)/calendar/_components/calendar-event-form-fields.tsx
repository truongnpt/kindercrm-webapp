'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

import { Checkbox } from '@kit/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

import type { CalendarEventFieldsSchema } from '~/lib/kinder/calendar/schemas/calendar.schema';
import { CALENDAR_EVENT_CATEGORIES } from '~/lib/kinder/calendar/types';

export type CalendarEventFormValues = z.infer<
  typeof CalendarEventFieldsSchema
> & {
  eventId?: string;
};

type CampusOption = {
  id: string;
  name: string;
};

type ClassOption = {
  id: string;
  name: string;
};

const REMINDER_OPTIONS = [null, 0, 1, 3, 7] as const;

export function CalendarEventFormFields({
  form,
  campuses = [],
  classes = [],
  teacherClassOnly = false,
}: {
  form: UseFormReturn<CalendarEventFormValues>;
  campuses?: CampusOption[];
  classes?: ClassOption[];
  teacherClassOnly?: boolean;
}) {
  const allDay = form.watch('allDay');
  const scopeType = form.watch('scopeType');

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:calendar.eventTitle" />
            </FormLabel>
            <FormControl>
              <Input {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:calendar.category" />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CALENDAR_EVENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    <Trans i18nKey={`kinder:calendar.categories.${category}`} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scopeType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:calendar.scope" />
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);

                if (value !== 'campus') {
                  form.setValue('campusId', '');
                }

                if (value !== 'class') {
                  form.setValue('classId', '');
                }
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {!teacherClassOnly ? (
                  <SelectItem value="school">
                    <Trans i18nKey="kinder:calendar.scopes.school" />
                  </SelectItem>
                ) : null}
                {!teacherClassOnly && campuses.length > 0 ? (
                  <SelectItem value="campus">
                    <Trans i18nKey="kinder:calendar.scopes.campus" />
                  </SelectItem>
                ) : null}
                {classes.length > 0 ? (
                  <SelectItem value="class">
                    <Trans i18nKey="kinder:calendar.scopes.class" />
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {scopeType === 'campus' ? (
        <FormField
          control={form.control}
          name="campusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:calendar.campus" />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      {scopeType === 'class' ? (
        <FormField
          control={form.control}
          name="classId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:calendar.class" />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:calendar.startDate" />
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:calendar.endDate" />
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="allDay"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <FormLabel className="font-normal">
              <Trans i18nKey="kinder:calendar.allDay" />
            </FormLabel>
          </FormItem>
        )}
      />

      {!allDay ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:calendar.startTime" />
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:calendar.endTime" />
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="remindDaysBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:calendar.remindDaysBefore" />
              </FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? null : Number(value))
                }
                value={
                  field.value === null || field.value === undefined
                    ? 'none'
                    : String(field.value)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REMINDER_OPTIONS.map((option) => (
                    <SelectItem
                      key={option === null ? 'none' : String(option)}
                      value={option === null ? 'none' : String(option)}
                    >
                      {option === null ? (
                        <Trans i18nKey="kinder:calendar.reminderNone" />
                      ) : option === 0 ? (
                        <Trans i18nKey="kinder:calendar.reminderSameDay" />
                      ) : (
                        <Trans
                          i18nKey="kinder:calendar.reminderDaysBefore"
                          values={{ days: option }}
                        />
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notifyOnCreate"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <FormLabel className="font-normal">
              <Trans i18nKey="kinder:calendar.notifyOnCreate" />
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:students.notes" />
            </FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
