'use client';

import Link from 'next/link';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';

export function DebtsList({ debts }: { debts: InvoiceWithStudent[] }) {
  if (debts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:finance.debts.empty" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.student" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.number" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:finance.invoices.dueDate" />
            </th>
            <th className="px-4 py-3 text-right font-medium">
              <Trans i18nKey="kinder:finance.debts.balance" />
            </th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {debts.map((invoice) => {
            const balance = invoice.total_amount - invoice.paid_amount;

            return (
              <tr key={invoice.id}>
                <td className="px-4 py-3">
                  <p>{invoice.student.full_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {invoice.student.class_name ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {invoice.invoice_number}
                </td>
                <td className="px-4 py-3">{invoice.due_date}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatVnd(balance)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`${pathsConfig.app.financeInvoice}/${invoice.id}`}
                    >
                      <Trans i18nKey="kinder:finance.recordPayment" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
