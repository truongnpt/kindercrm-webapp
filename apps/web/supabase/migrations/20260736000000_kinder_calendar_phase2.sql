/*
 * EPIC-022 Calendar Management — Phase 2
 * Reminders, notification category, optional reminder lead time
 */

alter type public.notification_category add value if not exists 'calendar';

alter table public.calendar_events
  add column if not exists remind_days_before smallint,
  add column if not exists notify_on_create boolean not null default true;

alter table public.calendar_events
  add constraint calendar_events_remind_days_check
  check (remind_days_before is null or remind_days_before between 0 and 30);
