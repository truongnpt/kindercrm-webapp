import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { redirect } from 'next/navigation';

import type { SupabaseClient } from '@supabase/supabase-js';

import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { ensureDefaultSchoolYear } from '~/lib/kinder/classes/seed-school-year';
import {
  loadClassrooms,
  loadClasses,
  loadSchoolYears,
  loadSemesters,
  loadTeachersForSchool,
} from '~/lib/kinder/classes/load-classes';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { CLASSES_PERMISSIONS, hasPermission, loadMemberPermissions } from '~/lib/kinder/permissions';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import type { Database } from '~/lib/database.types';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ClassesWorkspace } from './_components/classes_workspace';
import { CreateClassDialog } from './_components/create-class-dialog';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:classes.title'),
  };
};

async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: 'classes' | 'setup';
  }>;
}) {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(context, pathsConfig.app.classes, 'view');

  const client = getSupabaseServerClient() as SupabaseClient<Database>;
  await ensureDefaultSchoolYear(client, context.school.id);

  const schoolYears = await loadSchoolYears(context.school.id);
  const currentYear =
    schoolYears.find((y) => y.is_current) ?? schoolYears[0]!;

  const params = await searchParams;
  const requestedTab = params.tab ?? 'classes';

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );
  const canManageClasses = hasPermission(
    memberPermissions,
    CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
  );

  if (requestedTab === 'setup' && !canManageClasses) {
    redirect(pathsConfig.app.classes);
  }

  const classes = await loadClasses(context.school.id, currentYear.id);

  const [semesters, classrooms, teachers] = canManageClasses ? await Promise.all([
    loadSemesters(context.school.id, currentYear.id),
    loadClassrooms(context.school.id),
    loadTeachersForSchool(context.school.id),
  ]) : [[], [], []];

  return (
    <>
      <KinderPageHeader
        actions={
          canManageClasses ? (
            <CreateClassDialog
              classrooms={classrooms}
              defaultSchoolYearId={currentYear.id}
              schoolId={context.school.id}
              schoolYears={schoolYears}
              semesters={semesters}
              teachers={teachers}
            />
          ) : undefined
        }
        description={<Trans i18nKey="kinder:classes.description" />}
        title={<Trans i18nKey="kinder:classes.title" />}
      />

      <KinderPageBody>
        <ClassesWorkspace
          classes={classes}
          classrooms={classrooms}
          defaultTab={requestedTab}
          canManageClasses={canManageClasses}
          schoolId={context.school.id}
          schoolYears={schoolYears}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(ClassesPage);
