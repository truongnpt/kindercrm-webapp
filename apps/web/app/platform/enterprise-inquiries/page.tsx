import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadEnterpriseInquiries } from '~/lib/kinder/platform/load-enterprise-inquiries';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { EnterpriseInquiriesTable } from './_components/enterprise-inquiries-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.enterpriseInquiries.title'),
  };
};

async function PlatformEnterpriseInquiriesPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id, ['super_admin', 'support', 'billing']);
  const inquiries = await loadEnterpriseInquiries();

  return (
    <>
      <PlatformPageHeader
        description={
          <Trans i18nKey="kinder:platform.enterpriseInquiries.description" />
        }
        title={<Trans i18nKey="kinder:platform.enterpriseInquiries.title" />}
      />

      <PlatformPageBody>
        <EnterpriseInquiriesTable inquiries={inquiries} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformEnterpriseInquiriesPage);
