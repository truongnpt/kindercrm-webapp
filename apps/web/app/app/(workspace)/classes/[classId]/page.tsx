import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import {
  loadClassById,
  loadClassEnrollments,
  loadClassSchedules,
  loadClasses,
  loadTeachersForSchool,
  loadUnassignedStudents,
} from '~/lib/kinder/classes/load-classes';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ClassDetailPanel } from './_components/class-detail-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:classes.detail'),
  };
};

async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'classes');

  const cls = await loadClassById(context.school.id, classId);

  if (!cls) {
    notFound();
  }

  const [enrollments, schedules, unassignedStudents, teachers, allClasses] =
    await Promise.all([
      loadClassEnrollments(context.school.id, classId),
      loadClassSchedules(context.school.id, classId),
      loadUnassignedStudents(context.school.id),
      loadTeachersForSchool(context.school.id),
      loadClasses(context.school.id),
    ]);

  const teacherName =
    teachers.find((t) => t.id === cls.teacher_user_id)?.name ?? null;

  return (
    <>
      <PageHeader
        description={cls.code}
        title={cls.name}
      />

      <PageBody>
        <ClassDetailPanel
          allClasses={allClasses.map((item) => ({
            id: item.id,
            name: item.name,
            code: item.code,
          }))}
          cls={cls}
          enrollments={enrollments}
          schedules={schedules}
          schoolId={context.school.id}
          teacherName={teacherName}
          teachers={teachers}
          unassignedStudents={unassignedStudents}
        />
      </PageBody>
    </>
  );
}

export default withI18n(ClassDetailPage);
