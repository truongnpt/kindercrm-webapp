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
import {
  loadStaffDepartments,
  loadStaffPositions,
} from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StaffModuleNav } from '../_components/staff-module-nav';
import { StaffSetupWorkspace } from '../_components/staff-setup-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.setupTitle'),
  };
};

async function StaffSetupPage() {
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

  if (!permissions.canManageSetup) {
    redirect(pathsConfig.app.staff);
  }

  const [departments, positions] = await Promise.all([
    loadStaffDepartments(context.school.id),
    loadStaffPositions(context.school.id),
  ]);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: <Trans i18nKey="kinder:staff.tabs.setup" /> },
        ]}
        description={<Trans i18nKey="kinder:staff.setupDescription" />}
        title={<Trans i18nKey="kinder:staff.setupTitle" />}
      />

      <KinderPageBody>
        <StaffModuleNav className="mb-2" permissions={permissions} />

        <StaffSetupWorkspace
          departments={departments}
          positions={positions}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffSetupPage);
