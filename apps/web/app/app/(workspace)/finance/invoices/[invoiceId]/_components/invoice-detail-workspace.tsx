'use client';

import { CreditCard, FileText, QrCode, Wallet } from 'lucide-react';
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
import type { VietQrConfig } from '~/lib/kinder/finance/vietqr';
import type {
  InvoiceAdjustment,
  InvoiceLineItem,
  InvoicePayment,
  InvoiceWithStudent,
  PaymentRefund,
} from '~/lib/kinder/finance/types';

import { InvoiceDetailPanel } from './invoice-detail-panel';
import { InvoiceVietQrPanel } from './invoice-vietqr-panel';

export function InvoiceDetailWorkspace({
  invoice,
  schoolId,
  lineItems,
  adjustments,
  payments,
  refunds,
  balance,
  showQr,
  vietQrConfig,
  defaultTab,
}: {
  invoice: InvoiceWithStudent;
  schoolId: string;
  lineItems: InvoiceLineItem[];
  adjustments: InvoiceAdjustment[];
  payments: InvoicePayment[];
  refunds: PaymentRefund[];
  balance: number;
  showQr: boolean;
  vietQrConfig: VietQrConfig | null;
  defaultTab: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(
      `${pathsConfig.app.finance}/invoices/${invoice.id}?${params.toString()}`,
    );
  };

  const panelProps = {
    adjustments,
    invoice,
    lineItems,
    payments,
    refunds,
    schoolId,
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:finance.invoices.detailHint" />}
          title={<Trans i18nKey="kinder:finance.invoices.detail" />}
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
            <FileText className="mr-2 size-4" />
            <Trans i18nKey="kinder:finance.tabs.overview" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="payments">
            <CreditCard className="mr-2 size-4" />
            <Trans i18nKey="kinder:finance.payments.title" />
          </TabbedModuleTrigger>
          {showQr ? (
            <TabbedModuleTrigger value="qr">
              <QrCode className="mr-2 size-4" />
              <Trans i18nKey="kinder:finance.qr.title" />
            </TabbedModuleTrigger>
          ) : null}
        </TabbedModuleList>

        <TabbedModuleContent value="overview">
          <InvoiceDetailPanel {...panelProps} view="overview" />
        </TabbedModuleContent>

        <TabbedModuleContent value="payments">
          <InvoiceDetailPanel {...panelProps} view="payments" />
        </TabbedModuleContent>

        {showQr && vietQrConfig ? (
          <TabbedModuleContent value="qr">
            <InvoiceVietQrPanel
              amount={balance}
              config={vietQrConfig}
              invoiceNumber={invoice.invoice_number}
              studentName={invoice.student?.full_name ?? ''}
            />
          </TabbedModuleContent>
        ) : null}
      </TabbedModule>
    </BentoTile>
  );
}
