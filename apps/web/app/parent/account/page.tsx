import { Trans } from '@kit/ui/trans';

import { PersonalAccountSettingsPanel } from '~/components/personal-account-settings-panel';
import { ParentSectionHeader } from '~/components/parent-portal';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('account:accountTabLabel'),
  };
};

async function ParentAccountPage() {
  const user = await requireUserInServerComponent();

  return (
    <div className="flex flex-col gap-5">
      <ParentSectionHeader
        description={<Trans i18nKey="account:accountTabDescription" />}
        title={<Trans i18nKey="account:accountTabLabel" />}
      />

      <div className="parent-portal-card-lg [&_.rounded-lg]:rounded-xl">
        <PersonalAccountSettingsPanel userId={user.id} />
      </div>
    </div>
  );
}

export default withI18n(ParentAccountPage);
