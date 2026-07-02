import {
  CalendarCheck,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { AttendanceDaySummary } from '~/lib/kinder/attendance/types';

export function AttendanceOverview({
  summary,
}: {
  summary: AttendanceDaySummary;
}) {
  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={UserCheck}
        labelKey="kinder:attendance.stats.present"
        tone="success"
        trend={`${summary.attendanceRate}%`}
        trendDirection={
          summary.attendanceRate >= 80 ? 'up' : 'down'
        }
        trendLabelKey="kinder:attendance.stats.rateLabel"
        value={String(summary.present)}
      />
      <StatCard
        icon={UserX}
        labelKey="kinder:attendance.stats.absent"
        tone="warning"
        value={String(summary.absent)}
      />
      <StatCard
        icon={Clock}
        labelKey="kinder:attendance.stats.late"
        tone="info"
        value={String(summary.late)}
      />
      <StatCard
        icon={CalendarCheck}
        labelKey="kinder:attendance.stats.pendingLeave"
        tone="default"
        value={String(summary.pendingLeave)}
      />
    </BentoGrid>
  );
}
