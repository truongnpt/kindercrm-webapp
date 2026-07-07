import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformPackages } from '~/lib/kinder/platform/load-platform-ops';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PackagesTable } from './_components/packages-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.packages.title'),
  };
};

async function PlatformPackagesPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id, ['super_admin', 'billing']);
  const packages = await loadPlatformPackages();

  return (
    <>
      <PlatformPageHeader
        description={<Trans i18nKey="kinder:platform.packages.description" />}
        title={<Trans i18nKey="kinder:platform.packages.title" />}
      />

      <PlatformPageBody>
        <PackagesTable packages={packages} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformPackagesPage);
