import { Badge } from '@kit/ui/badge';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
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

  return (
    <>
      <PageHeader
        description={<Trans i18nKey="kinder:subscription.description" />}
        title={<Trans i18nKey="kinder:subscription.title" />}
      />

      <PageBody className="space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:subscription.currentPlan" />
            </p>
            <p className="text-xl font-semibold">
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

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            <Trans i18nKey="kinder:subscription.history" />
          </h2>

          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:subscription.historyEmpty" />
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {history.map((item) => (
                <li className="space-y-1 p-4 text-sm" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {packageMap.get(item.package_id)?.name ?? item.package_id}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {item.previous_package_id ? (
                    <p className="text-muted-foreground">
                      {packageMap.get(item.previous_package_id)?.name ??
                        item.previous_package_id}{' '}
                      → {packageMap.get(item.package_id)?.name}
                    </p>
                  ) : null}
                  {item.note ? (
                    <p className="text-muted-foreground">{item.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageBody>
    </>
  );
}

export default withI18n(SubscriptionPage);
