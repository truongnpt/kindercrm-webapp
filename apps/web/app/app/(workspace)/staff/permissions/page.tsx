import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  buildStaffModulePermissions,
  loadMemberPermissions,
  loadSchoolPermissionMatrix,
  STAFF_PERMISSIONS,
} from '~/lib/kinder/permissions';
import { hasPermission } from '~/lib/kinder/permissions/check-permission';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StaffModuleNav } from '../_components/staff-module-nav';
import { StaffPermissionsPanel } from '../_components/staff-permissions-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:permissions.title'),
  };
};

async function StaffPermissionsPage() {
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

  if (
    !hasPermission(memberPermissions, STAFF_PERMISSIONS.PERMISSIONS_MANAGE)
  ) {
    redirect(pathsConfig.app.staff);
  }

  const staffPermissions = buildStaffModulePermissions(memberPermissions);
  const matrix = await loadSchoolPermissionMatrix(context.school.id);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: <Trans i18nKey="kinder:permissions.title" /> },
        ]}
        description={<Trans i18nKey="kinder:permissions.pageDescription" />}
        title={<Trans i18nKey="kinder:permissions.title" />}
      />

      <KinderPageBody>
        <StaffModuleNav
          className="mb-2"
          permissions={staffPermissions}
        />

        <StaffPermissionsPanel
          customRoles={matrix.customRoles}
          rows={matrix.rows}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffPermissionsPage);
