'use client';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { FinanceSummary } from '~/lib/kinder/finance/types';
import { Trans } from '@kit/ui/trans';

export function FinanceDashboard({ summary }: { summary: FinanceSummary }) {
  const cards = [
    {
      key: 'revenueThisMonth',
      value: formatVnd(summary.revenueThisMonth),
    },
    {
      key: 'outstandingDebt',
      value: formatVnd(summary.outstandingDebt),
    },
    {
      key: 'invoicesThisMonth',
      value: String(summary.invoicesThisMonth),
    },
    {
      key: 'paidInvoicesThisMonth',
      value: String(summary.paidInvoicesThisMonth),
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div className="kinder-mobile-card" key={card.key}>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey={`kinder:finance.summary.${card.key}`} />
          </p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
