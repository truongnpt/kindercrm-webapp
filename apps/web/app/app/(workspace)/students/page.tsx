import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { loadPublicPackages } from '~/lib/kinder/subscription/features';
import { loadQuotaFormSummary } from '~/lib/kinder/subscription/quotas';
import { loadStudents } from '~/lib/kinder/students/load-students';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { CreateStudentDialog } from './_components/create-student-dialog';
import { StudentsOverview } from './_components/students-overview';
import { StudentsWorkspace } from './_components/students-workspace';

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

  await assertModuleAccessFromContext(context, pathsConfig.app.students, 'view');

  const client = getSupabaseServerClient();
  const [students, allStudents, packages] = await Promise.all([
    loadStudents(context.school.id, status),
    loadStudents(context.school.id),
    loadPublicPackages(client),
  ]);
  const quotaSummary = await loadQuotaFormSummary(client, context, packages);

  return (
    <>
      <KinderPageHeader
        actions={
          <CreateStudentDialog
            quotaSummary={quotaSummary}
            schoolId={context.school.id}
          />
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:students.title" /> }]}
        description={<Trans i18nKey="kinder:students.description" />}
        title={<Trans i18nKey="kinder:students.title" />}
      />

      <KinderPageBody>
        <StudentsOverview students={allStudents} />
        <StudentsWorkspace
          schoolId={context.school.id}
          students={students}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StudentsPage);
