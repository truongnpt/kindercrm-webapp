'use client';

import { Trans } from '@kit/ui/trans';

import { SectionCard } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { FinanceSummary } from '~/lib/kinder/finance/types';

export function FinanceDashboard({ summary }: { summary: FinanceSummary }) {
  const collectionRate =
    summary.invoicesThisMonth > 0
      ? Math.round(
          (summary.paidInvoicesThisMonth / summary.invoicesThisMonth) * 100,
        )
      : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title={<Trans i18nKey="kinder:finance.overview.collection" />}>
        <div className="flex items-end justify-between gap-4">
          <p className="text-foreground text-3xl font-bold tracking-tight">
            {collectionRate}%
          </p>
          <p className="text-muted-foreground text-sm">
            <Trans
              i18nKey="kinder:finance.overview.paidOfTotal"
              values={{
                paid: summary.paidInvoicesThisMonth,
                total: summary.invoicesThisMonth,
              }}
            />
          </p>
        </div>
        <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </SectionCard>

      <SectionCard title={<Trans i18nKey="kinder:finance.overview.snapshot" />}>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              <Trans i18nKey="kinder:finance.summary.revenueThisMonth" />
            </span>
            <span className="font-semibold">
              {formatVnd(summary.revenueThisMonth)}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              <Trans i18nKey="kinder:finance.summary.outstandingDebt" />
            </span>
            <span className="text-destructive font-semibold">
              {formatVnd(summary.outstandingDebt)}
            </span>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
