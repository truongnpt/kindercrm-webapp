'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { SchoolCustomRole, StaffModulePermissions } from '~/lib/kinder/permissions';
import type { Campus } from '~/lib/kinder/types';
import { deleteStaffEmployeeAction } from '~/lib/kinder/staff/server-actions';
import { canResendStaffInvite } from '~/lib/kinder/staff/staff-invite-state';
import type {
  StaffDepartment,
  StaffEmployeeDetail,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { EditStaffDialog } from '../../_components/edit-staff-dialog';
import { StaffResendInviteButton } from './staff-resend-invite-button';

export function StaffDetailActions({
  employee,
  schoolId,
  departments,
  positions,
  campuses,
  managers = [],
  customRoles,
  permissions,
}: {
  employee: StaffEmployeeDetail;
  schoolId: string;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  managers?: Array<{ id: string; full_name: string; employee_code: string }>;
  customRoles: SchoolCustomRole[];
  permissions: StaffModulePermissions;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteStaff = useKinderMutation({
    mutationFn: deleteStaffEmployeeAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    refresh: false,
    onSuccess: () => {
      setDeleteOpen(false);
      router.push(pathsConfig.app.staff);
    },
  });

  const canResendInvite =
    permissions.canManageAccess && canResendStaffInvite(employee);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {permissions.canUpdate ? (
          <EditStaffDialog
            campuses={campuses}
            canManageAccess={permissions.canManageAccess}
            customRoles={customRoles}
            departments={departments}
            employee={employee}
            managers={managers}
            positions={positions}
            schoolId={schoolId}
          />
        ) : null}
        {canResendInvite ? (
          <StaffResendInviteButton
            className="rounded-full"
            employeeId={employee.id}
            schoolId={schoolId}
          />
        ) : null}
        {permissions.canDelete ? (
          <Button
 onClick={() => setDeleteOpen(true)}
            size="sm"
            type="button"
            variant="destructive"
          >
            <Trash2 className="mr-2 size-4" />
            <Trans i18nKey="kinder:ui.delete" />
          </Button>
        ) : null}
      </div>

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="kinder:staff.delete" />}
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() =>
          deleteStaff.mutate({ employeeId: employee.id, schoolId })
        }
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteStaff.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
      />
    </>
  );
}
