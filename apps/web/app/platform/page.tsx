import Link from 'next/link';

import {
  Building2,
  CreditCard,
  GraduationCap,
  PauseCircle,
  Sparkles,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  PlatformPageBody,
  PlatformPageHeader,
  PlatformStatCard,
} from '~/components/platform-console';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformDashboardSummary } from '~/lib/kinder/platform/load-platform-dashboard';
import { loadPlatformSubscriptionAnalytics } from '~/lib/kinder/platform/load-platform-subscription-analytics';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PlatformSubscriptionAnalyticsPanel } from './_components/platform-subscription-analytics-panel';
import { formatVnd } from '~/lib/kinder/billing/format-currency';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.title'),
  };
};

async function PlatformDashboardPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id);
  const [summary, analytics] = await Promise.all([
    loadPlatformDashboardSummary(),
    loadPlatformSubscriptionAnalytics(),
  ]);

  return (
    <>
      <PlatformPageHeader
        description={<Trans i18nKey="kinder:platform.description" />}
        title={<Trans i18nKey="kinder:platform.title" />}
        actions={
          <Button asChild>
            <Link href={pathsConfig.platform.schools}>
              <Trans i18nKey="kinder:platform.nav.schools" />
            </Link>
          </Button>
        }
      />

      <PlatformPageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PlatformStatCard
            href={pathsConfig.platform.schools}
            icon={Building2}
            labelKey="kinder:platform.stats.totalSchools"
            tone="info"
            value={String(summary.totalSchools)}
          />
          <PlatformStatCard
            href={`${pathsConfig.platform.schools}?status=active`}
            icon={GraduationCap}
            labelKey="kinder:platform.stats.activeSchools"
            tone="success"
            value={String(summary.activeSchools)}
          />
          <PlatformStatCard
            icon={CreditCard}
            labelKey="kinder:platform.stats.activePaidSchools"
            tone="success"
            value={String(analytics.snapshot.activePaidSchools)}
          />
          <PlatformStatCard
            icon={Sparkles}
            labelKey="kinder:platform.stats.trialSchools"
            value={String(summary.trialSchools)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PlatformStatCard
            href={`${pathsConfig.platform.schools}?status=suspended`}
            icon={PauseCircle}
            labelKey="kinder:platform.stats.suspendedSchools"
            tone="warning"
            value={String(summary.suspendedSchools)}
          />
          <PlatformStatCard
            icon={CreditCard}
            labelKey="kinder:platform.analytics.estimatedMrr"
            value={formatVnd(analytics.snapshot.estimatedMrr)}
          />
          <PlatformStatCard
            labelKey="kinder:platform.analytics.trialConversion"
            value={`${analytics.snapshot.trialConversionRate}%`}
          />
        </div>

        <PlatformSubscriptionAnalyticsPanel analytics={analytics} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformDashboardPage);
