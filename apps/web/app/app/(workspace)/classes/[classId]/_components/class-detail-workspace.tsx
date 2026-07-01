'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type {
  ClassEnrollment,
  ClassGroup,
  ClassSchedule,
} from '~/lib/kinder/classes/types';

import { ClassProfileBento } from './class-profile-bento';
import { ClassRosterPanel } from './class-roster-panel';
import { ClassSchedulePanel } from './class-schedule-panel';

export function ClassDetailWorkspace({
  cls,
  schoolId,
  enrollments,
  schedules,
  unassignedStudents,
  teacherName,
  allClasses,
}: {
  cls: ClassGroup;
  schoolId: string;
  enrollments: ClassEnrollment[];
  schedules: ClassSchedule[];
  unassignedStudents: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
  teacherName: string | null;
  allClasses: Array<{ id: string; name: string; code: string }>;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:classes.detailHint" />}
          title={<Trans i18nKey="kinder:classes.detail" />}
        />
      </div>

      <TabbedModule className="min-w-0 gap-0 p-4" defaultValue="profile">
        <TabbedModuleList >
          <TabbedModuleTrigger value="profile">
            <Trans i18nKey="kinder:classes.general" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="roster">
            <Trans i18nKey="kinder:classes.roster" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="schedule">
            <Trans i18nKey="kinder:classes.timetable" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          className="space-y-6 px-5 py-5 sm:px-6 sm:py-6"
          value="profile"
        >
          <ClassProfileBento
            cls={cls}
            enrollmentCount={enrollments.length}
            scheduleCount={schedules.length}
            teacherName={teacherName}
          />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="roster"
        >
          <ClassRosterPanel
            allClasses={allClasses}
            classId={cls.id}
            enrollments={enrollments}
            schoolId={schoolId}
            unassignedStudents={unassignedStudents}
          />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="schedule"
        >
          <ClassSchedulePanel
            classId={cls.id}
            schedules={schedules}
            schoolId={schoolId}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
