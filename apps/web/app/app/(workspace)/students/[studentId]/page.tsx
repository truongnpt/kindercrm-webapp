import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import {
  loadParentLinksForStudent,
} from '~/lib/kinder/parent/load-parent';
import {
  loadStudentDailyReports,
} from '~/lib/kinder/daily-reports/load-daily-reports';
import {
  hasPackageFeature,
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

import { DailyReportsPanel } from './_components/daily-reports-panel';
import { ParentLinkPanel } from './_components/parent-link-panel';
import { StudentContactsPanels } from './_components/student-contacts-panels';
import { StudentProfileForm } from './_components/student-profile-form';

export const generateMetadata = async () => {
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

  const hasParentPortal = hasPackageFeature(context.package, 'parent_portal');
  const hasDailyReports = hasPackageFeature(context.package, 'daily_reports');

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
  ]);

  return (
    <>
      <PageHeader
        description={student.student_code}
        title={student.full_name}
      />

      <PageBody>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <Trans i18nKey="kinder:students.profile" />
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Trans i18nKey="kinder:students.parents" />
            </TabsTrigger>
            {hasParentPortal ? (
              <TabsTrigger value="parent">
                <Trans i18nKey="kinder:parent.title" />
              </TabsTrigger>
            ) : null}
            {hasDailyReports ? (
              <TabsTrigger value="reports">
                <Trans i18nKey="kinder:parent.tabs.reports" />
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="timeline">
              <Trans i18nKey="kinder:students.timeline" />
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="profile">
            <StudentProfileForm
              schoolId={context.school.id}
              student={student}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="contacts">
            <StudentContactsPanels
              allergies={allergies}
              emergencyContacts={emergencyContacts}
              medical={medical}
              parents={parents}
              pickupPersons={pickupPersons}
              schoolId={context.school.id}
              studentId={studentId}
            />
          </TabsContent>

          {hasParentPortal ? (
            <TabsContent className="mt-4" value="parent">
              <ParentLinkPanel
                parentLinks={parentLinks}
                schoolId={context.school.id}
                studentId={studentId}
              />
            </TabsContent>
          ) : null}

          {hasDailyReports ? (
            <TabsContent className="mt-4" value="reports">
              <DailyReportsPanel
                reports={dailyReports}
                schoolId={context.school.id}
                studentId={studentId}
              />
            </TabsContent>
          ) : null}

          <TabsContent className="mt-4" value="timeline">
            <ul className="divide-y rounded-lg border">
              {timeline.map((item) => (
                <li className="space-y-1 p-3 text-sm" key={item.id}>
                  <p className="font-medium">{item.event_type}</p>
                  {item.description ? <p>{item.description}</p> : null}
                  <p className="text-muted-foreground text-xs">
                    {new Date(item.created_at).toLocaleString('vi-VN')}
                  </p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

export default withI18n(StudentDetailPage);
