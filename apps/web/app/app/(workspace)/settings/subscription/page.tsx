import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import {
  getPastDueGraceDaysRemaining,
  getSubscriptionDisplayStatus,
  isPastDueGraceExpired,
  loadPublicPackages,
  loadSaasBillingInvoices,
  loadSubscriptionHistory,
} from '~/lib/kinder/subscription/features';
import { loadSchoolUsageSummary } from '~/lib/kinder/subscription/quotas';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { SubscriptionCheckoutToast } from './_components/subscription-checkout-toast';
import { SubscriptionWorkspace } from './_components/subscription-workspace';

import { isPaidCheckoutPackage } from '~/lib/kinder/billing/stripe-billing-shared';
import {
  anyPackageHasYearlyBilling,
  isStripeBillingEnabled,
} from '~/lib/kinder/billing/stripe-config';
import { getStripeVndPerUsd } from '~/lib/kinder/billing/stripe-vnd-exchange.server';

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
  const [packages, history, saasInvoices, usageSummary] = await Promise.all([
    loadPublicPackages(client),
    loadSubscriptionHistory(client, context.school.id),
    loadSaasBillingInvoices(client, context.school.id),
    loadSchoolUsageSummary(client, context),
  ]);

  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const isOwner = context.role === 'owner';
  const trialEnds = context.subscription?.trial_ends_at
    ? new Date(context.subscription.trial_ends_at).toLocaleDateString()
    : null;
  const stripeEnabled = isStripeBillingEnabled();
  const stripeVndPerUsd = stripeEnabled ? getStripeVndPerUsd() : null;
  const stripeCustomerId = context.subscription?.stripe_customer_id ?? null;
  const subscriptionStatus = context.subscription?.status ?? null;
  const displayStatus = getSubscriptionDisplayStatus(context.subscription);
  const effectivePackageName = context.effectivePackage?.name ?? null;
  const pastDueGraceDaysRemaining = getPastDueGraceDaysRemaining(
    context.subscription,
  );
  const pastDueGraceExpired = isPastDueGraceExpired(context.subscription);
  const yearlyBillingAvailable = anyPackageHasYearlyBilling(packages);
  const yearlyPackageIds = packages
    .filter(
      (pkg) =>
        isPaidCheckoutPackage(pkg) &&
        ((pkg.price_yearly ?? 0) > 0 || Boolean(pkg.stripe_price_yearly_id?.trim())),
    )
    .map((pkg) => pkg.id);

  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionCheckoutToast />
      </Suspense>
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
          displayStatus={displayStatus}
          effectivePackageName={effectivePackageName}
          history={history}
          isOwner={isOwner}
          isPastDueGraceExpired={pastDueGraceExpired}
          packageMap={packageMap}
          packages={packages}
          pastDueGraceDaysRemaining={pastDueGraceDaysRemaining}
          pkg={context.effectivePackage ?? context.package}
          limits={usageSummary.limits}
          saasInvoices={saasInvoices}
          schoolId={context.school.id}
          stripeCustomerId={stripeCustomerId}
          stripeEnabled={stripeEnabled}
          stripeVndPerUsd={stripeVndPerUsd}
          subscriptionStatus={subscriptionStatus}
          trialEnds={trialEnds}
          usage={usageSummary.usage}
          yearlyBillingAvailable={yearlyBillingAvailable}
          yearlyPackageIds={yearlyPackageIds}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(SubscriptionPage);
