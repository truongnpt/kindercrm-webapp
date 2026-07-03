export const CALENDAR_EVENT_CATEGORIES = [
  'learning_activity',
  'event',
  'holiday',
  'parent_meeting',
  'health_checkup',
  'other',
] as const;

export type CalendarEventCategory = (typeof CALENDAR_EVENT_CATEGORIES)[number];

export type SchoolCalendarEvent = {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  category: CalendarEventCategory;
  scope_type: CalendarEventScope;
  campus_id: string | null;
  class_id: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  remind_days_before: number | null;
  notify_on_create: boolean;
};

export type CalendarEventScope = 'school' | 'campus' | 'class';

export const CALENDAR_CATEGORY_TONES = {
  learning_activity: 'info',
  event: 'default',
  holiday: 'success',
  parent_meeting: 'warning',
  health_checkup: 'danger',
  other: 'default',
} as const;
