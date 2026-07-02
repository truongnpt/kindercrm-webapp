import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { SchoolSettingsWorkspace } from './_components/school-settings-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:schoolSettings.title'),
  };
};

async function SchoolSettingsPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.settingsSchool,
    'manage',
  );

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="common:routes.settings" />,
          },
          { label: <Trans i18nKey="kinder:schoolSettings.title" /> },
        ]}
        description={<Trans i18nKey="kinder:schoolSettings.description" />}
        title={<Trans i18nKey="kinder:schoolSettings.title" />}
      />

      <KinderPageBody>
        <SchoolSettingsWorkspace school={context.school} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(SchoolSettingsPage);
