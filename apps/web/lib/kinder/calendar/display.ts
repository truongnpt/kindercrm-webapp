import type { CalendarEvent } from '~/components/kinder-ui/month-calendar';
import type { DayAgendaEvent } from '~/components/kinder-ui/day-agenda';
import type { WeekCalendarEvent } from '~/components/kinder-ui/week-calendar';

import { CALENDAR_CATEGORY_TONES, type SchoolCalendarEvent } from './types';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function toTimeKey(iso: string) {
  const date = new Date(iso);

  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function eachDateInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatEventTimeLabel(event: SchoolCalendarEvent) {
  if (event.all_day) {
    return 'All day';
  }

  const start = toTimeKey(event.starts_at);
  const end = toTimeKey(event.ends_at);

  if (start === end) {
    return start;
  }

  return `${start}–${end}`;
}

export function expandCalendarEventsForDisplay(
  events: SchoolCalendarEvent[],
): CalendarEvent[] {
  return events.flatMap((event) => {
    const startDate = toDateKey(event.starts_at);
    const endDate = toDateKey(event.ends_at);
    const tone = CALENDAR_CATEGORY_TONES[event.category];
    const dates = eachDateInRange(startDate, endDate);

    return dates.map((date) => ({
      id: `${event.id}-${date}`,
      date,
      title: event.title,
      tone,
    }));
  });
}

export function expandWeekCalendarEvents(
  events: SchoolCalendarEvent[],
  rangeStart: string,
  rangeEnd: string,
): WeekCalendarEvent[] {
  return events.flatMap((event) => {
    const startDate = toDateKey(event.starts_at);
    const endDate = toDateKey(event.ends_at);
    const tone = CALENDAR_CATEGORY_TONES[event.category];
    const dates = eachDateInRange(startDate, endDate).filter(
      (date) => date >= rangeStart && date <= rangeEnd,
    );

    return dates.map((date) => ({
      id: `${event.id}-${date}`,
      date,
      title: event.title,
      tone,
      timeLabel: formatEventTimeLabel(event),
    }));
  });
}

export function buildDayAgendaEvents(
  events: SchoolCalendarEvent[],
  date: string,
): DayAgendaEvent[] {
  return events
    .filter((event) => {
      const start = toDateKey(event.starts_at);
      const end = toDateKey(event.ends_at);

      return date >= start && date <= end;
    })
    .map((event) => ({
      id: event.id,
      title: event.title,
      tone: CALENDAR_CATEGORY_TONES[event.category],
      timeLabel: formatEventTimeLabel(event),
      description: event.description,
    }));
}
