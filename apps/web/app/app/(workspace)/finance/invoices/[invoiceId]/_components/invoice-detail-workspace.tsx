'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
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
}) {
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
        className="min-w-0 p-4 gap-0"
        defaultValue={showQr ? 'qr' : 'overview'}
      >
        <TabbedModuleList>
          <TabbedModuleTrigger value="overview">
            <Trans i18nKey="kinder:finance.tabs.overview" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="payments">
            <Trans i18nKey="kinder:finance.payments.title" />
          </TabbedModuleTrigger>
          {showQr ? (
            <TabbedModuleTrigger value="qr">
              <Trans i18nKey="kinder:finance.qr.title" />
            </TabbedModuleTrigger>
          ) : null}
        </TabbedModuleList>

        <TabbedModuleContent
          className="px-5 py-5 sm:px-6 sm:py-6"
          value="overview"
        >
          <InvoiceDetailPanel {...panelProps} view="overview" />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="payments"
        >
          <InvoiceDetailPanel {...panelProps} view="payments" />
        </TabbedModuleContent>

        {showQr && vietQrConfig ? (
          <TabbedModuleContent
            className="px-5 pb-5 sm:px-6 sm:pb-6"
            value="qr"
          >
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
