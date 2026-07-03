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
import { loadStaffHrReportSummary } from '~/lib/kinder/staff/load-staff-hr';
import { loadStaffEmployees } from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StaffModuleNav } from '../_components/staff-module-nav';
import { StaffReportsWorkspace } from './_components/staff-reports-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.reports.title'),
  };
};

async function StaffReportsPage() {
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

  if (!permissions.canAccessHrSections) {
    redirect(pathsConfig.app.staff);
  }

  const employees = await loadStaffEmployees(context.school.id);
  const summary = await loadStaffHrReportSummary(context.school.id, employees);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: <Trans i18nKey="kinder:staff.reports.title" /> },
        ]}
        description={<Trans i18nKey="kinder:staff.reports.description" />}
        title={<Trans i18nKey="kinder:staff.reports.title" />}
      />

      <KinderPageBody>
        <StaffModuleNav className="mb-2" permissions={permissions} />
        <StaffReportsWorkspace summary={summary} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffReportsPage);
