import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import {
  isActiveTrialSubscription,
  loadPublicPackages,
  loadSubscriptionHistory,
} from '~/lib/kinder/subscription/features';
import { loadSchoolUsageSummary } from '~/lib/kinder/subscription/quotas';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { SubscriptionWorkspace } from './_components/subscription-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:subscription.title'),
  };
};

async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.settingsSubscription,
    'view',
  );

  const client = getSupabaseServerClient();
  const [packages, history, usageSummary] = await Promise.all([
    loadPublicPackages(client),
    loadSubscriptionHistory(client, context.school.id),
    loadSchoolUsageSummary(client, context),
  ]);

  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const isOwner = context.role === 'owner';
  const trialEnds = context.subscription?.trial_ends_at
    ? new Date(context.subscription.trial_ends_at).toLocaleDateString()
    : null;
  const isTrial = isActiveTrialSubscription(context.subscription);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[
          {
            label: <Trans i18nKey="common:routes.settings" />,
          },
          { label: <Trans i18nKey="kinder:subscription.title" /> },
        ]}
        description={<Trans i18nKey="kinder:subscription.description" />}
        title={<Trans i18nKey="kinder:subscription.title" />}
      />

      <KinderPageBody>
        <SubscriptionWorkspace
          currentPackageId={context.package?.id ?? null}
          currentPackageName={context.package?.name ?? '—'}
          defaultTab={tab ?? 'plan'}
          history={history}
          isOwner={isOwner}
          isTrial={isTrial}
          packageMap={packageMap}
          packages={packages}
          pkg={context.package}
          schoolId={context.school.id}
          trialEnds={trialEnds}
          usage={usageSummary.usage}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(SubscriptionPage);
