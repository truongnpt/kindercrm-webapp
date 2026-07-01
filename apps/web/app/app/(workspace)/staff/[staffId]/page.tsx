import { notFound } from 'next/navigation';

import {
  DetailPageHeader,
  KinderPageBody,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadActiveClassesForStaff,
  loadStaffClassAssignments,
  loadStaffContracts,
  loadStaffDepartments,
  loadStaffEmployeeById,
  loadStaffHomeroomClasses,
  loadStaffPositions,
} from '~/lib/kinder/staff/load-staff';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext, loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import type { StaffHomeroomClass } from '~/lib/kinder/staff/types';

import { StaffDetailPanel } from './_components/staff-detail-panel';

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

  const employee = await loadStaffEmployeeById(context.school.id, staffId);

  if (!employee) {
    notFound();
  }

  const [
    departments,
    positions,
    campuses,
    contracts,
    homeroomClasses,
    classAssignments,
    availableClasses,
  ] = await Promise.all([
    loadStaffDepartments(context.school.id),
    loadStaffPositions(context.school.id),
    loadCampuses(context.school.id),
    loadStaffContracts(context.school.id, staffId),
    loadStaffHomeroomClasses(context.school.id, employee.user_id),
    loadStaffClassAssignments(context.school.id, staffId),
    loadActiveClassesForStaff(context.school.id),
  ]);

  const canManage = ['owner', 'admin'].includes(context.role);

  const normalizedAssignments = (classAssignments as Array<{
    id: string;
    assignment_role: string;
    class: StaffHomeroomClass;
  }>).map((item) => ({
    id: item.id,
    assignment_role: item.assignment_role,
    class: item.class,
  }));

  return (
    <>
      <DetailPageHeader
        backHref={pathsConfig.app.staff}
        description={employee.employee_code}
        title={employee.full_name}
      />

      <KinderPageBody>
        <StaffDetailPanel
          availableClasses={availableClasses}
          campuses={campuses}
          canManage={canManage}
          classAssignments={normalizedAssignments}
          contracts={contracts}
          departments={departments}
          employee={employee}
          homeroomClasses={homeroomClasses}
          positions={positions}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffDetailPage);
