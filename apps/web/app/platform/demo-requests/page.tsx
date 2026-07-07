import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadDemoRequests } from '~/lib/kinder/platform/load-demo-requests';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { DemoRequestsTable } from './_components/demo-requests-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.demoRequests.title'),
  };
};

async function PlatformDemoRequestsPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id, ['super_admin', 'support', 'billing']);
  const requests = await loadDemoRequests();

  return (
    <>
      <PlatformPageHeader
        description={<Trans i18nKey="kinder:platform.demoRequests.description" />}
        title={<Trans i18nKey="kinder:platform.demoRequests.title" />}
      />

      <PlatformPageBody>
        <DemoRequestsTable requests={requests} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformDemoRequestsPage);
