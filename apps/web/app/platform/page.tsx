import Link from 'next/link';

import { Building2, GraduationCap, PauseCircle, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader, StatCard } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformDashboardSummary } from '~/lib/kinder/platform/load-platform-dashboard';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.title'),
  };
};

async function PlatformDashboardPage() {
  const user = await requireUserInServerComponent();
  await requirePlatformAdminPage(user.id);
  const summary = await loadPlatformDashboardSummary();

  return (
    <>
      <KinderPageHeader
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

      <KinderPageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            href={pathsConfig.platform.schools}
            icon={Building2}
            labelKey="kinder:platform.stats.totalSchools"
            tone="info"
            value={String(summary.totalSchools)}
          />
          <StatCard
            href={`${pathsConfig.platform.schools}?status=active`}
            icon={GraduationCap}
            labelKey="kinder:platform.stats.activeSchools"
            tone="success"
            value={String(summary.activeSchools)}
          />
          <StatCard
            href={`${pathsConfig.platform.schools}?status=suspended`}
            icon={PauseCircle}
            labelKey="kinder:platform.stats.suspendedSchools"
            tone="warning"
            value={String(summary.suspendedSchools)}
          />
          <StatCard
            icon={Sparkles}
            labelKey="kinder:platform.stats.trialSchools"
            tone="default"
            value={String(summary.trialSchools)}
          />
        </div>
      </KinderPageBody>
    </>
  );
}

export default withI18n(PlatformDashboardPage);
