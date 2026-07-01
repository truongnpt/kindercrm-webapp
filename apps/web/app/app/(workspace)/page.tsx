import Link from 'next/link';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { getAiCreditStatus } from '~/lib/kinder/ai/credits';
import { getAiConfig } from '~/lib/kinder/ai/config';
import { loadDashboardSummary } from '~/lib/kinder/dashboard/load-dashboard';
import {
  hasPackageFeature,
} from '~/lib/kinder/subscription/features';
import { loadSchoolUsageSummary } from '~/lib/kinder/subscription/quotas';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { DashboardOverview } from './_components/dashboard-overview';
import { QuotaUsageBanner } from './_components/quota-usage-banner';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:dashboard.title'),
  };
};

async function DashboardPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  const client = getSupabaseServerClient();
  const [usageSummary, summary] = await Promise.all([
    loadSchoolUsageSummary(client, context),
    loadDashboardSummary(context.school.id),
  ]);

  const hasAi = hasPackageFeature(context.package, 'ai_assistant');
  const [aiCredits, aiConfig] = hasAi
    ? await Promise.all([
        getAiCreditStatus(context.school.id, context.package),
        Promise.resolve(getAiConfig()),
      ])
    : [null, null];

  const trialEnds = context.subscription?.trial_ends_at
    ? new Date(context.subscription.trial_ends_at).toLocaleDateString('vi-VN')
    : null;

  const features = {
    crm: hasPackageFeature(context.package, 'crm'),
    students: hasPackageFeature(context.package, 'students'),
    finance: hasPackageFeature(context.package, 'finance'),
    attendance: hasPackageFeature(context.package, 'attendance'),
  };

  return (
    <>
      <PageHeader
        description={
          <Trans
            i18nKey="kinder:dashboard.description"
            values={{ schoolName: context.school.name }}
          />
        }
        title={<Trans i18nKey="kinder:dashboard.title" />}
      />

      <PageBody className="space-y-4">
        <QuotaUsageBanner
          package={context.package}
          usage={usageSummary.usage}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:dashboard.packageLabel" />
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {context.package?.name ?? '—'}
            </p>
            {trialEnds ? (
              <p className="text-muted-foreground mt-2 text-sm">
                <Trans
                  i18nKey="kinder:dashboard.trialEnds"
                  values={{ date: trialEnds }}
                />
              </p>
            ) : null}
            <Link
              className="text-primary mt-3 inline-block text-sm hover:underline"
              href={pathsConfig.app.settingsSubscription}
            >
              <Trans i18nKey="kinder:subscription.title" />
            </Link>
          </div>

          {hasAi && aiCredits ? (
            <div className="rounded-lg border p-6">
              <p className="text-muted-foreground text-sm">
                <Trans i18nKey="kinder:ai.creditsLabel" />
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {aiCredits.creditsRemaining} / {aiCredits.creditsLimit}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {aiConfig?.isConfigured ? (
                  <Trans i18nKey="kinder:ai.providerReady" />
                ) : (
                  <Trans i18nKey="kinder:ai.providerFallback" />
                )}
              </p>
              <Link
                className="text-primary mt-3 inline-block text-sm hover:underline"
                href={pathsConfig.app.ai}
              >
                <Trans i18nKey="kinder:ai.title" />
              </Link>
            </div>
          ) : null}
        </div>

        <DashboardOverview features={features} summary={summary} />
      </PageBody>
    </>
  );
}

export default withI18n(DashboardPage);
