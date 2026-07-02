import { School } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { EmptyState, KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  buildAttendanceDaySummary,
  loadActiveClasses,
  loadAttendanceForClassDate,
  loadAttendanceMonthlySummary,
  loadLeaveRequests,
  loadStudentsForLeaveRequest,
} from '~/lib/kinder/attendance/load-attendance';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { AttendanceOverview } from './_components/attendance-overview';
import { AttendanceWorkspace } from './_components/attendance-workspace';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:attendance.title'),
  };
};

async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    classId?: string;
    date?: string;
    tab?: string;
    month?: string;
    reportClassId?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(context, pathsConfig.app.attendance, 'view');

  const classes = await loadActiveClasses(context.school.id);
  const classId = params.classId ?? classes[0]?.id;
  const attendanceDate = params.date ?? todayString();
  const month = params.month ?? currentMonth();
  const reportClassId =
    params.reportClassId && params.reportClassId !== 'all'
      ? params.reportClassId
      : undefined;
  const defaultTab = params.tab ?? 'daily';
  const selectedClass = classes.find((cls) => cls.id === classId);

  const [roster, leaveRequests, students, monthlySummary] = await Promise.all([
    classId
      ? loadAttendanceForClassDate(
          context.school.id,
          classId,
          attendanceDate,
        )
      : Promise.resolve([]),
    loadLeaveRequests(context.school.id),
    loadStudentsForLeaveRequest(context.school.id),
    loadAttendanceMonthlySummary(context.school.id, month, reportClassId),
  ]);

  const pendingLeave = leaveRequests.filter(
    (request) => request.status === 'pending',
  ).length;

  const daySummary = buildAttendanceDaySummary({
    date: attendanceDate,
    classId: classId ?? null,
    className: selectedClass?.name ?? null,
    roster,
    pendingLeave,
    activeClasses: classes.length,
  });

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:attendance.title" /> }]}
        description={<Trans i18nKey="kinder:attendance.description" />}
        title={<Trans i18nKey="kinder:attendance.title" />}
      />

      <KinderPageBody>
        {classes.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:attendance.noClassesDescription"
            icon={School}
            titleKey="kinder:attendance.noClasses"
          />
        ) : (
          <>
            <AttendanceOverview summary={daySummary} />
            <AttendanceWorkspace
              attendanceDate={attendanceDate}
              classId={classId}
              classes={classes}
              defaultTab={defaultTab}
              leaveRequests={leaveRequests}
              monthlySummary={monthlySummary}
              roster={roster}
              schoolId={context.school.id}
              students={students}
            />
          </>
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(AttendancePage);
