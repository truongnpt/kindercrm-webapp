'use client';

import { Download, FileText } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { EmptyState, SectionCard } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { SaasBillingInvoice } from '~/lib/kinder/subscription/issue-saas-invoice';

function formatPeriod(start: string | null, end: string | null) {
  const format = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  return `${format(start)} – ${format(end)}`;
}

export function SubscriptionInvoicesPanel({
  invoices,
}: {
  invoices: SaasBillingInvoice[];
}) {
  if (invoices.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          compact
          descriptionKey="kinder:subscription.saasInvoices.emptyDescription"
          icon={FileText}
          titleKey="kinder:subscription.saasInvoices.empty"
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard className="min-w-0 overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-foreground text-base font-semibold">
          <Trans i18nKey="kinder:subscription.saasInvoices.title" />
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          <Trans i18nKey="kinder:subscription.saasInvoices.hint" />
        </p>
      </div>

      <ul className="divide-y divide-border">
        {invoices.map((invoice) => (
          <li
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            key={invoice.id}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground font-medium">
                  {invoice.invoice_number}
                </span>
                <Badge className="rounded-full" variant="outline">
                  <Trans
                    i18nKey={`kinder:subscription.saasInvoices.statuses.${invoice.status}`}
                  />
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {invoice.package_name} · {formatPeriod(
                  invoice.billing_period_start,
                  invoice.billing_period_end,
                )}
              </p>
              <p className="text-foreground text-sm font-medium">
                {formatVnd(invoice.total_amount)}
                <span className="text-muted-foreground font-normal">
                  {' '}
                  (<Trans
                    i18nKey="kinder:subscription.saasInvoices.vatIncluded"
                    values={{ rate: Number(invoice.vat_rate) }}
                  />)
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                <Trans
                  i18nKey="kinder:subscription.saasInvoices.issuedAt"
                  values={{
                    date: new Date(invoice.issued_at).toLocaleString(),
                  }}
                />
              </p>
            </div>

            <Button asChild className="shrink-0" size="sm" variant="outline">
              <a
                href={`/api/billing/saas-invoices/${invoice.id}/pdf`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Download className="mr-2 size-4" />
                <Trans i18nKey="kinder:subscription.saasInvoices.downloadPdf" />
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
