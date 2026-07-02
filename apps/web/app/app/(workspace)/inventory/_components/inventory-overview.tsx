import { AlertTriangle, Boxes, Package } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { InventorySummary } from '~/lib/kinder/inventory/types';

export function InventoryOverview({
  summary,
}: {
  summary: InventorySummary;
}) {
  return (
    <BentoGrid className="mb-2" columns={3}>
      <StatCard
        icon={Package}
        labelKey="kinder:inventory.summary.products"
        tone="default"
        value={String(summary.totalProducts)}
      />
      <StatCard
        icon={AlertTriangle}
        labelKey="kinder:inventory.summary.lowStock"
        tone="warning"
        value={String(summary.lowStockCount)}
      />
      <StatCard
        icon={Boxes}
        labelKey="kinder:inventory.summary.totalUnits"
        tone="info"
        value={String(summary.totalStockValue)}
      />
    </BentoGrid>
  );
}
