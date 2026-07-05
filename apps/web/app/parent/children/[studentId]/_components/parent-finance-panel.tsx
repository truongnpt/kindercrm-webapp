'use client';

import Image from 'next/image';

import { CreditCard } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { ParentEmptyState, ParentSectionHeader } from '~/components/parent-portal';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import {
  buildVietQrImageUrl,
  type VietQrConfig,
} from '~/lib/kinder/finance/vietqr';

import { ParentInvoiceDownloadButton } from './parent-invoice-download-button';
import { ParentSubmitPaymentDialog } from './parent-submit-payment-dialog';

type InvoiceRow = {
  id: string;
  invoice_number: string;
  billing_period: string;
  title?: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  transfer_content?: string | null;
  qr_code_url?: string | null;
  subtotal?: number;
  discount_amount?: number;
  notes?: string | null;
  issue_date?: string;
  created_at?: string;
};

type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  reference_note: string | null;
  receipt_number: string;
  status?: string;
};

type ContractRow = {
  id: string;
  contract_number: string;
  contract_type: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  invoice_id: string | null;
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
    paid_amount: number;
    due_date: string;
  } | null;
};

export function ParentFinancePanel({
  invoices,
  payments,
  contracts,
  studentName,
  studentCode,
  studentId,
  schoolId,
  schoolName,
  vietQrConfig,
  paymentInstructions,
}: {
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  contracts: ContractRow[];
  studentName: string;
  studentCode: string;
  studentId: string;
  schoolId: string;
  schoolName: string;
  vietQrConfig: VietQrConfig | null;
  paymentInstructions: {
    title: string;
    description: string | null;
    image_url: string | null;
    video_url: string | null;
    notes: string | null;
  } | null;
}) {
  const unpaidInvoices = invoices.filter(
    (invoice) =>
      invoice.total_amount > invoice.paid_amount &&
      invoice.status !== 'waiting_verification',
  );
  const unpaidBalance = unpaidInvoices.reduce(
    (sum, invoice) => sum + (invoice.total_amount - invoice.paid_amount),
    0,
  );
  const paymentsByInvoice = new Map<string, PaymentRow[]>();

  for (const payment of payments) {
    const list = paymentsByInvoice.get(payment.invoice_id) ?? [];
    list.push(payment);
    paymentsByInvoice.set(payment.invoice_id, list);
  }

  const contractByInvoiceId = new Map(
    contracts
      .filter((contract) => contract.invoice?.id)
      .map((contract) => [contract.invoice!.id, contract]),
  );

  if (invoices.length === 0) {
    return (
      <ParentEmptyState
        descriptionKey="kinder:parent.finance.empty"
        icon={CreditCard}
        titleKey="kinder:parent.tabs.finance"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.financeHint" />}
        title={<Trans i18nKey="kinder:parent.tabs.finance" />}
      />

      {unpaidBalance > 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground">
          <p className="text-sm opacity-90">
            <Trans i18nKey="kinder:parent.dashboard.outstandingTuition" />
          </p>
          <p className="mt-1 text-2xl font-bold">{formatVnd(unpaidBalance)}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-emerald-700">
          <Trans i18nKey="kinder:parent.dashboard.paidUp" />
        </div>
      )}

      {paymentInstructions?.description ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-medium text-foreground">
            {paymentInstructions.title}
          </p>
          <p className="text-muted-foreground mt-2 whitespace-pre-line text-sm">
            {paymentInstructions.description}
          </p>
        </div>
      ) : null}

      <p className="text-sm font-semibold text-foreground">
        <Trans i18nKey="kinder:parent.finance.invoices" />
      </p>

      <div className="flex flex-col gap-3">
        {invoices.map((invoice) => {
          const balance = invoice.total_amount - invoice.paid_amount;
          const invoicePayments = paymentsByInvoice.get(invoice.id) ?? [];
          const pendingAmount = invoicePayments
            .filter((payment) => payment.status === 'waiting_verification')
            .reduce((sum, payment) => sum + payment.amount, 0);
          const availableBalance = Math.max(0, balance - pendingAmount);
          const linkedContract = contractByInvoiceId.get(invoice.id);
          const qrUrl =
            invoice.qr_code_url ??
            (vietQrConfig && availableBalance > 0 ?
              buildVietQrImageUrl({
                config: vietQrConfig,
                amount: availableBalance,
                description:
                  invoice.transfer_content ?? invoice.invoice_number,
              })
            : null);

          return (
            <div
              className="rounded-xl border border-border bg-muted/40 p-4"
              key={invoice.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {invoice.invoice_number}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {invoice.billing_period}
                  </p>
                </div>
                <Badge className="rounded-full" variant="secondary">
                  <Trans
                    i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
                  />
                </Badge>
              </div>
              <p className="mt-2 text-base font-bold text-foreground">
                {formatVnd(invoice.total_amount)}
              </p>
              {availableBalance > 0 ? (
                <p className="mt-1 text-sm text-amber-700">
                  <Trans i18nKey="kinder:finance.debts.balance" />:{' '}
                  {formatVnd(availableBalance)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                <Trans i18nKey="kinder:parent.finance.dueDate" />:{' '}
                {invoice.due_date}
              </p>

              {invoice.transfer_content ? (
                <p className="mt-2 rounded-lg bg-background px-3 py-2 font-mono text-xs">
                  <Trans i18nKey="kinder:parent.finance.transferContent" />:{' '}
                  {invoice.transfer_content}
                </p>
              ) : null}

              {qrUrl && availableBalance > 0 ? (
                <div className="mt-4 flex flex-col items-center">
                  <Image
                    alt="VietQR"
                    className="rounded-xl border border-border"
                    height={200}
                    src={qrUrl}
                    unoptimized
                    width={200}
                  />
                  {vietQrConfig ? (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {vietQrConfig.accountName} · {vietQrConfig.accountNo}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {availableBalance > 0 &&
              invoice.status !== 'waiting_verification' &&
              invoice.status !== 'paid' ? (
                <ParentSubmitPaymentDialog
                  availableBalance={availableBalance}
                  invoice={invoice}
                  schoolId={schoolId}
                  studentId={studentId}
                />
              ) : null}

              <ParentInvoiceDownloadButton
                invoice={invoice}
                schoolName={schoolName}
                studentCode={studentCode}
                studentName={studentName}
              />

              {linkedContract ? (
                <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    <Trans i18nKey="kinder:parent.contracts.linkedInvoice" />
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {linkedContract.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {linkedContract.contract_number} ·{' '}
                    <Trans
                      i18nKey={`kinder:studentContracts.types.${linkedContract.contract_type}`}
                    />
                  </p>
                </div>
              ) : null}

              {invoicePayments.length > 0 ? (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <Trans i18nKey="kinder:parent.finance.payments" />
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {invoicePayments.map((payment) => (
                      <li
                        className="text-sm text-foreground"
                        key={payment.id}
                      >
                        {formatVnd(payment.amount)} ·{' '}
                        <Trans
                          i18nKey={`kinder:finance.payments.methods.${payment.payment_method}`}
                        />{' '}
                        · {new Date(payment.paid_at).toLocaleDateString()}
                        {payment.status === 'waiting_verification' ? (
                          <span className="text-amber-700">
                            {' '}
                            ·{' '}
                            <Trans i18nKey="kinder:finance.verification.waiting" />
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
