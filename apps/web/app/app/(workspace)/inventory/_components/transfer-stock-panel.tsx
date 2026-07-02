'use client';

import { Trans } from '@kit/ui/trans';

import { DataTableCard } from '~/components/kinder-ui';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

import { TransferStockDialog } from './transfer-stock-dialog';

export function TransferStockPanel({
  schoolId,
  products,
}: {
  schoolId: string;
  products: InventoryProductWithStock[];
}) {
  return (
    <DataTableCard
      actions={
        <TransferStockDialog products={products} schoolId={schoolId} />
      }
      description={<Trans i18nKey="kinder:inventory.transferHint" />}
      title={<Trans i18nKey="kinder:inventory.transferStock" />}
    >
      <p className="text-muted-foreground px-4 py-6 text-sm">
        <Trans i18nKey="kinder:inventory.needTwoProducts" />
      </p>
    </DataTableCard>
  );
}
