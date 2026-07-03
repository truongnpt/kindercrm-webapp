import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformAuditLogs } from '~/lib/kinder/platform/load-platform-ops';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { AuditLogsTable } from './_components/audit-logs-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.audit.title'),
  };
};

async function PlatformAuditLogsPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id);
  const logs = await loadPlatformAuditLogs();

  return (
    <>
      <PlatformPageHeader
        description={<Trans i18nKey="kinder:platform.audit.description" />}
        title={<Trans i18nKey="kinder:platform.audit.title" />}
      />

      <PlatformPageBody>
        <AuditLogsTable logs={logs} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformAuditLogsPage);
