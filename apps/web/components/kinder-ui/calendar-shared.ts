export const CALENDAR_TONE_CLASS = {
  default: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
} as const;

export type CalendarTone = keyof typeof CALENDAR_TONE_CLASS;

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);

  date.setDate(date.getDate() + days);

  return formatDateKey(date);
}
