import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformSubscriptionCoupons } from '~/lib/kinder/platform/load-platform-coupons';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CouponCreateDialog } from './_components/coupon-create-dialog';
import { CouponsTable } from './_components/coupons-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.coupons.title'),
  };
};

async function PlatformCouponsPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id, ['super_admin', 'billing']);
  const coupons = await loadPlatformSubscriptionCoupons();

  return (
    <>
      <PlatformPageHeader
        actions={<CouponCreateDialog />}
        description={<Trans i18nKey="kinder:platform.coupons.description" />}
        title={<Trans i18nKey="kinder:platform.coupons.title" />}
      />

      <PlatformPageBody>
        <CouponsTable coupons={coupons} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformCouponsPage);
