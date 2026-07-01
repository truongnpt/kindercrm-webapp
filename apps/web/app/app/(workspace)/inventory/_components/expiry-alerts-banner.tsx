import { AlertTriangle } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import type { ExpiringBatch } from '~/lib/kinder/inventory/types-phase3';

export function ExpiryAlertsBanner({
  batches,
}: {
  batches: ExpiringBatch[];
}) {
  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border-0 bg-destructive/8 p-4">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="text-destructive h-4 w-4" />
        <p className="text-sm font-medium">
          <Trans i18nKey="kinder:inventory.expiryAlerts" />
        </p>
      </div>
      <ul className="space-y-1 text-sm">
        {batches.map((batch) => (
          <li className="text-muted-foreground" key={`${batch.productId}-${batch.expiryDate}`}>
            <span className="text-foreground font-medium">{batch.productName}</span>
            {' — '}
            {batch.quantity} {batch.unit},{' '}
            <Trans
              i18nKey="kinder:inventory.expiresIn"
              values={{ days: batch.daysUntilExpiry, date: batch.expiryDate }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
