import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  assertModuleAccessFromContext,
  buildStaffModulePermissions,
  loadMemberPermissions,
  loadSchoolCustomRoles,
} from '~/lib/kinder/permissions';
import {
  loadStaffDepartments,
  loadStaffEmployees,
  loadStaffPositions,
} from '~/lib/kinder/staff/load-staff';
import { loadStaffHrAlerts } from '~/lib/kinder/staff/load-staff-hr';
import { getSchoolContext, loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateStaffDialog } from './_components/create-staff-dialog';
import { StaffHrAlerts } from './_components/staff-hr-alerts';
import { StaffImportExport } from './_components/staff-import-export';
import { StaffModuleNav } from './_components/staff-module-nav';
import { StaffOverview } from './_components/staff-overview';
import { StaffWorkspace } from './_components/staff-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.title'),
  };
};

async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    departmentId?: string;
    teachersOnly?: string;
    search?: string;
    tab?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(context, pathsConfig.app.staff, 'view');

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );

  const permissions = buildStaffModulePermissions(memberPermissions);

  if (params.tab === 'setup') {
    redirect(
      permissions.canManageSetup ?
        pathsConfig.app.staffSetup
      : pathsConfig.app.staff,
    );
  }

  const filterOptions = {
    status: params.status,
    departmentId:
      params.departmentId && params.departmentId !== 'all' ?
        params.departmentId
      : undefined,
    teachersOnly: params.teachersOnly === '1',
    search: params.search,
  };

  const hasActiveFilters = Boolean(
    (params.status && params.status !== 'all') ||
      (params.departmentId && params.departmentId !== 'all') ||
      params.teachersOnly === '1' ||
      params.search?.trim(),
  );

  const [employees, allEmployees, departments, positions, campuses, customRoles] =
    await Promise.all([
      loadStaffEmployees(context.school.id, filterOptions),
      loadStaffEmployees(context.school.id),
      loadStaffDepartments(context.school.id),
      loadStaffPositions(context.school.id),
      loadCampuses(context.school.id),
      loadSchoolCustomRoles(context.school.id),
    ]);

  const alerts = await loadStaffHrAlerts(context.school.id, allEmployees);
  const managerOptions = allEmployees.map((employee) => ({
    id: employee.id,
    full_name: employee.full_name,
    employee_code: employee.employee_code,
  }));

  return (
    <>
      <KinderPageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {permissions.canCreate ?
              <StaffImportExport
                employees={allEmployees}
                schoolId={context.school.id}
              />
            : null}
            {permissions.canCreate ? (
              <CreateStaffDialog
                campuses={campuses}
                canManageAccess={permissions.canManageAccess}
                customRoles={customRoles}
                departments={departments}
                managers={managerOptions}
                positions={positions}
                schoolId={context.school.id}
              />
            ) : null}
          </div>
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:staff.title" /> }]}
        description={<Trans i18nKey="kinder:staff.description" />}
        title={<Trans i18nKey="kinder:staff.title" />}
      />

      <KinderPageBody>
        <StaffModuleNav className="mb-2" permissions={permissions} />

        <StaffHrAlerts alerts={alerts} />

        <StaffOverview employees={allEmployees} />

        <StaffWorkspace
          campuses={campuses}
          customRoles={customRoles}
          departments={departments}
          employees={employees}
          hasActiveFilters={hasActiveFilters}
          managers={managerOptions}
          permissions={permissions}
          positions={positions}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffPage);
