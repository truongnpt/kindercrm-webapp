'use client';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';
import { CALENDAR_CATEGORY_TONES } from '~/lib/kinder/calendar/types';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function toTimeKey(iso: string) {
  const date = new Date(iso);

  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

export function ParentCalendarEventCard({
  event,
}: {
  event: SchoolCalendarEvent;
}) {
  const tone = CALENDAR_CATEGORY_TONES[event.category];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-foreground">{event.title}</p>
        <Badge
          className="rounded-full"
          variant={tone === 'danger' ? 'destructive' : 'secondary'}
        >
          <Trans i18nKey={`kinder:calendar.categories.${event.category}`} />
        </Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {toDateKey(event.starts_at)}
        {toDateKey(event.ends_at) !== toDateKey(event.starts_at)
          ? ` → ${toDateKey(event.ends_at)}`
          : ''}
        {!event.all_day
          ? ` · ${toTimeKey(event.starts_at)}–${toTimeKey(event.ends_at)}`
          : null}
      </p>
      {event.description ? (
        <p className="text-muted-foreground mt-2 text-sm">{event.description}</p>
      ) : null}
    </div>
  );
}
