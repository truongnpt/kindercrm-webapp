import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { loadPaymentSettings } from '~/lib/kinder/payment-settings/load-payment-settings';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PaymentSettingsWorkspace } from './_components/payment-settings-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:paymentSettings.title'),
  };
};

async function PaymentSettingsPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.settingsPayment,
    'manage',
  );

  const [settings, campuses] = await Promise.all([
    loadPaymentSettings(context.school.id),
    loadCampuses(context.school.id),
  ]);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          { label: <Trans i18nKey="common:routes.settings" /> },
          { label: <Trans i18nKey="kinder:paymentSettings.title" /> },
        ]}
        description={<Trans i18nKey="kinder:paymentSettings.description" />}
        title={<Trans i18nKey="kinder:paymentSettings.title" />}
      />

      <KinderPageBody>
        <PaymentSettingsWorkspace
          campuses={campuses}
          schoolId={context.school.id}
          settings={settings}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(PaymentSettingsPage);
