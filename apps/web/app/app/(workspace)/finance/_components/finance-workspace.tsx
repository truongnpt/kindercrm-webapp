'use client';

import { BarChart3, ClipboardCheck, FileText, Layers, Receipt, Wallet } from 'lucide-react';
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
  FinanceReportSummary,
  FinanceSummary,
  InvoicePaymentWithStudent,
  InvoiceWithStudent,
  TuitionFeeItem,
  TuitionFeePlan,
} from '~/lib/kinder/finance/types';

import { DebtsList } from './debts-list';
import { FeePlansPanel } from './fee-plans-panel';
import { FinanceDashboard } from './finance-dashboard';
import { FinanceReportsPanel } from './finance-reports-panel';
import { InvoicesList } from './invoices-list';
import { PaymentVerificationPanel } from './payment-verification-panel';
import { TuitionFeesPanel } from './tuition-fees-panel';

export function FinanceWorkspace({
  defaultTab,
  summary,
  invoices,
  debts,
  feeItems,
  feePlans,
  pendingPayments,
  report,
  classes,
  students,
  schoolId,
}: {
  defaultTab: string;
  summary: FinanceSummary;
  invoices: InvoiceWithStudent[];
  debts: InvoiceWithStudent[];
  feeItems: TuitionFeeItem[];
  feePlans: TuitionFeePlan[];
  pendingPayments: InvoicePaymentWithStudent[];
  report: FinanceReportSummary;
  classes: Array<{ id: string; name: string; code: string | null }>;
  students: Array<{ id: string; full_name: string; student_code: string }>;
  schoolId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.finance}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:finance.workspaceHint" />}
          title={<Trans i18nKey="kinder:finance.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="overview">
            <BarChart3 className="mr-2 size-4" />
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
          <TabbedModuleTrigger value="plans">
            <Layers className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:finance.tabs.feePlans" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="verification">
            <ClipboardCheck className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:finance.tabs.verification" />
            {pendingPayments.length > 0 ? (
              <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                {pendingPayments.length}
              </span>
            ) : null}
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="reports">
            <BarChart3 className="mr-2 size-4 shrink-0" />
            <Trans i18nKey="kinder:finance.tabs.reports" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="overview">
          <FinanceDashboard summary={summary} />
        </TabbedModuleContent>

        <TabbedModuleContent value="invoices">
          <InvoicesList invoices={invoices} />
        </TabbedModuleContent>

        <TabbedModuleContent value="tuition">
          <TuitionFeesPanel feeItems={feeItems} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent value="debts">
          <DebtsList debts={debts} />
        </TabbedModuleContent>

        <TabbedModuleContent value="plans">
          <FeePlansPanel
            classes={classes}
            feeItems={feeItems}
            plans={feePlans}
            schoolId={schoolId}
            students={students}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="verification">
          <PaymentVerificationPanel
            payments={pendingPayments}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="reports">
          <FinanceReportsPanel report={report} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}
