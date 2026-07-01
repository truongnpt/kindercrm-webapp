'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

export function DailyReportFilters({
  classes,
}: {
  classes: Array<{ id: string; name: string; code: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') ?? classes[0]?.id ?? '';
  const reportDate =
    searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathsConfig.app.dailyReports}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        onValueChange={(value) => updateParams('classId', value)}
        value={classId}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        onChange={(event) => updateParams('date', event.target.value)}
        type="date"
        value={reportDate}
      />
    </div>
  );
}
