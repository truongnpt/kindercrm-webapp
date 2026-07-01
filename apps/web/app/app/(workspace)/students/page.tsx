import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { loadStudents } from '~/lib/kinder/students/load-students';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateStudentDialog } from './_components/create-student-dialog';
import { StudentImportExport } from './_components/student-import-export';
import { StudentStatusFilter } from './_components/student-status-filter';
import { StudentsList } from './_components/students-list';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:students.title'),
  };
};

async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'students');

  const students = await loadStudents(context.school.id, status);

  return (
    <>
      <KinderPageHeader
        actions={
          <>
            <Suspense>
              <StudentStatusFilter />
            </Suspense>
            <StudentImportExport
              schoolId={context.school.id}
              students={students}
            />
            <CreateStudentDialog schoolId={context.school.id} />
          </>
        }
        description={<Trans i18nKey="kinder:students.description" />}
        title={<Trans i18nKey="kinder:students.title" />}
      />

      <KinderPageBody>
        <StudentsList students={students} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StudentsPage);
