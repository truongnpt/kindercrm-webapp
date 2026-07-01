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

const STATUSES = [
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn',
] as const;

export function StudentStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('status') ?? 'all';

  return (
    <Select
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'all') {
          params.delete('status');
        } else {
          params.set('status', value);
        }

        const query = params.toString();
        router.push(
          query
            ? `${pathsConfig.app.students}?${query}`
            : pathsConfig.app.students,
        );
      }}
      value={current}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <Trans i18nKey="kinder:students.filterAll" />
        </SelectItem>
        {STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <Trans i18nKey={`kinder:students.statuses.${status}`} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
