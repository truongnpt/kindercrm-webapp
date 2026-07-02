import { Trans } from '@kit/ui/trans';

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

async function PlatformAccountPage() {
  const user = await requireUserInServerComponent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <Trans i18nKey="account:accountTabLabel" />
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          <Trans i18nKey="account:accountTabDescription" />
        </p>
      </div>

      <PersonalAccountSettingsPanel userId={user.id} />
    </div>
  );
}

export default withI18n(PlatformAccountPage);
