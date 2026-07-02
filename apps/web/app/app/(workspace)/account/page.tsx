import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import { PersonalAccountSettingsPanel } from '~/components/personal-account-settings-panel';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('account:accountTabLabel'),
  };
};

async function AppAccountPage() {
  const user = await requireUserInServerComponent();

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="account:accountTabDescription" />}
        title={<Trans i18nKey="account:accountTabLabel" />}
      />

      <KinderPageBody>
        <PersonalAccountSettingsPanel userId={user.id} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(AppAccountPage);
