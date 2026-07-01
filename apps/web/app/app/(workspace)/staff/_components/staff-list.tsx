'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

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
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:staff.empty" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.code" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.fullName" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.department" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.position" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.role" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:staff.status" />
            </th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {employee.employee_code}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{employee.full_name}</span>
                  {employee.is_teacher ? (
                    <Badge variant="secondary">
                      <Trans i18nKey="kinder:staff.teacherBadge" />
                    </Badge>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3">
                {employee.department?.name ?? '—'}
              </td>
              <td className="px-4 py-3">
                {employee.position?.name ?? '—'}
              </td>
              <td className="px-4 py-3">
                <Trans
                  i18nKey={`kinder:staff.accessRoles.${employee.access_role}`}
                />
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[employee.employment_status]}>
                  <Trans
                    i18nKey={`kinder:staff.statuses.${employee.employment_status}`}
                  />
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
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
    </div>
  );
}
