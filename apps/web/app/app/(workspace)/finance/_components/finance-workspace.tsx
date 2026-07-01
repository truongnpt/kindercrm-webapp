'use client';

import { FileText, Receipt, Wallet } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type {
  FinanceSummary,
  InvoiceWithStudent,
  TuitionFeeItem,
} from '~/lib/kinder/finance/types';

import { DebtsList } from './debts-list';
import { FinanceDashboard } from './finance-dashboard';
import { InvoicesList } from './invoices-list';
import { TuitionFeesPanel } from './tuition-fees-panel';

export function FinanceWorkspace({
  defaultTab,
  summary,
  invoices,
  debts,
  feeItems,
  schoolId,
}: {
  defaultTab: string;
  summary: FinanceSummary;
  invoices: InvoiceWithStudent[];
  debts: InvoiceWithStudent[];
  feeItems: TuitionFeeItem[];
  schoolId: string;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:finance.workspaceHint" />}
          title={<Trans i18nKey="kinder:finance.workspaceTitle" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue={defaultTab}>
        <TabbedModuleList>
          <TabbedModuleTrigger value="overview">
            <Trans i18nKey="kinder:finance.tabs.overview" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="invoices">
            <Receipt className="mr-2 size-4" />
            <Trans i18nKey="kinder:finance.tabs.invoices" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="tuition">
            <FileText className="mr-2 size-4" />
            <Trans i18nKey="kinder:finance.tabs.tuition" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="debts">
            <Wallet className="mr-2 size-4" />
            <Trans i18nKey="kinder:finance.tabs.debts" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          className="px-5 py-5 sm:px-6"
          value="overview"
        >
          <FinanceDashboard summary={summary} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="invoices"
        >
          <InvoicesList invoices={invoices} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="tuition"
        >
          <TuitionFeesPanel feeItems={feeItems} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="debts"
        >
          <DebtsList debts={debts} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
