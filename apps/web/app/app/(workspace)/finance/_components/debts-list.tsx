'use client';

import Link from 'next/link';

import { Wallet } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';

export function DebtsList({ debts }: { debts: InvoiceWithStudent[] }) {
  if (debts.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={Wallet}
        titleKey="kinder:finance.debts.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:finance.debts.listDescription" />}
          title={<Trans i18nKey="kinder:finance.debts.title" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:finance.invoices.student" />
                </th>
                <th>
                  <Trans i18nKey="kinder:finance.invoices.number" />
                </th>
                <th>
                  <Trans i18nKey="kinder:finance.invoices.dueDate" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:finance.debts.balance" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {debts.map((invoice) => {
                const balance = invoice.total_amount - invoice.paid_amount;

                return (
                  <tr key={invoice.id}>
                    <td>
                      <p className="font-medium">{invoice.student.full_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {invoice.student.class_name ?? '—'}
                      </p>
                    </td>
                    <td className="font-mono text-xs">{invoice.invoice_number}</td>
                    <td>{invoice.due_date}</td>
                    <td className="text-right font-semibold">
                      {formatVnd(balance)}
                    </td>
                    <td className="text-right">
                      <Button asChild className="rounded-lg" size="sm" variant="outline">
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
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {debts.map((invoice) => {
          const balance = invoice.total_amount - invoice.paid_amount;

          return (
            <article className="kinder-mobile-card" key={invoice.id}>
              <p className="font-medium">{invoice.student.full_name}</p>
              <p className="text-muted-foreground text-xs">
                {invoice.student.class_name ?? '—'}
              </p>
              <p className="text-muted-foreground mt-2 font-mono text-xs">
                {invoice.invoice_number}
              </p>
              <p className="mt-2 text-lg font-semibold">{formatVnd(balance)}</p>
              <Button asChild className="w-full" size="sm" variant="outline">
                <Link href={`${pathsConfig.app.financeInvoice}/${invoice.id}`}>
                  <Trans i18nKey="kinder:finance.recordPayment" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}
