'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ClipboardCheck } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  completeStockCountAction,
  upsertStockCountItemAction,
} from '~/lib/kinder/inventory/stock-count-server-actions';
import type { StockCountWithItems } from '~/lib/kinder/inventory/types-phase3';

export function StockCountsPanel({
  schoolId,
  stockCounts,
  activeCount,
}: {
  schoolId: string;
  stockCounts: Array<{
    id: string;
    title: string;
    count_date: string;
    status: string;
  }>;
  activeCount: StockCountWithItems | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(activeCount?.id ?? '');

  const completeMutation = useKinderMutation({
    mutationFn: completeStockCountAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
  });

  if (stockCounts.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={ClipboardCheck}
        titleKey="kinder:inventory.emptyStockCounts"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:inventory.tabs.stockCounts" />}
          title={<Trans i18nKey="kinder:inventory.tabs.stockCounts" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:inventory.stockCountTitle" />
                </th>
                <th>
                  <Trans i18nKey="kinder:inventory.countDate" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {stockCounts.map((count) => (
                <tr
                  className="cursor-pointer"
                  key={count.id}
                  onClick={() => {
                    setSelectedId(count.id);
                    router.push(`?tab=stockCounts&countId=${count.id}`);
                  }}
                >
                  <td className="font-medium">{count.title}</td>
                  <td>{count.count_date}</td>
                  <td>
                    <StatusBadge
                      tone={count.status === 'draft' ? 'warning' : 'success'}
                    >
                      {count.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {stockCounts.map((count) => (
          <button
            className="kinder-mobile-card w-full text-left"
            key={count.id}
            onClick={() => {
              setSelectedId(count.id);
              router.push(`?tab=stockCounts&countId=${count.id}`);
            }}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{count.title}</p>
                <p className="text-muted-foreground text-xs">
                  {count.count_date}
                </p>
              </div>
              <StatusBadge
                tone={count.status === 'draft' ? 'warning' : 'success'}
              >
                {count.status}
              </StatusBadge>
            </div>
          </button>
        ))}
      </div>

      {activeCount && selectedId === activeCount.id ? (
        <div className="kinder-surface flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{activeCount.title}</p>
            {activeCount.status === 'draft' ? (
              <Button
                disabled={completeMutation.isPending}
                onClick={() =>
                  completeMutation.mutate({
                    schoolId,
                    stockCountId: activeCount.id,
                  })
                }
                size="sm"
                type="button"
              >
                <Trans i18nKey="kinder:inventory.completeStockCount" />
              </Button>
            ) : null}
          </div>
          <ul className="divide-y text-sm">
            {activeCount.items.map((item) => (
              <li className="flex items-center gap-3 py-2" key={item.id}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.product?.name ?? '—'}</p>
                  <p className="text-muted-foreground text-xs">
                    <Trans i18nKey="kinder:inventory.expected" />:{' '}
                    {item.expected_quantity} {item.product?.unit}
                  </p>
                </div>
                {activeCount.status === 'draft' ? (
                  <Input
                    className="w-24"
                    defaultValue={item.counted_quantity ?? ''}
                    min={0}
                    onBlur={async (event) => {
                      const value = event.target.value;

                      if (value === '') {
                        return;
                      }

                      await upsertStockCountItemAction({
                        schoolId,
                        stockCountId: activeCount.id,
                        productId: item.product_id,
                        countedQuantity: Number(value),
                      });
                    }}
                    step="0.01"
                    type="number"
                  />
                ) : (
                  <span>{item.counted_quantity ?? '—'}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
