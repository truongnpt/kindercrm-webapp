'use client';

import { useMemo } from 'react';

import { CalendarDays } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { MonthCalendar } from '~/components/kinder-ui';
import { ParentEmptyState } from '~/components/parent-portal';
import { expandCalendarEventsForDisplay } from '~/lib/kinder/calendar/display';
import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';

import { ParentCalendarEventCard } from './parent-calendar-event-card';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function eventOnDate(event: SchoolCalendarEvent, date: string) {
  const start = toDateKey(event.starts_at);
  const end = toDateKey(event.ends_at);

  return date >= start && date <= end;
}

export function ParentCalendarWorkspace({
  events,
  month,
  selectedDate,
}: {
  events: SchoolCalendarEvent[];
  month: string;
  selectedDate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const calendarEvents = useMemo(
    () => expandCalendarEventsForDisplay(events),
    [events],
  );

  const visibleEvents = useMemo(() => {
    if (selectedDate) {
      return events.filter((event) => eventOnDate(event, selectedDate));
    }

    return events;
  }, [events, selectedDate]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="parent-portal-card-lg p-4">
        <MonthCalendar
          events={calendarEvents}
          initialMonth={month}
          onDateSelect={(date) => updateParams({ date })}
          onMonthChange={(monthKey) =>
            updateParams({ month: monthKey, date: null })
          }
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {selectedDate ? (
              <Trans
                i18nKey="kinder:calendar.eventsOnDate"
                values={{ date: selectedDate }}
              />
            ) : (
              <Trans i18nKey="kinder:parent.calendar.eventsTitle" />
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:parent.calendar.eventsHint" />
          </p>
        </div>

        {visibleEvents.length === 0 ? (
          <ParentEmptyState
            descriptionKey="kinder:parent.calendar.emptyDescription"
            icon={CalendarDays}
            titleKey="kinder:parent.calendar.empty"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleEvents.map((event) => (
              <ParentCalendarEventCard event={event} key={event.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
