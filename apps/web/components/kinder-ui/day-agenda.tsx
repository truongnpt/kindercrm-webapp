'use client';

import { useMemo } from 'react';

import { CalendarDays } from 'lucide-react';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { CALENDAR_TONE_CLASS, type CalendarTone } from './calendar-shared';
import { EmptyState } from './empty-state';

export type DayAgendaEvent = {
  id: string;
  title: string;
  tone?: CalendarTone;
  timeLabel: string;
  description?: string | null;
};

export function DayAgenda({
  date,
  events,
  className,
}: {
  date: string;
  events: DayAgendaEvent[];
  className?: string;
}) {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel)),
    [events],
  );

  const weekday = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className={cn('kinder-day-agenda', className)}>
      <header className="mb-4">
        <h3 className="text-foreground text-base font-semibold">{weekday}</h3>
        <p className="text-muted-foreground text-sm">{date}</p>
      </header>

      {sortedEvents.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:calendar.emptyDescription"
          icon={CalendarDays}
          titleKey="kinder:calendar.noEventsDay"
        />
      ) : (
        <ol className="space-y-3">
          {sortedEvents.map((event) => (
            <li
              className="rounded-xl border border-border bg-card p-4"
              key={event.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    CALENDAR_TONE_CLASS[event.tone ?? 'default'],
                  )}
                >
                  {event.timeLabel}
                </span>
                <p className="font-semibold text-foreground">{event.title}</p>
              </div>
              {event.description ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {event.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
