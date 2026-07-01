'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { MonthCalendar, type CalendarEvent } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { LeaveRequestWithStudent } from '~/lib/kinder/attendance/types';

export function AttendanceCalendarPanel({
  leaveRequests,
}: {
  leaveRequests: LeaveRequestWithStudent[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const events: CalendarEvent[] = leaveRequests.flatMap((request) => {
    const events: CalendarEvent[] = [];

    if (request.start_date) {
      events.push({
        id: `${request.id}-start`,
        date: request.start_date,
        title: `${request.student.full_name} — ${request.reason ?? ''}`.trim(),
        tone: request.status === 'approved' ? 'success' : 'warning',
      });
    }

    return events;
  });

  return (
    <MonthCalendar
      events={events}
      onDateSelect={(date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'daily');
        params.set('date', date);
        router.push(`${pathsConfig.app.attendance}?${params.toString()}`);
      }}
    />
  );
}
