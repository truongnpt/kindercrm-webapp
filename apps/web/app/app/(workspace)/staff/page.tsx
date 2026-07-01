import { Suspense } from 'react';

import { PageBody, PageHeader, PageHeaderActions } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

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
import { StaffFilters } from './_components/staff-filters';
import { StaffList } from './_components/staff-list';
import { StaffSetupPanel } from './_components/staff-setup-panel';

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

  const [employees, departments, positions, campuses] = await Promise.all([
    loadStaffEmployees(context.school.id, {
      status: params.status,
      departmentId:
        params.departmentId && params.departmentId !== 'all'
          ? params.departmentId
          : undefined,
      teachersOnly: params.teachersOnly === '1',
      search: params.search,
    }),
    loadStaffDepartments(context.school.id),
    loadStaffPositions(context.school.id),
    loadCampuses(context.school.id),
  ]);

  const defaultTab = params.tab ?? 'employees';
  const canManage = ['owner', 'admin'].includes(context.role);

  return (
    <>
      <PageHeader
        description={<Trans i18nKey="kinder:staff.description" />}
        title={<Trans i18nKey="kinder:staff.title" />}
      >
        {canManage ? (
          <PageHeaderActions>
            <Suspense>
              <StaffFilters departments={departments} />
            </Suspense>
            <CreateStaffDialog
              campuses={campuses}
              departments={departments}
              positions={positions}
              schoolId={context.school.id}
            />
          </PageHeaderActions>
        ) : null}
      </PageHeader>

      <PageBody>
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="employees">
              <Trans i18nKey="kinder:staff.tabs.employees" />
            </TabsTrigger>
            {canManage ? (
              <TabsTrigger value="setup">
                <Trans i18nKey="kinder:staff.tabs.setup" />
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent className="mt-4" value="employees">
            <StaffList employees={employees} />
          </TabsContent>

          {canManage ? (
            <TabsContent className="mt-4" value="setup">
              <StaffSetupPanel
                departments={departments}
                positions={positions}
                schoolId={context.school.id}
              />
            </TabsContent>
          ) : null}
        </Tabs>
      </PageBody>
    </>
  );
}

export default withI18n(StaffPage);
