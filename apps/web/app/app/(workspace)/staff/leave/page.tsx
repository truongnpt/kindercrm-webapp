import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  buildStaffModulePermissions,
  loadMemberPermissions,
  STAFF_PERMISSIONS,
} from '~/lib/kinder/permissions';
import { hasPermission } from '~/lib/kinder/permissions/check-permission';
import { loadStaffLeaveRequests } from '~/lib/kinder/staff/load-staff-hr';
import { loadStaffEmployees } from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StaffModuleNav } from '../_components/staff-module-nav';
import { StaffLeaveWorkspace } from './_components/staff-leave-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.leave.title'),
  };
};

async function StaffLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'all' } = await searchParams;
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

  if (!hasPermission(memberPermissions, STAFF_PERMISSIONS.LEAVE_VIEW)) {
    redirect(pathsConfig.app.staff);
  }

  const permissions = buildStaffModulePermissions(memberPermissions);

  const [requests, employees] = await Promise.all([
    loadStaffLeaveRequests(context.school.id, { status }),
    loadStaffEmployees(context.school.id),
  ]);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: <Trans i18nKey="kinder:staff.leave.title" /> },
        ]}
        description={<Trans i18nKey="kinder:staff.leave.description" />}
        title={<Trans i18nKey="kinder:staff.leave.title" />}
      />

      <KinderPageBody>
        <StaffModuleNav className="mb-2" permissions={permissions} />
        <StaffLeaveWorkspace
          employees={employees}
          permissions={permissions}
          requests={requests}
          schoolId={context.school.id}
          statusFilter={status}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffLeavePage);
