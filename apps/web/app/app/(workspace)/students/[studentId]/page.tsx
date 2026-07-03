import { notFound } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { DetailPageHeader, KinderPageBody } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';

import {
  loadParentLinksForStudent,
} from '~/lib/kinder/parent/load-parent';
import {
  loadDailyReportAttachmentsMap,
  loadStudentDailyReports,
} from '~/lib/kinder/daily-reports/load-daily-reports';
import {
  loadActiveTuitionFeeItems,
} from '~/lib/kinder/finance/load-finance';
import {
  buildStudentsModulePermissions,
  loadMemberPermissions,
} from '~/lib/kinder/permissions';
import { loadStudentContractsForStudent } from '~/lib/kinder/student-contracts/load-student-contracts';
import {
  hasSchoolFeature,
  requirePackageFeature,
} from '~/lib/kinder/subscription/features';
import {
  loadStudentAllergies,
  loadStudentById,
  loadStudentEmergencyContacts,
  loadStudentMedicalRecord,
  loadStudentParents,
  loadStudentPickupPersons,
  loadStudentTimeline,
} from '~/lib/kinder/students/load-students';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { StudentDetailActions } from './_components/student-detail-actions';
import { StudentDetailWorkspace } from './_components/student-detail-workspace';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) => {
  const { studentId } = await params;
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:students.detail'),
  };
};

async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'students');

  const hasParentPortal = hasSchoolFeature(context, 'parent_portal');
  const hasDailyReports = hasSchoolFeature(context, 'daily_reports');

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );
  const studentPermissions = buildStudentsModulePermissions(memberPermissions);
  const hasContracts = studentPermissions.canViewContracts;

  const student = await loadStudentById(context.school.id, studentId);

  if (!student) {
    notFound();
  }

  const [
    parents,
    emergencyContacts,
    medical,
    allergies,
    pickupPersons,
    timeline,
    parentLinks,
    dailyReports,
    contracts,
    feeItems,
  ] = await Promise.all([
    loadStudentParents(context.school.id, studentId),
    loadStudentEmergencyContacts(context.school.id, studentId),
    loadStudentMedicalRecord(context.school.id, studentId),
    loadStudentAllergies(context.school.id, studentId),
    loadStudentPickupPersons(context.school.id, studentId),
    loadStudentTimeline(context.school.id, studentId),
    hasParentPortal
      ? loadParentLinksForStudent(context.school.id, studentId)
      : Promise.resolve([]),
    hasDailyReports
      ? loadStudentDailyReports(context.school.id, studentId)
      : Promise.resolve([]),
    hasContracts
      ? loadStudentContractsForStudent(context.school.id, studentId)
      : Promise.resolve([]),
    hasContracts && studentPermissions.canManageContracts
      ? loadActiveTuitionFeeItems(context.school.id)
      : Promise.resolve([]),
  ]);

  const contractStudents =
    hasContracts && studentPermissions.canManageContracts
      ? [
          {
            id: student.id,
            full_name: student.full_name,
            student_code: student.student_code,
            class_name: student.class_name,
          },
        ]
      : [];

  const dailyReportAttachments =
    hasDailyReports && dailyReports.length > 0
      ? await loadDailyReportAttachmentsMap(
          dailyReports.map((report) => report.id),
        )
      : {};

  return (
    <>
      <DetailPageHeader
        actions={
          <StudentDetailActions
            schoolId={context.school.id}
            student={student}
          />
        }
        backHref={pathsConfig.app.students}
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:students.title" />,
            href: pathsConfig.app.students,
          },
          { label: student.full_name },
        ]}
        description={student.student_code}
        title={student.full_name}
      />

      <KinderPageBody>
        <StudentDetailWorkspace
          allergies={allergies}
          canManageContracts={studentPermissions.canManageContracts}
          contractStudents={contractStudents}
          contracts={contracts}
          dailyReportAttachments={dailyReportAttachments}
          dailyReports={dailyReports}
          emergencyContacts={emergencyContacts}
          feeItems={feeItems}
          hasContracts={hasContracts}
          hasDailyReports={hasDailyReports}
          hasParentPortal={hasParentPortal}
          medical={medical}
          parentLinks={parentLinks}
          parents={parents}
          pickupPersons={pickupPersons}
          schoolId={context.school.id}
          student={student}
          studentId={studentId}
          timeline={timeline}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StudentDetailPage);
