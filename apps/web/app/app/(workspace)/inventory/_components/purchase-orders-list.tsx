'use client';

import { ClipboardList } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  cancelPurchaseOrderAction,
  receivePurchaseOrderAction,
} from '~/lib/kinder/inventory/purchase-order-server-actions';

type PurchaseOrderRow = {
  id: string;
  po_number: string;
  status: string;
  order_date: string;
  total_amount: number;
  supplier: { name: string } | null;
};

const STATUS_TONE: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'muted'> =
  {
    draft: 'muted',
    submitted: 'warning',
    received: 'success',
    cancelled: 'danger',
  };

export function PurchaseOrdersList({
  orders,
  schoolId,
}: {
  orders: PurchaseOrderRow[];
  schoolId: string;
}) {
  const receiveMutation = useKinderMutation({
    mutationFn: receivePurchaseOrderAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
  });

  const cancelMutation = useKinderMutation({
    mutationFn: cancelPurchaseOrderAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={ClipboardList}
        titleKey="kinder:inventory.emptyPurchaseOrders"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:inventory.tabs.purchaseOrders" />}
          title={<Trans i18nKey="kinder:inventory.tabs.purchaseOrders" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:inventory.poNumber" />
                </th>
                <th>
                  <Trans i18nKey="kinder:inventory.supplier" />
                </th>
                <th>
                  <Trans i18nKey="kinder:attendance.date" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.status" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-xs">{order.po_number}</td>
                  <td>{order.supplier?.name ?? '—'}</td>
                  <td>{order.order_date}</td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[order.status] ?? 'muted'}>
                      {order.status}
                    </StatusBadge>
                  </td>
                  <td className="text-right">
                    {order.status === 'submitted' ? (
                      <div className="flex justify-end gap-2">
                        <Button
 disabled={receiveMutation.isPending}
 onClick={() =>
                            receiveMutation.mutate({
                              schoolId,
                              purchaseOrderId: order.id,
                            })
                          }
                          size="sm"
                          type="button"
                        >
                          <Trans i18nKey="kinder:inventory.receivePo" />
                        </Button>
                        <Button
 disabled={cancelMutation.isPending}
 onClick={() =>
                            cancelMutation.mutate({
                              schoolId,
                              purchaseOrderId: order.id,
                            })
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trans i18nKey="kinder:ui.cancel" />
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article className="kinder-mobile-card" key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs">{order.po_number}</p>
                <p className="mt-1 font-medium">
                  {order.supplier?.name ?? '—'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {order.order_date}
                </p>
              </div>
              <StatusBadge tone={STATUS_TONE[order.status] ?? 'muted'}>
                {order.status}
              </StatusBadge>
            </div>
            {order.status === 'submitted' ? (
              <div className="mt-3 flex gap-2">
                <Button className="flex-1"
 disabled={receiveMutation.isPending}
 onClick={() =>
                    receiveMutation.mutate({
                      schoolId,
                      purchaseOrderId: order.id,
                    })
                  }
                  size="sm"
                  type="button"
                >
                  <Trans i18nKey="kinder:inventory.receivePo" />
                </Button>
                <Button
 disabled={cancelMutation.isPending}
 onClick={() =>
                    cancelMutation.mutate({
                      schoolId,
                      purchaseOrderId: order.id,
                    })
                  }
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trans i18nKey="kinder:ui.cancel" />
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
