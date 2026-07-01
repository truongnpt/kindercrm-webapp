'use client';

import Link from 'next/link';

import { Receipt } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState, StatusBadge } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';

const STATUS_TONE: Record<
  InvoiceWithStudent['status'],
  'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'
> = {
  draft: 'muted',
  issued: 'info',
  partial: 'warning',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'muted',
};

export function InvoicesList({ invoices }: { invoices: InvoiceWithStudent[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={Receipt}
        titleKey="kinder:finance.invoices.empty"
      />
    );
  }

  return (
    <DataTableCard
      description={<Trans i18nKey="kinder:finance.invoices.listDescription" />}
      title={<Trans i18nKey="kinder:finance.invoices.recent" />}
    >
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="kinder:finance.invoices.number" />
            </th>
            <th>
              <Trans i18nKey="kinder:finance.invoices.student" />
            </th>
            <th className="hidden md:table-cell">
              <Trans i18nKey="kinder:finance.invoices.total" />
            </th>
            <th>
              <Trans i18nKey="kinder:finance.invoices.status" />
            </th>
            <th className="text-right" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="font-mono text-xs">{invoice.invoice_number}</td>
              <td>
                <p className="font-medium">
                  {invoice.student?.full_name ?? '—'}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs md:hidden">
                  {formatVnd(invoice.total_amount)}
                </p>
              </td>
              <td className="hidden md:table-cell">
                {formatVnd(invoice.total_amount)}
              </td>
              <td>
                <StatusBadge tone={STATUS_TONE[invoice.status]}>
                  <Trans
                    i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
                  />
                </StatusBadge>
              </td>
              <td className="text-right">
                <Button asChild className="rounded-lg" size="sm" variant="outline">
                  <Link
                    href={`${pathsConfig.app.financeInvoice}/${invoice.id}`}
                  >
                    <Trans i18nKey="kinder:finance.invoices.detail" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableCard>
  );
}
