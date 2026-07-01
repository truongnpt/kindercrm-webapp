import {
  CreditCard,
  FileText,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { FinanceSummary } from '~/lib/kinder/finance/types';

export function FinanceOverview({ summary }: { summary: FinanceSummary }) {
  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={TrendingUp}
        labelKey="kinder:finance.summary.revenueThisMonth"
        tone="success"
        value={formatVnd(summary.revenueThisMonth)}
      />
      <StatCard
        icon={Wallet}
        labelKey="kinder:finance.summary.outstandingDebt"
        tone="warning"
        value={formatVnd(summary.outstandingDebt)}
      />
      <StatCard
        icon={FileText}
        labelKey="kinder:finance.summary.invoicesThisMonth"
        tone="info"
        value={String(summary.invoicesThisMonth)}
      />
      <StatCard
        icon={CreditCard}
        labelKey="kinder:finance.summary.paidInvoicesThisMonth"
        tone="default"
        value={String(summary.paidInvoicesThisMonth)}
      />
    </BentoGrid>
  );
}
