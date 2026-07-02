import { CreditCard, FileText, Wallet } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';

export function InvoiceOverview({
  invoice,
  balance,
}: {
  invoice: InvoiceWithStudent;
  balance: number;
}) {
  return (
    <BentoGrid className="mb-2" columns={3}>
      <StatCard
        icon={FileText}
        labelKey="kinder:finance.invoices.total"
        tone="default"
        value={formatVnd(invoice.total_amount)}
      />
      <StatCard
        icon={CreditCard}
        labelKey="kinder:finance.invoices.paid"
        tone="success"
        value={formatVnd(invoice.paid_amount)}
      />
      <StatCard
        icon={Wallet}
        labelKey="kinder:finance.invoices.balance"
        tone={balance > 0 ? 'warning' : 'success'}
        value={formatVnd(balance)}
      />
    </BentoGrid>
  );
}
