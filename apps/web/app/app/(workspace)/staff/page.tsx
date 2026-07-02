import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadStaffDepartments,
  loadStaffEmployees,
  loadStaffPositions,
} from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext, loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateStaffDialog } from './_components/create-staff-dialog';
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

  requirePackageFeature(context, 'staff');

  const canManage = ['owner', 'admin'].includes(context.role);

  if (params.tab === 'setup') {
    redirect(canManage ? pathsConfig.app.staffSetup : pathsConfig.app.staff);
  }

  const filterOptions = {
    status: params.status,
    departmentId:
      params.departmentId && params.departmentId !== 'all'
        ? params.departmentId
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

  const [employees, allEmployees, departments, positions, campuses] =
    await Promise.all([
      loadStaffEmployees(context.school.id, filterOptions),
      loadStaffEmployees(context.school.id),
      loadStaffDepartments(context.school.id),
      loadStaffPositions(context.school.id),
      loadCampuses(context.school.id),
    ]);

  return (
    <>
      <KinderPageHeader
        actions={
          canManage ? (
            <CreateStaffDialog
              campuses={campuses}
              departments={departments}
              positions={positions}
              schoolId={context.school.id}
            />
          ) : undefined
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:staff.title" /> }]}
        description={<Trans i18nKey="kinder:staff.description" />}
        title={<Trans i18nKey="kinder:staff.title" />}
      />

      <KinderPageBody>
        {canManage ? <StaffModuleNav className="mb-2" /> : null}

        <StaffOverview employees={allEmployees} />

        <StaffWorkspace
          campuses={campuses}
          canManage={canManage}
          departments={departments}
          employees={employees}
          hasActiveFilters={hasActiveFilters}
          positions={positions}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffPage);
