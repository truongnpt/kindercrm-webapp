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

type InvoiceRow = {
  id: string;
  invoice_number: string;
  billing_period: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
};

type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  reference_note: string | null;
  receipt_number: string;
};

export function ParentFinancePanel({
  invoices,
  payments,
  studentName,
  vietQrConfig,
}: {
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  studentName: string;
  vietQrConfig: VietQrConfig | null;
}) {
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.total_amount > invoice.paid_amount,
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

      {vietQrConfig && unpaidInvoices.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-medium text-foreground">
            <Trans i18nKey="kinder:finance.qr.title" />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <Trans
              i18nKey="kinder:finance.qr.amount"
              values={{ amount: formatVnd(unpaidBalance) }}
            />
          </p>
          <div className="mt-4 flex justify-center">
            <Image
              alt="VietQR"
              className="rounded-xl border border-border"
              height={220}
              src={buildVietQrImageUrl({
                config: vietQrConfig,
                amount: unpaidBalance,
                description: unpaidInvoices[0]!.invoice_number,
              })}
              unoptimized
              width={220}
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {vietQrConfig.accountName} · {vietQrConfig.accountNo}
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

          return (
            <div
              className="rounded-xl border border-border bg-muted/40 p-4"
              key={invoice.id}
            >
              <div className="flex items-start justify-between gap-2">
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
              {balance > 0 ? (
                <p className="mt-1 text-sm text-amber-700">
                  <Trans i18nKey="kinder:finance.debts.balance" />:{' '}
                  {formatVnd(balance)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                <Trans i18nKey="kinder:parent.finance.dueDate" />:{' '}
                {invoice.due_date}
              </p>

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
