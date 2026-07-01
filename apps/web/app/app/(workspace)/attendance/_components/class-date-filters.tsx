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

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function ClassDateFilters({ classes }: { classes: ClassGroup[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') ?? classes[0]?.id ?? '';
  const date = searchParams.get('date') ?? todayString();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathsConfig.app.attendance}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        onValueChange={(value) => updateParams('classId', value)}
        value={classId}
      >
        <SelectTrigger className="w-[220px]">
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

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:attendance.date" />
        </span>
        <Input
          className="w-[160px]"
          onChange={(event) => updateParams('date', event.target.value)}
          type="date"
          value={date}
        />
      </div>
    </div>
  );
}
