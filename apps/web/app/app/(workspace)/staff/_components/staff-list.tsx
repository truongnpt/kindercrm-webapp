'use client';

import Link from 'next/link';

import { Users } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableShell, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

const STATUS_VARIANT: Record<
  StaffEmployeeListItem['employment_status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  inactive: 'secondary',
  on_leave: 'outline',
  terminated: 'destructive',
};

export function StaffList({ employees }: { employees: StaffEmployeeListItem[] }) {
  if (employees.length === 0) {
    return (
      <EmptyState
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={Users}
        titleKey="kinder:staff.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:staff.code" />
                </th>
                <th>
                  <Trans i18nKey="kinder:staff.fullName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:staff.department" />
                </th>
                <th>
                  <Trans i18nKey="kinder:staff.position" />
                </th>
                <th>
                  <Trans i18nKey="kinder:staff.role" />
                </th>
                <th>
                  <Trans i18nKey="kinder:staff.status" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="font-mono text-xs">{employee.employee_code}</td>
                  <td className="font-medium">{employee.full_name}</td>
                  <td className="text-muted-foreground">
                    {employee.department?.name ?? '—'}
                  </td>
                  <td className="text-muted-foreground">
                    {employee.position?.name ?? '—'}
                  </td>
                  <td>
                    <Badge variant="outline">
                      <Trans
                        i18nKey={`kinder:staff.accessRoles.${employee.access_role}`}
                      />
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={STATUS_VARIANT[employee.employment_status]}>
                      <Trans
                        i18nKey={`kinder:staff.statuses.${employee.employment_status}`}
                      />
                    </Badge>
                  </td>
                  <td className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`${pathsConfig.app.staffDetail}/${employee.id}`}
                      >
                        <Trans i18nKey="kinder:staff.detail" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {employees.map((employee) => (
          <article className="kinder-mobile-card" key={employee.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{employee.full_name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {employee.employee_code}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[employee.employment_status]}>
                <Trans
                  i18nKey={`kinder:staff.statuses.${employee.employment_status}`}
                />
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {employee.department?.name ?? '—'} ·{' '}
              {employee.position?.name ?? '—'}
            </p>
            <Button asChild className="w-full" size="sm" variant="outline">
              <Link href={`${pathsConfig.app.staffDetail}/${employee.id}`}>
                <Trans i18nKey="kinder:staff.detail" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
