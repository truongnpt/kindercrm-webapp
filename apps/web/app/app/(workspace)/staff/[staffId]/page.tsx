import { notFound, redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { DetailPageHeader, KinderPageBody } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  buildStaffModulePermissions,
  loadMemberPermissions,
  loadSchoolCustomRoles,
  STAFF_PERMISSIONS,
} from '~/lib/kinder/permissions';
import { hasPermission } from '~/lib/kinder/permissions/check-permission';
import {
  loadActiveClassesForStaff,
  loadStaffClassAssignments,
  loadStaffContracts,
  loadStaffDepartments,
  loadStaffEmployeeById,
  loadStaffEmployees,
  loadStaffHomeroomClasses,
  loadStaffPositions,
} from '~/lib/kinder/staff/load-staff';
import { loadStaffDocuments } from '~/lib/kinder/staff/load-staff-hr';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext, loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import type { StaffHomeroomClass } from '~/lib/kinder/staff/types';

import { StaffDetailActions } from './_components/staff-detail-actions';
import { StaffDetailWorkspace } from './_components/staff-detail-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.detail'),
  };
};

async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'staff');

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );

  if (!hasPermission(memberPermissions, STAFF_PERMISSIONS.DIRECTORY_VIEW)) {
    redirect(pathsConfig.app.home);
  }

  const permissions = buildStaffModulePermissions(memberPermissions);

  const employee = await loadStaffEmployeeById(context.school.id, staffId);

  if (!employee) {
    notFound();
  }

  const [
    departments,
    positions,
    campuses,
    customRoles,
    contracts,
    documents,
    homeroomClasses,
    classAssignments,
    availableClasses,
  ] = await Promise.all([
    loadStaffDepartments(context.school.id),
    loadStaffPositions(context.school.id),
    loadCampuses(context.school.id),
    loadSchoolCustomRoles(context.school.id),
    permissions.canViewContracts ?
      loadStaffContracts(context.school.id, staffId)
    : Promise.resolve([]),
    permissions.canViewDocuments ?
      loadStaffDocuments(context.school.id, staffId)
    : Promise.resolve([]),
    employee.is_teacher && permissions.canViewClasses ?
      loadStaffHomeroomClasses(context.school.id, employee.user_id)
    : Promise.resolve([]),
    employee.is_teacher && permissions.canViewClasses ?
      loadStaffClassAssignments(context.school.id, staffId)
    : Promise.resolve([]),
    permissions.canManageClasses ?
      loadActiveClassesForStaff(context.school.id)
    : Promise.resolve([]),
  ]);

  const activeContract = contracts.find((contract) => contract.is_active);

  const normalizedAssignments = (classAssignments as Array<{
    id: string;
    assignment_role: string;
    class: StaffHomeroomClass;
  }>).map((item) => ({
    id: item.id,
    assignment_role: item.assignment_role,
    class: item.class,
  }));

  const managerOptions = (await loadStaffEmployees(context.school.id)).map(
    (item) => ({
      id: item.id,
      full_name: item.full_name,
      employee_code: item.employee_code,
    }),
  );

  const showActions = permissions.canUpdate || permissions.canDelete;

  return (
    <>
      <DetailPageHeader
        actions={
          showActions ? (
            <StaffDetailActions
              campuses={campuses}
              customRoles={customRoles}
              departments={departments}
              employee={employee}
              managers={managerOptions}
              permissions={permissions}
              positions={positions}
              schoolId={context.school.id}
            />
          ) : undefined
        }
        backHref={pathsConfig.app.staff}
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: employee.full_name },
        ]}
        description={employee.employee_code}
        title={employee.full_name}
      />

      <KinderPageBody>
        <StaffDetailWorkspace
          activeContract={activeContract}
          assignments={normalizedAssignments}
          availableClasses={availableClasses}
          contracts={contracts}
          documents={documents}
          employee={employee}
          homeroomClasses={homeroomClasses}
          permissions={permissions}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffDetailPage);
