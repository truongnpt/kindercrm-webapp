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

import pathsConfig from '~/config/paths.config';
import type { ClassGroup } from '~/lib/kinder/classes/types';
import type { AttendanceMonthlySummary } from '~/lib/kinder/attendance/types';

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

  const cards = [
    { key: 'totalRecords', value: summary.totalRecords },
    { key: 'presentCount', value: summary.presentCount },
    { key: 'absentCount', value: summary.absentCount },
    { key: 'lateCount', value: summary.lateCount },
    { key: 'excusedCount', value: summary.excusedCount },
    { key: 'attendanceRate', value: `${summary.attendanceRate}%` },
  ] as const;

  return (
    <div className="space-y-4">
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
          <SelectTrigger className="w-[220px]">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div className="rounded-lg border p-4" key={card.key}>
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey={`kinder:attendance.report.${card.key}`} />
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
