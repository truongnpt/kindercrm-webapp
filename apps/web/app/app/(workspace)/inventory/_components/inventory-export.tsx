'use client';

import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

const EXPORT_HEADERS = [
  'Name',
  'SKU',
  'Unit',
  'Quantity',
  'Min quantity',
  'Low stock',
  'Track expiry',
  'Notes',
];

export function InventoryExport({
  products,
}: {
  products: InventoryProductWithStock[];
}) {
  const { t } = useTranslation('kinder');

  const handleExport = () => {
    if (products.length === 0) {
      toast.error(t('inventory.exportEmpty'));
      return;
    }

    const csv = buildCsv(
      EXPORT_HEADERS,
      products.map((product) => [
        product.name,
        product.sku,
        product.unit,
        product.quantity,
        product.min_quantity,
        product.isLowStock ? 'yes' : 'no',
        product.track_expiry ? 'yes' : 'no',
        product.notes,
      ]),
    );

    downloadCsv(
      `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
    );
  };

  return (
    <Button onClick={handleExport} size="sm" type="button" variant="outline">
      <Download className="mr-2 size-4" />
      <Trans i18nKey="kinder:importExport.export" />
    </Button>
  );
}
