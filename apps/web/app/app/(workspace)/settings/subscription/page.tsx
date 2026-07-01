import { History } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  EmptyState,
  InlineAlert,
  KinderPageBody,
  KinderPageHeader,
  SectionCard,
} from '~/components/kinder-ui';
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

import { QuotaUsageBanner } from '../../_components/quota-usage-banner';
import { SubscriptionPlans } from './_components/subscription-plans';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:subscription.title'),
  };
};

async function SubscriptionPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  const client = getSupabaseServerClient();
  const [packages, history, usageSummary] = await Promise.all([
    loadPublicPackages(client),
    loadSubscriptionHistory(client, context.school.id),
    loadSchoolUsageSummary(client, context),
  ]);

  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const isOwner = context.role === 'owner';
  const trialEnds = context.subscription?.trial_ends_at
    ? new Date(context.subscription.trial_ends_at).toLocaleDateString('vi-VN')
    : null;
  const isTrial = isActiveTrialSubscription(context.subscription);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:subscription.title" /> }]}
        description={<Trans i18nKey="kinder:subscription.description" />}
        title={<Trans i18nKey="kinder:subscription.title" />}
      />

      <KinderPageBody>
        <SectionCard>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-muted-foreground text-sm">
                <Trans i18nKey="kinder:subscription.currentPlan" />
              </p>
              <p className="text-foreground text-2xl font-semibold tracking-tight">
                {context.package?.name ?? '—'}
              </p>
            </div>
            {context.subscription?.status === 'trial' ? (
              <Badge variant="secondary">
                <Trans i18nKey="kinder:subscription.trialBadge" />
              </Badge>
            ) : (
              <Badge>
                <Trans i18nKey="kinder:subscription.activeBadge" />
              </Badge>
            )}
          </div>
        </SectionCard>

        {isTrial && trialEnds ? (
          <InlineAlert tone="info">
            <Trans
              i18nKey="kinder:subscription.trialFullAccess"
              values={{ date: trialEnds }}
            />
          </InlineAlert>
        ) : null}

        <QuotaUsageBanner
          package={context.package}
          usage={usageSummary.usage}
        />

        <SubscriptionPlans
          currentPackageId={context.package?.id ?? null}
          isOwner={isOwner}
          packages={packages}
          schoolId={context.school.id}
        />

        <SectionCard title={<Trans i18nKey="kinder:subscription.history" />}>
          {history.length === 0 ? (
            <EmptyState
              compact
              descriptionKey="kinder:ui.emptyDefaultDescription"
              icon={History}
              titleKey="kinder:subscription.historyEmpty"
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {history.map((item) => (
                <li className="kinder-mobile-card text-sm" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {packageMap.get(item.package_id)?.name ?? item.package_id}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {item.previous_package_id ? (
                    <p className="text-muted-foreground mt-1">
                      {packageMap.get(item.previous_package_id)?.name ??
                        item.previous_package_id}{' '}
                      → {packageMap.get(item.package_id)?.name}
                    </p>
                  ) : null}
                  {item.note ? (
                    <p className="text-muted-foreground mt-1">{item.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </KinderPageBody>
    </>
  );
}

export default withI18n(SubscriptionPage);
