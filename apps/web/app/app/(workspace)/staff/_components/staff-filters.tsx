'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('kinder');
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
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="h-11 rounded-lg border-border bg-muted/30 pl-10 shadow-none focus-visible:border-primary/40"
          onChange={(event) => update({ search: event.target.value || null })}
          placeholder={t('staff.searchPlaceholder')}
          value={search}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
        <Select onValueChange={(value) => update({ status: value })} value={status}>
          <SelectTrigger className="h-11 rounded-lg border-border bg-muted/30 shadow-none">
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
          <SelectTrigger className="h-11 rounded-lg border-border bg-muted/30 shadow-none">
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
          <SelectTrigger className="h-11 rounded-lg border-border bg-muted/30 shadow-none">
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
    </div>
  );
}
