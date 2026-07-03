'use client';

import { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { DataTableToolbar } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { StaffDepartment } from '~/lib/kinder/staff/types';

const STATUSES = ['all', 'active', 'inactive', 'on_leave', 'terminated'] as const;

const SELECT_TRIGGER_CLASS =
  'h-10 w-full min-w-[160px] rounded-lg border-border bg-background shadow-none';

function FilterField({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function StaffFiltersInner({
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

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const hasActiveFilters =
    status !== 'all' ||
    departmentId !== 'all' ||
    teachersOnly ||
    search.trim().length > 0;

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathsConfig.app.staff}?${query}` : pathsConfig.app.staff);
  };

  const update = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    pushParams(params);
  };

  useEffect(() => {
    const normalized = searchInput.trim();
    const current = search.trim();

    if (normalized === current) {
      return;
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (normalized) {
        params.set('search', normalized);
      } else {
        params.delete('search');
      }

      pushParams(params);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, search, searchParams.toString()]);

  const clearFilters = () => {
    setSearchInput('');
    router.push(pathsConfig.app.staff);
  };

  return (
    <DataTableToolbar className="items-end">
      <div className="min-w-0 w-full sm:max-w-xs">
        <Label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          <Trans i18nKey="kinder:workspace.search" />
        </Label>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="h-10 rounded-lg border-border bg-background pl-10 shadow-none focus-visible:border-primary/40"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('staff.searchPlaceholder')}
            value={searchInput}
          />
        </div>
      </div>

      <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto sm:flex-1 sm:justify-end">
        <FilterField label={<Trans i18nKey="kinder:staff.status" />}>
          <Select onValueChange={(value) => update({ status: value })} value={status}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
        </FilterField>

        <FilterField label={<Trans i18nKey="kinder:staff.department" />}>
          <Select
            onValueChange={(value) => update({ departmentId: value })}
            value={departmentId}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
        </FilterField>

        <FilterField label={<Trans i18nKey="kinder:staff.role" />}>
          <Select
            onValueChange={(value) =>
              update({ teachersOnly: value === '1' ? '1' : null })
            }
            value={teachersOnly ? '1' : '0'}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
        </FilterField>

        {hasActiveFilters ? (
          <Button
 className={cn('h-10 rounded-lg', 'shrink-0')}
 onClick={clearFilters}
 size="sm"
 type="button"
 variant="ghost"
 >
            <X className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:ui.clearFilters" />
          </Button>
        ) : null}
      </div>
    </DataTableToolbar>
  );
}

export function StaffFilters({
  departments,
}: {
  departments: StaffDepartment[];
}) {
  return (
    <Suspense>
      <StaffFiltersInner departments={departments} />
    </Suspense>
  );
}
