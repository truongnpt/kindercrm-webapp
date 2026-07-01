'use client';

import { ArrowLeftRight } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState, StatusBadge } from '~/components/kinder-ui';

type TransactionRow = {
  id: string;
  transaction_type: string;
  quantity: number;
  transaction_date: string;
  product: { name: string; unit: string } | null;
};

export function TransactionsList({
  transactions,
}: {
  transactions: TransactionRow[];
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:inventory.emptyTransactionsDescription"
        icon={ArrowLeftRight}
        titleKey="kinder:inventory.emptyTransactions"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:inventory.transactionsListDescription" />
          }
          title={<Trans i18nKey="kinder:inventory.tabs.transactions" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:inventory.productName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:attendance.date" />
                </th>
                <th>
                  <Trans i18nKey="kinder:inventory.recordTransaction" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:inventory.quantity" />
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-medium">{tx.product?.name ?? '—'}</td>
                  <td>{tx.transaction_date}</td>
                  <td>
                    <StatusBadge tone="muted">
                      <Trans
                        i18nKey={`kinder:inventory.transactionTypes.${tx.transaction_type}`}
                      />
                    </StatusBadge>
                  </td>
                  <td className="text-right font-mono text-xs">
                    {tx.quantity} {tx.product?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {transactions.map((tx) => (
          <article className="kinder-mobile-card" key={tx.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{tx.product?.name ?? '—'}</p>
                <p className="text-muted-foreground text-xs">
                  {tx.transaction_date}
                </p>
              </div>
              <StatusBadge tone="muted">
                <Trans
                  i18nKey={`kinder:inventory.transactionTypes.${tx.transaction_type}`}
                />
              </StatusBadge>
            </div>
            <p className="mt-2 font-mono text-sm">
              {tx.quantity} {tx.product?.unit}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
