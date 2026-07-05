'use client';

import { Building2, ClipboardList, CreditCard, FileText } from 'lucide-react';
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
import type { PaymentSettingsBundle } from '~/lib/kinder/payment-settings/types';

import { BankAccountsPanel } from './bank-accounts-panel';
import { PaymentAuditPanel } from './payment-audit-panel';
import { PaymentInstructionsPanel } from './payment-instructions-panel';
import { PaymentMethodsPanel } from './payment-methods-panel';

type CampusOption = { id: string; name: string };

export function PaymentSettingsWorkspace({
  schoolId,
  settings,
  campuses,
}: {
  schoolId: string;
  settings: PaymentSettingsBundle;
  campuses: CampusOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'methods';

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.settingsPayment}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:paymentSettings.workspaceHint" />}
          title={<Trans i18nKey="kinder:paymentSettings.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="methods">
            <CreditCard className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:paymentSettings.tabs.methods" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="accounts">
            <Building2 className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:paymentSettings.tabs.accounts" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="instructions">
            <FileText className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:paymentSettings.tabs.instructions" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="audit">
            <ClipboardList className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:paymentSettings.tabs.audit" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="methods">
          <PaymentMethodsPanel methods={settings.methods} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent value="accounts">
          <BankAccountsPanel
            accounts={settings.accounts}
            campuses={campuses}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="instructions">
          <PaymentInstructionsPanel
            instructions={settings.instructions}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="audit">
          <PaymentAuditPanel logs={settings.auditLogs} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
