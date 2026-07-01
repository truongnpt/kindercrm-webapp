import { Suspense } from 'react';

import { School } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  EmptyState,
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';

import {
  loadActiveClasses,
  loadAttendanceForClassDate,
  loadAttendanceMonthlySummary,
  loadLeaveRequests,
  loadStudentsForLeaveRequest,
} from '~/lib/kinder/attendance/load-attendance';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { AttendanceCalendarPanel } from './_components/attendance-calendar-panel';
import { ClassDateFilters } from './_components/class-date-filters';
import { DailyAttendancePanel } from './_components/daily-attendance-panel';
import { LeaveRequestsPanel } from './_components/leave-requests-panel';
import { MonthlyReportPanel } from './_components/monthly-report-panel';

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

  requirePackageFeature(context, 'attendance');

  const classes = await loadActiveClasses(context.school.id);
  const classId = params.classId ?? classes[0]?.id;
  const attendanceDate = params.date ?? todayString();
  const month = params.month ?? currentMonth();
  const reportClassId =
    params.reportClassId && params.reportClassId !== 'all'
      ? params.reportClassId
      : undefined;
  const defaultTab = params.tab ?? 'daily';

  const [roster, leaveRequests, allLeaveRequests, students, monthlySummary] =
    await Promise.all([
    classId
      ? loadAttendanceForClassDate(
          context.school.id,
          classId,
          attendanceDate,
        )
      : Promise.resolve([]),
    loadLeaveRequests(context.school.id, 'pending'),
    loadLeaveRequests(context.school.id),
    loadStudentsForLeaveRequest(context.school.id),
    loadAttendanceMonthlySummary(context.school.id, month, reportClassId),
  ]);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:attendance.title" /> }]}
        description={<Trans i18nKey="kinder:attendance.description" />}
        title={<Trans i18nKey="kinder:attendance.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue={defaultTab}>
          <TabbedModuleList>
            <TabbedModuleTrigger value="daily">
              <Trans i18nKey="kinder:attendance.tabs.daily" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="leave">
              <Trans i18nKey="kinder:attendance.tabs.leave" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="calendar">
              <Trans i18nKey="kinder:attendance.tabs.calendar" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="report">
              <Trans i18nKey="kinder:attendance.tabs.report" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent className="flex flex-col gap-4" value="daily">
            {classes.length === 0 ? (
              <EmptyState
                compact
                descriptionKey="kinder:ui.emptyDefaultDescription"
                icon={School}
                titleKey="kinder:attendance.noClasses"
              />
            ) : (
              <>
                <Suspense>
                  <ClassDateFilters classes={classes} />
                </Suspense>

                {classId ? (
                  <DailyAttendancePanel
                    key={`${classId}-${attendanceDate}`}
                    attendanceDate={attendanceDate}
                    classId={classId}
                    roster={roster}
                    schoolId={context.school.id}
                  />
                ) : null}
              </>
            )}
          </TabbedModuleContent>

          <TabbedModuleContent value="leave">
            <LeaveRequestsPanel
              leaveRequests={leaveRequests}
              schoolId={context.school.id}
              students={students}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="calendar">
            <AttendanceCalendarPanel leaveRequests={allLeaveRequests} />
          </TabbedModuleContent>

          <TabbedModuleContent value="report">
            <Suspense>
              <MonthlyReportPanel classes={classes} summary={monthlySummary} />
            </Suspense>
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(AttendancePage);
