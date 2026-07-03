'use client';

import Link from 'next/link';

import { CalendarDays, ChevronRight } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { BentoTile } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';
import { CALENDAR_CATEGORY_TONES } from '~/lib/kinder/calendar/types';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function formatEventDate(event: SchoolCalendarEvent) {
  const start = toDateKey(event.starts_at);
  const end = toDateKey(event.ends_at);

  if (end !== start) {
    return `${start} → ${end}`;
  }

  return start;
}

export function StaffUpcomingEvents({
  events,
}: {
  events: SchoolCalendarEvent[];
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <BentoTile className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              <Trans i18nKey="kinder:calendar.upcoming" />
            </h2>
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:calendar.upcomingHint" />
            </p>
          </div>
        </div>
        <Link
          className="text-primary inline-flex shrink-0 items-center gap-0.5 text-sm font-medium"
          href={pathsConfig.app.calendar}
        >
          <Trans i18nKey="kinder:calendar.viewAll" />
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {events.map((event) => {
          const tone = CALENDAR_CATEGORY_TONES[event.category];

          return (
            <li key={event.id}>
              <Link
                className="hover:bg-muted/60 flex flex-col gap-1 rounded-xl border border-border px-3 py-2.5 transition-colors"
                href={`${pathsConfig.app.calendar}?date=${toDateKey(event.starts_at)}&view=day`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {event.title}
                  </span>
                  <Badge
                    className="rounded-full"
                    variant={tone === 'danger' ? 'destructive' : 'secondary'}
                  >
                    <Trans
                      i18nKey={`kinder:calendar.categories.${event.category}`}
                    />
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatEventDate(event)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}
