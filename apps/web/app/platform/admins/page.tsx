import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformAdmins } from '~/lib/kinder/platform/load-platform-ops';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PlatformAdminsPanel } from './_components/platform-admins-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.admins.title'),
  };
};

async function PlatformAdminsPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id, ['super_admin']);
  const admins = await loadPlatformAdmins();

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="kinder:platform.admins.description" />}
        title={<Trans i18nKey="kinder:platform.admins.title" />}
      />

      <KinderPageBody>
        <PlatformAdminsPanel admins={admins} currentUserId={user.id} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(PlatformAdminsPage);
