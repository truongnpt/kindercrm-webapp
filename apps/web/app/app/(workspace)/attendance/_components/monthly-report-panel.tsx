'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  SectionCard,
  StatCard,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { AttendanceMonthlySummary } from '~/lib/kinder/attendance/types';
import type { ClassGroup } from '~/lib/kinder/classes/types';

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthlyReportPanel({
  classes,
  summary,
}: {
  classes: ClassGroup[];
  summary: AttendanceMonthlySummary;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get('month') ?? currentMonth();
  const classId = searchParams.get('reportClassId') ?? 'all';

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'report');

    if (value === 'all' && key === 'reportClassId') {
      params.delete('reportClassId');
    } else {
      params.set(key, value);
    }

    router.push(`${pathsConfig.app.attendance}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-[160px]"
          onChange={(event) => updateParams('month', event.target.value)}
          type="month"
          value={month}
        />

        <Select
          onValueChange={(value) => updateParams('reportClassId', value)}
          value={classId}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans i18nKey="kinder:attendance.report.allClasses" />
            </SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BentoGrid columns={3}>
        <StatCard
          labelKey="kinder:attendance.report.totalRecords"
          tone="default"
          value={String(summary.totalRecords)}
        />
        <StatCard
          labelKey="kinder:attendance.report.presentCount"
          tone="success"
          value={String(summary.presentCount)}
        />
        <StatCard
          labelKey="kinder:attendance.report.absentCount"
          tone="warning"
          value={String(summary.absentCount)}
        />
        <StatCard
          labelKey="kinder:attendance.report.lateCount"
          tone="info"
          value={String(summary.lateCount)}
        />
        <StatCard
          labelKey="kinder:attendance.report.excusedCount"
          tone="default"
          value={String(summary.excusedCount)}
        />
        <StatCard
          labelKey="kinder:attendance.report.attendanceRate"
          tone="success"
          value={`${summary.attendanceRate}%`}
        />
      </BentoGrid>

      <SectionCard title={<Trans i18nKey="kinder:attendance.report.rateTitle" />}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <Trans i18nKey="kinder:attendance.report.attendanceRate" />
            </span>
            <span className="font-semibold tabular-nums">
              {summary.attendanceRate}%
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${summary.attendanceRate}%` }}
            />
          </div>
          {summary.className ? (
            <p className="text-muted-foreground text-xs">
              {summary.className}
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
