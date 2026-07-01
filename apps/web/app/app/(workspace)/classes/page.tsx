import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import { ensureDefaultSchoolYear } from '~/lib/kinder/classes/seed-school-year';
import {
  loadClassrooms,
  loadClasses,
  loadSchoolYears,
  loadSemesters,
  loadTeachersForSchool,
} from '~/lib/kinder/classes/load-classes';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ClassesList } from './_components/classes-list';
import { ClassesSetupPanel } from './_components/classes-setup-panel';
import { CreateClassDialog } from './_components/create-class-dialog';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:classes.title'),
  };
};

async function ClassesPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'classes');

  const client = getSupabaseServerClient();
  await ensureDefaultSchoolYear(client, context.school.id);

  const schoolYears = await loadSchoolYears(context.school.id);
  const currentYear =
    schoolYears.find((y) => y.is_current) ?? schoolYears[0]!;

  const [semesters, classrooms, classes, teachers] = await Promise.all([
    loadSemesters(context.school.id, currentYear.id),
    loadClassrooms(context.school.id),
    loadClasses(context.school.id, currentYear.id),
    loadTeachersForSchool(context.school.id),
  ]);

  return (
    <>
      <KinderPageHeader
        actions={
          <CreateClassDialog
            classrooms={classrooms}
            defaultSchoolYearId={currentYear.id}
            schoolId={context.school.id}
            schoolYears={schoolYears}
            semesters={semesters}
            teachers={teachers}
          />
        }
        description={<Trans i18nKey="kinder:classes.description" />}
        title={<Trans i18nKey="kinder:classes.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue="classes">
          <TabbedModuleList>
            <TabbedModuleTrigger value="classes">
              <Trans i18nKey="common:routes.classes" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="setup">
              <Trans i18nKey="kinder:classes.setup" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="classes">
            <ClassesList classes={classes} />
          </TabbedModuleContent>

          <TabbedModuleContent value="setup">
            <ClassesSetupPanel
              classrooms={classrooms}
              schoolId={context.school.id}
              schoolYears={schoolYears}
            />
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(ClassesPage);
