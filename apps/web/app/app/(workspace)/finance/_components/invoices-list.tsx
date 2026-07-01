'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

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
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:finance.invoices.empty" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.number" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.student" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.period" />
            </th>
            <th className="px-4 py-3 text-right font-medium">
              <Trans i18nKey="kinder:finance.invoices.total" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.status" />
            </th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {invoice.invoice_number}
              </td>
              <td className="px-4 py-3">
                <p>{invoice.student.full_name}</p>
                <p className="text-muted-foreground text-xs">
                  {invoice.student.student_code}
                </p>
              </td>
              <td className="px-4 py-3">{invoice.billing_period}</td>
              <td className="px-4 py-3 text-right">
                {formatVnd(invoice.total_amount)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[invoice.status]}>
                  <Trans
                    i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
                  />
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
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
    </div>
  );
}
