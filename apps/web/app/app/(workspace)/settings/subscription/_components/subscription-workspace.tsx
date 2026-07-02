'use client';

import { CreditCard, Gauge, History } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { Package } from '~/lib/kinder/types';

import { QuotaUsageBanner } from '../../../_components/quota-usage-banner';
import { SubscriptionPlans } from './subscription-plans';
import {
  SubscriptionHistoryPanel,
  SubscriptionPlanPanel,
} from './subscription-panels';

type HistoryItem = {
  id: string;
  package_id: string;
  previous_package_id: string | null;
  created_at: string;
  note: string | null;
};

export function SubscriptionWorkspace({
  defaultTab,
  currentPackageName,
  currentPackageId,
  isOwner,
  isTrial,
  trialEnds,
  packages,
  schoolId,
  history,
  packageMap,
  pkg,
  usage,
}: {
  defaultTab: string;
  currentPackageName: string;
  currentPackageId: string | null;
  isOwner: boolean;
  isTrial: boolean;
  trialEnds: string | null;
  packages: Package[];
  schoolId: string;
  history: HistoryItem[];
  packageMap: Map<string, Package>;
  pkg: Package | null;
  usage: { campuses: number; students: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.settingsSubscription}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:subscription.workspaceHint" />}
          title={<Trans i18nKey="kinder:subscription.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="plan">
            <CreditCard className="mr-2 size-4" />
            <Trans i18nKey="kinder:subscription.tabs.plan" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="usage">
            <Gauge className="mr-2 size-4" />
            <Trans i18nKey="kinder:subscription.tabs.usage" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="history">
            <History className="mr-2 size-4" />
            <Trans i18nKey="kinder:subscription.tabs.history" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="plan">
          <div className="space-y-4">
            <SubscriptionPlanPanel
              currentPackageName={currentPackageName}
              isTrial={isTrial}
              trialEnds={trialEnds}
            />
            <SubscriptionPlans
              currentPackageId={currentPackageId}
              isOwner={isOwner}
              packages={packages}
              schoolId={schoolId}
            />
          </div>
        </TabbedModuleContent>

        <TabbedModuleContent value="usage">
          <QuotaUsageBanner package={pkg} usage={usage} />
        </TabbedModuleContent>

        <TabbedModuleContent value="history">
          <SubscriptionHistoryPanel
            history={history}
            packageMap={packageMap}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
