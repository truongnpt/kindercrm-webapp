import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { CalendarEventCategory, SchoolCalendarEvent } from './types';

function monthBounds(month: string) {
  const start = `${month}-01`;
  const endDate = new Date(`${month}-01T00:00:00`);

  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  return {
    start,
    end: endDate.toISOString().slice(0, 10),
  };
}

export function getWeekStart(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;

  date.setDate(date.getDate() + offset);

  return date.toISOString().slice(0, 10);
}

export function getWeekEnd(weekStart: string) {
  const date = new Date(`${weekStart}T12:00:00`);

  date.setDate(date.getDate() + 6);

  return date.toISOString().slice(0, 10);
}

export type CalendarQueryRange = {
  start: string;
  end: string;
};

export type CalendarView = 'month' | 'week' | 'day';

export function resolveCalendarRange(params: {
  view?: string;
  month?: string;
  week?: string;
  date?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const view = (params.view ?? 'month') as CalendarView;

  if (view === 'day') {
    const date = params.date ?? today;

    return { start: date, end: date, view, anchor: date };
  }

  if (view === 'week') {
    const weekStart = params.week ?? getWeekStart(params.date ?? today);

    return {
      start: weekStart,
      end: getWeekEnd(weekStart),
      view,
      anchor: weekStart,
    };
  }

  const month = params.month ?? today.slice(0, 7);
  const { start, end } = monthBounds(month);

  return { start, end, view, anchor: month };
}

export function filterCalendarEvents(
  events: SchoolCalendarEvent[],
  filters: {
    classId?: string;
    category?: CalendarEventCategory;
  },
) {
  return events.filter((event) => {
    if (filters.category && event.category !== filters.category) {
      return false;
    }

    if (filters.classId) {
      if (event.scope_type === 'school') {
        return true;
      }

      if (event.scope_type === 'class') {
        return event.class_id === filters.classId;
      }

      return false;
    }

    return true;
  });
}

export const loadSchoolCalendarEvents = cache(
  async (schoolId: string, range: CalendarQueryRange) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('calendar_events')
      .select('*')
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .lte('starts_at', `${range.end}T23:59:59.999Z`)
      .gte('ends_at', `${range.start}T00:00:00.000Z`)
      .order('starts_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as SchoolCalendarEvent[];
  },
);

export const loadUpcomingCalendarEvents = cache(
  async (schoolId: string, limit = 5) => {
    const client = getSupabaseServerClient();
    const now = new Date().toISOString();

    const { data, error } = await client
      .from('calendar_events')
      .select('*')
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .gte('ends_at', now)
      .order('starts_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as SchoolCalendarEvent[];
  },
);
