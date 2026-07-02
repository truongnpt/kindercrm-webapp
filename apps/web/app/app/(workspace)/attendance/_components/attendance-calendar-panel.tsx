'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { MonthCalendar, SectionCard, type CalendarEvent } from '~/components/kinder-ui';
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
    if (!request.start_date) {
      return [];
    }

    return [
      {
        id: `${request.id}-start`,
        date: request.start_date,
        title: `${request.student.full_name} — ${request.reason ?? ''}`.trim(),
        tone:
          request.status === 'approved'
            ? 'success'
            : request.status === 'rejected'
              ? 'danger'
              : 'warning',
      },
    ];
  });

  return (
    <SectionCard title={<Trans i18nKey="kinder:attendance.calendar.title" />}>
      <p className="text-muted-foreground mb-4 text-sm">
        <Trans i18nKey="kinder:attendance.calendar.description" />
      </p>
      <MonthCalendar
        events={events}
        onDateSelect={(date) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('tab', 'daily');
          params.set('date', date);
          router.push(`${pathsConfig.app.attendance}?${params.toString()}`);
        }}
      />
    </SectionCard>
  );
}
