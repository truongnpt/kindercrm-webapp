'use client';

import { useMemo } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { addDays, CALENDAR_TONE_CLASS, type CalendarTone } from './calendar-shared';

export type WeekCalendarEvent = {
  id: string;
  date: string;
  title: string;
  tone?: CalendarTone;
  timeLabel?: string;
};

export function WeekCalendar({
  events,
  weekStart,
  className,
  selectedDate,
  onDateSelect,
  onWeekChange,
}: {
  events: WeekCalendarEvent[];
  weekStart: string;
  className?: string;
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  onWeekChange?: (weekStart: string) => void;
}) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, WeekCalendarEvent[]>();

    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }

    return map;
  }, [events]);

  const weekLabel = `${days[0]} → ${days[6]}`;

  return (
    <section className={cn('kinder-week-calendar', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-foreground text-base font-semibold">{weekLabel}</h3>
        <div className="flex items-center gap-1">
          <Button
 onClick={() => onWeekChange?.(addDays(weekStart, -7))}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
 onClick={() => onWeekChange?.(addDays(weekStart, 7))}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((dateKey) => {
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === new Date().toISOString().slice(0, 10);
          const weekday = new Date(`${dateKey}T12:00:00`).toLocaleDateString(
            undefined,
            { weekday: 'short' },
          );

          return (
            <button
              className={cn(
                'flex min-h-32 flex-col rounded-xl border border-border p-3 text-left transition-colors',
                isSelected && 'border-primary ring-1 ring-primary/30',
                isToday && 'bg-primary/5',
              )}
              key={dateKey}
              onClick={() => onDateSelect?.(dateKey)}
              type="button"
            >
              <div className="mb-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {weekday}
                </p>
                <p className="text-foreground text-sm font-semibold">{dateKey}</p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {dayEvents.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    <Trans i18nKey="kinder:calendar.noEventsDay" />
                  </p>
                ) : (
                  dayEvents.map((event) => (
                    <span
                      className={cn(
                        'truncate rounded-md px-2 py-1 text-xs font-medium',
                        CALENDAR_TONE_CLASS[event.tone ?? 'default'],
                      )}
                      key={event.id}
                      title={event.title}
                    >
                      {event.timeLabel ? `${event.timeLabel} ` : ''}
                      {event.title}
                    </span>
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
