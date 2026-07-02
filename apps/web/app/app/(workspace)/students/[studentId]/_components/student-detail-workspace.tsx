'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  PanelEmpty,
  SectionCard,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type {
  DailyReportAttachment,
  StudentDailyReport,
} from '~/lib/kinder/daily-reports/types';
import type {
  Student,
  StudentAllergy,
  StudentEmergencyContact,
  StudentMedicalRecord,
  StudentParent,
  StudentPickupPerson,
} from '~/lib/kinder/students/types';

import { DailyReportsPanel } from './daily-reports-panel';
import { ParentLinkPanel } from './parent-link-panel';
import { StudentContactsPanels } from './student-contacts-panels';
import { StudentProfileBento } from './student-profile-bento';

type ParentLink = {
  id: string;
  email?: string | null;
  relationship: string;
  is_primary: boolean;
  account: { id: string; name: string | null; email: string | null } | null;
};

type TimelineItem = {
  id: string;
  event_type: string;
  description: string | null;
  created_at: string;
};

export function StudentDetailWorkspace({
  student,
  schoolId,
  studentId,
  parents,
  emergencyContacts,
  medical,
  allergies,
  pickupPersons,
  timeline,
  parentLinks,
  dailyReports,
  dailyReportAttachments,
  hasParentPortal,
  hasDailyReports,
}: {
  student: Student;
  schoolId: string;
  studentId: string;
  parents: StudentParent[];
  emergencyContacts: StudentEmergencyContact[];
  medical: StudentMedicalRecord | null;
  allergies: StudentAllergy[];
  pickupPersons: StudentPickupPerson[];
  timeline: TimelineItem[];
  parentLinks: ParentLink[];
  dailyReports: StudentDailyReport[];
  dailyReportAttachments: Record<string, DailyReportAttachment[]>;
  hasParentPortal: boolean;
  hasDailyReports: boolean;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:students.detailHint" />}
          title={<Trans i18nKey="kinder:students.detail" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue="profile">
        <TabbedModuleList>
          <TabbedModuleTrigger value="profile">
            <Trans i18nKey="kinder:students.profile" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="contacts">
            <Trans i18nKey="kinder:students.parents" />
          </TabbedModuleTrigger>
          {hasParentPortal ? (
            <TabbedModuleTrigger value="parent">
              <Trans i18nKey="kinder:parent.title" />
            </TabbedModuleTrigger>
          ) : null}
          {hasDailyReports ? (
            <TabbedModuleTrigger value="reports">
              <Trans i18nKey="kinder:parent.tabs.reports" />
            </TabbedModuleTrigger>
          ) : null}
          <TabbedModuleTrigger value="timeline">
            <Trans i18nKey="kinder:students.timeline" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          value="profile"
        >
          <StudentProfileBento student={student} />
        </TabbedModuleContent>

        <TabbedModuleContent
          value="contacts"
        >
          <StudentContactsPanels
            allergies={allergies}
            emergencyContacts={emergencyContacts}
            medical={medical}
            parents={parents}
            pickupPersons={pickupPersons}
            schoolId={schoolId}
            studentId={studentId}
          />
        </TabbedModuleContent>

        {hasParentPortal ? (
          <TabbedModuleContent
            value="parent"
          >
            <ParentLinkPanel
              parentLinks={parentLinks}
              schoolId={schoolId}
              studentId={studentId}
            />
          </TabbedModuleContent>
        ) : null}

        {hasDailyReports ? (
          <TabbedModuleContent
            value="reports"
          >
            <DailyReportsPanel
              attachmentsByReportId={dailyReportAttachments}
              reports={dailyReports}
              schoolId={schoolId}
              studentId={studentId}
            />
          </TabbedModuleContent>
        ) : null}

        <TabbedModuleContent
          value="timeline"
        >
          <SectionCard title={<Trans i18nKey="kinder:students.timeline" />}>
            {timeline.length === 0 ? (
              <PanelEmpty messageKey="kinder:ui.emptyDefaultDescription" />
            ) : (
              <ul className="flex flex-col gap-3">
                {timeline.map((item) => (
                  <li
                    className="rounded-lg border border-border bg-muted/20 p-4 text-sm"
                    key={item.id}
                  >
                    <p className="font-medium">{item.event_type}</p>
                    {item.description ? (
                      <p className="text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground mt-2 text-xs">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
