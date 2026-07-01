'use client';

import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

const TONE_CLASS = {
  default: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthCalendar({
  events,
  className,
  onDateSelect,
}: {
  events: CalendarEvent[];
  className?: string;
  onDateSelect?: (date: string) => void;
}) {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }

    return map;
  }, [events]);

  const totalDays = daysInMonth(current);
  const firstWeekday = current.getDay();
  const monthLabel = current.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const cells: Array<{ day: number | null; dateKey: string | null }> = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, dateKey: null });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateKey = `${formatMonthKey(current)}-${String(day).padStart(2, '0')}`;
    cells.push({ day, dateKey });
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className={cn('kinder-month-calendar', className)}>
      <header className="kinder-month-calendar__header">
        <h3 className="text-foreground text-base font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <div className="kinder-month-calendar__grid">
        {weekDays.map((day) => (
          <div className="kinder-month-calendar__weekday" key={day}>
            {day}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell.day || !cell.dateKey) {
            return (
              <div
                className="kinder-month-calendar__cell kinder-month-calendar__cell--empty"
                key={`empty-${index}`}
              />
            );
          }

          const dayEvents = eventsByDate.get(cell.dateKey) ?? [];
          const isSelected = selected === cell.dateKey;
          const isToday =
            cell.dateKey === new Date().toISOString().slice(0, 10);

          return (
            <button
              className={cn(
                'kinder-month-calendar__cell',
                isSelected && 'kinder-month-calendar__cell--selected',
                isToday && 'kinder-month-calendar__cell--today',
              )}
              key={cell.dateKey}
              onClick={() => {
                setSelected(cell.dateKey);
                onDateSelect?.(cell.dateKey);
              }}
              type="button"
            >
              <span className="kinder-month-calendar__day">{cell.day}</span>
              {dayEvents.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <span
                      className={cn(
                        'kinder-month-calendar__dot',
                        TONE_CLASS[event.tone ?? 'default'],
                      )}
                      key={event.id}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="text-muted-foreground text-[10px]">
                      +{dayEvents.length - 2}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {selected && eventsByDate.get(selected)?.length ? (
        <div className="kinder-month-calendar__events">
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
            <Trans i18nKey="kinder:calendar.eventsOnDate" />
          </p>
          <ul className="space-y-2">
            {eventsByDate.get(selected)?.map((event) => (
              <li
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  TONE_CLASS[event.tone ?? 'default'],
                )}
                key={event.id}
              >
                {event.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
