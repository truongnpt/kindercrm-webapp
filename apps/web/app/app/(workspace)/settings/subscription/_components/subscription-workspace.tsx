'use client';

import { useState } from 'react';

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
import type {
  Package,
  SubscriptionDisplayStatus,
  SubscriptionStatus,
} from '~/lib/kinder/types';
import type { SubscriptionHistoryEntry } from '~/lib/kinder/subscription/subscription-history';
import type { SaasBillingInvoice } from '~/lib/kinder/subscription/issue-saas-invoice';
import type { SubscriptionBillingInterval } from '~/lib/kinder/subscription/subscription-billing-interval';

import { QuotaUsageBanner } from '../../../_components/quota-usage-banner';
import { BillingIntervalToggle } from './billing-interval-toggle';
import { SubscriptionBillingSection } from './subscription-billing-section';
import { PackageComparisonTable } from './package-comparison-table';
import {
  SubscriptionCouponField,
  type AppliedSubscriptionCoupon,
} from './subscription-coupon-field';
import { SubscriptionInvoicesPanel } from './subscription-invoices-panel';
import { SubscriptionPlans } from './subscription-plans';
import {
  SubscriptionHistoryPanel,
  SubscriptionPlanPanel,
} from './subscription-panels';

type HistoryItem = SubscriptionHistoryEntry;

export function SubscriptionWorkspace({
  defaultTab,
  currentPackageName,
  currentPackageId,
  subscriptionStatus,
  displayStatus,
  effectivePackageName,
  pastDueGraceDaysRemaining,
  isPastDueGraceExpired,
  isOwner,
  trialEnds,
  packages,
  schoolId,
  stripeEnabled,
  stripeCustomerId,
  stripeVndPerUsd,
  history,
  saasInvoices,
  packageMap,
  pkg,
  limits,
  usage,
  yearlyBillingAvailable,
  yearlyPackageIds,
}: {
  defaultTab: string;
  currentPackageName: string;
  currentPackageId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  displayStatus: SubscriptionDisplayStatus;
  effectivePackageName: string | null;
  pastDueGraceDaysRemaining: number | null;
  isPastDueGraceExpired: boolean;
  isOwner: boolean;
  trialEnds: string | null;
  packages: Package[];
  schoolId: string;
  stripeEnabled: boolean;
  stripeCustomerId: string | null;
  stripeVndPerUsd: number | null;
  history: HistoryItem[];
  saasInvoices: SaasBillingInvoice[];
  packageMap: Map<string, Package>;
  pkg: Package | null;
  limits?: { maxStorageMb: number };
  usage: { students: number; campuses: number; storageBytes: number };
  yearlyBillingAvailable: boolean;
  yearlyPackageIds: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;
  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedSubscriptionCoupon | null>(null);
  const [billingInterval, setBillingInterval] =
    useState<SubscriptionBillingInterval>('monthly');

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(
      `${pathsConfig.app.settingsSubscription}?${params.toString()}`,
      { scroll: false },
    );
  };

  const showBillingInterval =
    stripeEnabled && yearlyBillingAvailable && isOwner;

  return (
    <BentoTile className="min-w-0">
      <div className="border-b border-border py-4">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:subscription.workspaceHint" />}
          title={<Trans i18nKey="kinder:subscription.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 mt-6"
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
              displayStatus={displayStatus}
              effectivePackageName={effectivePackageName}
              isPastDueGraceExpired={isPastDueGraceExpired}
              pastDueGraceDaysRemaining={pastDueGraceDaysRemaining}
              subscriptionStatus={subscriptionStatus}
              trialEnds={trialEnds}
            />
            <SubscriptionBillingSection
              isOwner={isOwner}
              schoolId={schoolId}
              stripeCustomerId={stripeCustomerId}
              stripeEnabled={stripeEnabled}
              subscriptionStatus={subscriptionStatus}
            />
            {showBillingInterval ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm">
                  <Trans i18nKey="kinder:subscription.billingInterval.hint" />
                </p>
                <BillingIntervalToggle
                  onChange={setBillingInterval}
                  value={billingInterval}
                />
              </div>
            ) : null}
            <SubscriptionCouponField
              appliedCoupon={appliedCoupon}
              currentPackageId={currentPackageId}
              isOwner={isOwner}
              onAppliedCouponChange={setAppliedCoupon}
              packages={packages}
              schoolId={schoolId}
              stripeEnabled={stripeEnabled}
            />
            <SubscriptionPlans
              appliedCoupon={appliedCoupon}
              billingInterval={billingInterval}
              currentPackageId={currentPackageId}
              isOwner={isOwner}
              packages={packages}
              schoolId={schoolId}
              stripeEnabled={stripeEnabled}
              stripeVndPerUsd={stripeVndPerUsd}
              yearlyPackageIds={yearlyPackageIds}
            />
            <PackageComparisonTable
              currentPackageId={currentPackageId}
              packages={packages}
            />
          </div>
        </TabbedModuleContent>

        <TabbedModuleContent value="usage">
          <QuotaUsageBanner
            limits={limits}
            package={pkg ?? null}
            showUpgradeLink
            usage={usage}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="history">
          <div className="space-y-4">
            <SubscriptionInvoicesPanel invoices={saasInvoices} />
            <SubscriptionHistoryPanel
              history={history}
              packageMap={packageMap}
            />
          </div>
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
