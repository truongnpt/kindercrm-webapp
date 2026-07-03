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
import { loadStaffAttendance } from '~/lib/kinder/staff/load-staff-hr';
import { loadStaffEmployees } from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StaffModuleNav } from '../_components/staff-module-nav';
import { StaffAttendanceWorkspace } from './_components/staff-attendance-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:staff.attendance.title'),
  };
};

async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
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

  if (!hasPermission(memberPermissions, STAFF_PERMISSIONS.ATTENDANCE_VIEW)) {
    redirect(pathsConfig.app.staff);
  }

  const permissions = buildStaffModulePermissions(memberPermissions);
  const selectedDate = date ?? new Date().toISOString().slice(0, 10);

  const [attendance, employees] = await Promise.all([
    loadStaffAttendance(context.school.id, { date: selectedDate }),
    loadStaffEmployees(context.school.id, { status: 'active' }),
  ]);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:staff.title" />,
            href: pathsConfig.app.staff,
          },
          { label: <Trans i18nKey="kinder:staff.attendance.title" /> },
        ]}
        description={<Trans i18nKey="kinder:staff.attendance.description" />}
        title={<Trans i18nKey="kinder:staff.attendance.title" />}
      />

      <KinderPageBody>
        <StaffModuleNav className="mb-2" permissions={permissions} />
        <StaffAttendanceWorkspace
          attendance={attendance}
          employees={employees}
          permissions={permissions}
          schoolId={context.school.id}
          selectedDate={selectedDate}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffAttendancePage);
