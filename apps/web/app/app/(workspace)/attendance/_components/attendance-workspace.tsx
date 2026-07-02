'use client';

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { AttendanceMonthlySummary } from '~/lib/kinder/attendance/types';
import type { ClassRosterStudent } from '~/lib/kinder/attendance/types';
import type { LeaveRequestWithStudent } from '~/lib/kinder/attendance/types';
import type { ClassGroup } from '~/lib/kinder/classes/types';

import { AttendanceCalendarPanel } from './attendance-calendar-panel';
import { ClassDateFilters } from './class-date-filters';
import { DailyAttendancePanel } from './daily-attendance-panel';
import { LeaveRequestsPanel } from './leave-requests-panel';
import { MonthlyReportPanel } from './monthly-report-panel';

export function AttendanceWorkspace({
  schoolId,
  defaultTab,
  classes,
  classId,
  attendanceDate,
  roster,
  leaveRequests,
  students,
  monthlySummary,
}: {
  schoolId: string;
  defaultTab: string;
  classes: ClassGroup[];
  classId?: string;
  attendanceDate: string;
  roster: ClassRosterStudent[];
  leaveRequests: LeaveRequestWithStudent[];
  students: Array<{
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  }>;
  monthlySummary: AttendanceMonthlySummary;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.attendance}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:attendance.workspaceHint" />}
          title={<Trans i18nKey="kinder:attendance.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="daily">
            <ClipboardList className="mr-2 size-4" />
            <Trans i18nKey="kinder:attendance.tabs.daily" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="leave">
            <FileText className="mr-2 size-4" />
            <Trans i18nKey="kinder:attendance.tabs.leave" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="calendar">
            <CalendarDays className="mr-2 size-4" />
            <Trans i18nKey="kinder:attendance.tabs.calendar" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="report">
            <BarChart3 className="mr-2 size-4" />
            <Trans i18nKey="kinder:attendance.tabs.report" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="daily">
          {classes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:attendance.noClasses" />
            </p>
          ) : (
            <div className="space-y-4">
              <ClassDateFilters classes={classes} />
              {classId ? (
                <DailyAttendancePanel
                  key={`${classId}-${attendanceDate}`}
                  attendanceDate={attendanceDate}
                  classId={classId}
                  roster={roster}
                  schoolId={schoolId}
                />
              ) : null}
            </div>
          )}
        </TabbedModuleContent>

        <TabbedModuleContent value="leave">
          <LeaveRequestsPanel
            leaveRequests={leaveRequests}
            schoolId={schoolId}
            students={students}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="calendar">
          <AttendanceCalendarPanel leaveRequests={leaveRequests} />
        </TabbedModuleContent>

        <TabbedModuleContent value="report">
          <MonthlyReportPanel classes={classes} summary={monthlySummary} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
