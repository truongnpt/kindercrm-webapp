'use client';

import Link from 'next/link';

import { Receipt } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableShell, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';

const STATUS_VARIANT: Record<
  InvoiceWithStudent['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'secondary',
  issued: 'outline',
  partial: 'default',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'secondary',
};

export function InvoicesList({ invoices }: { invoices: InvoiceWithStudent[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={Receipt}
        titleKey="kinder:finance.invoices.empty"
      />
    );
  }

  return (
    <DataTableShell>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="kinder:finance.invoices.number" />
            </th>
            <th>
              <Trans i18nKey="kinder:finance.invoices.student" />
            </th>
            <th>
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
              <td className="font-medium">
                {invoice.student?.full_name ?? '—'}
              </td>
              <td>{formatVnd(invoice.total_amount)}</td>
              <td>
                <Badge variant={STATUS_VARIANT[invoice.status]}>
                  <Trans
                    i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
                  />
                </Badge>
              </td>
              <td className="text-right">
                <Button asChild size="sm" variant="ghost">
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
    </DataTableShell>
  );
}
