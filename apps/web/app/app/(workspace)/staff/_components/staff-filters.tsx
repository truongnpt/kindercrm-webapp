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
import type { StaffDepartment } from '~/lib/kinder/staff/types';

const STATUSES = ['all', 'active', 'inactive', 'on_leave', 'terminated'] as const;

export function StaffFilters({
  departments,
}: {
  departments: StaffDepartment[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? 'all';
  const departmentId = searchParams.get('departmentId') ?? 'all';
  const teachersOnly = searchParams.get('teachersOnly') === '1';
  const search = searchParams.get('search') ?? '';

  const update = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.push(query ? `${pathsConfig.app.staff}?${query}` : pathsConfig.app.staff);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        className="w-[200px]"
        onChange={(event) => update({ search: event.target.value || null })}
        placeholder="Tìm kiếm..."
        value={search}
      />

      <Select
        onValueChange={(value) => update({ status: value })}
        value={status}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              <Trans i18nKey={`kinder:staff.statuses.${item}`} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => update({ departmentId: value })}
        value={departmentId}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans i18nKey="kinder:staff.allDepartments" />
          </SelectItem>
          {departments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          update({ teachersOnly: value === '1' ? '1' : null })
        }
        value={teachersOnly ? '1' : '0'}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">
            <Trans i18nKey="kinder:staff.allEmployees" />
          </SelectItem>
          <SelectItem value="1">
            <Trans i18nKey="kinder:staff.teachersOnly" />
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
