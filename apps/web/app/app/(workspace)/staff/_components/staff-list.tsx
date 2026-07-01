'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Users } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { Campus } from '~/lib/kinder/types';
import { deleteStaffEmployeeAction } from '~/lib/kinder/staff/server-actions';
import type {
  StaffDepartment,
  StaffEmployeeListItem,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { EditStaffDialog } from './edit-staff-dialog';
import { StaffAvatar } from './staff-avatar';
import { StaffStatusBadge } from './staff-status-badge';

export function StaffList({
  employees,
  schoolId,
  departments,
  positions,
  campuses,
  canManage,
}: {
  employees: StaffEmployeeListItem[];
  schoolId: string;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  canManage: boolean;
}) {
  const [editEmployee, setEditEmployee] = useState<StaffEmployeeListItem | null>(
    null,
  );
  const [deleteEmployee, setDeleteEmployee] =
    useState<StaffEmployeeListItem | null>(null);

  const deleteMutation = useKinderMutation({
    mutationFn: deleteStaffEmployeeAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    onSuccess: () => setDeleteEmployee(null),
  });

  if (employees.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:staff.emptyDescription"
        icon={Users}
        titleKey="kinder:staff.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:staff.listDescription" />}
          title={<Trans i18nKey="kinder:staff.directory" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
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
                {canManage ? <th className="text-right" /> : null}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <StaffAvatar name={employee.full_name} size="sm" />
                      <div className="min-w-0">
                        <Link
                          className="font-medium hover:text-primary hover:underline"
                          href={`${pathsConfig.app.staffDetail}/${employee.id}`}
                        >
                          {employee.full_name}
                        </Link>
                        <p className="text-muted-foreground font-mono text-xs">
                          {employee.employee_code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {employee.department?.name ?? '—'}
                  </td>
                  <td className="text-muted-foreground">
                    {employee.position?.name ?? '—'}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">
                        <Trans
                          i18nKey={`kinder:staff.accessRoles.${employee.access_role}`}
                        />
                      </Badge>
                      {employee.is_teacher ? (
                        <Badge variant="secondary">
                          <Trans i18nKey="kinder:staff.teacherBadge" />
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <StaffStatusBadge status={employee.employment_status} />
                  </td>
                  {canManage ? (
                    <td className="text-right">
                      <EntityRowActions
                        onDelete={() => setDeleteEmployee(employee)}
                        onEdit={() => setEditEmployee(employee)}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {employees.map((employee) => (
          <article className="kinder-mobile-card" key={employee.id}>
            <div className="flex items-start gap-3">
              <StaffAvatar name={employee.full_name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      className="text-foreground truncate font-medium hover:text-primary hover:underline"
                      href={`${pathsConfig.app.staffDetail}/${employee.id}`}
                    >
                      {employee.full_name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                      {employee.employee_code}
                    </p>
                  </div>
                  <StaffStatusBadge status={employee.employment_status} />
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  {employee.department?.name ?? '—'} ·{' '}
                  {employee.position?.name ?? '—'}
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">
                    <Trans
                      i18nKey={`kinder:staff.accessRoles.${employee.access_role}`}
                    />
                  </Badge>
                  {employee.is_teacher ? (
                    <Badge variant="secondary">
                      <Trans i18nKey="kinder:staff.teacherBadge" />
                    </Badge>
                  ) : null}
                </div>

                {canManage ? (
                  <div className="mt-3">
                    <EntityRowActions
                      onDelete={() => setDeleteEmployee(employee)}
                      onEdit={() => setEditEmployee(employee)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {editEmployee ? (
        <EditStaffDialog
          campuses={campuses}
          departments={departments}
          employee={editEmployee}
          hideTrigger
          onOpenChange={(open) => {
            if (!open) {
              setEditEmployee(null);
            }
          }}
          open
          positions={positions}
          schoolId={schoolId}
        />
      ) : null}

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="kinder:staff.delete" />}
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => {
          if (deleteEmployee) {
            deleteMutation.mutate({
              employeeId: deleteEmployee.id,
              schoolId,
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteEmployee(null);
          }
        }}
        open={Boolean(deleteEmployee)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
      />
    </>
  );
}
