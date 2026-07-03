'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
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

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function DailyReportFilters({ classes }: { classes: ClassGroup[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') ?? classes[0]?.id ?? '';
  const reportDate = searchParams.get('date') ?? todayString();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.push(`${pathsConfig.app.dailyReports}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        onValueChange={(value) => updateParams({ classId: value })}
        value={classId}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Chọn lớp" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Button
 onClick={() => updateParams({ date: shiftDate(reportDate, -1) })}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Input
          className="w-[160px]"
          onChange={(event) => updateParams({ date: event.target.value })}
          type="date"
          value={reportDate}
        />

        <Button
 onClick={() => updateParams({ date: shiftDate(reportDate, 1) })}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
 onClick={() => updateParams({ date: todayString() })}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trans i18nKey="kinder:attendance.today" />
        </Button>
      </div>
    </div>
  );
}
