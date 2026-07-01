'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { CreateStockCountSchema } from '~/lib/kinder/inventory/schemas/inventory-phase3.schema';
import {
  completeStockCountAction,
  createStockCountAction,
  upsertStockCountItemAction,
} from '~/lib/kinder/inventory/stock-count-server-actions';
import type { StockCountWithItems } from '~/lib/kinder/inventory/types-phase3';

export function StockCountsPanel({
  schoolId,
  stockCounts,
  activeCount,
}: {
  schoolId: string;
  stockCounts: Array<{ id: string; title: string; count_date: string; status: string }>;
  activeCount: StockCountWithItems | null;
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(activeCount?.id ?? '');

  const form = useForm({
    resolver: zodResolver(CreateStockCountSchema),
    defaultValues: {
      schoolId,
      title: '',
      countDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createStockCountAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('inventory.stockCountCreated'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            const result = await promise;
            if (result.stockCountId) {
              setSelectedId(result.stockCountId);
              router.push(
                `?tab=stockCounts&countId=${result.stockCountId}`,
              );
            }
            form.reset({
              schoolId,
              title: '',
              countDate: new Date().toISOString().slice(0, 10),
              notes: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:inventory.createStockCount" />
          </p>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.stockCountTitle" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.countDate" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Trans i18nKey="kinder:inventory.createStockCount" />
          </Button>
        </form>
      </Form>

      {stockCounts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:inventory.emptyStockCounts" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {stockCounts.map((count) => (
            <li className="p-4 text-sm" key={count.id}>
              <button
                className="w-full text-left"
                onClick={() => {
                  setSelectedId(count.id);
                  router.push(`?tab=stockCounts&countId=${count.id}`);
                }}
                type="button"
              >
                <p className="font-medium">{count.title}</p>
                <p className="text-muted-foreground text-xs">
                  {count.count_date} · {count.status}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeCount && selectedId === activeCount.id ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{activeCount.title}</p>
            {activeCount.status === 'draft' ? (
              <Button
                onClick={async () => {
                  const promise = completeStockCountAction({
                    schoolId,
                    stockCountId: activeCount.id,
                  });
                  toast.promise(promise, {
                    loading: t('schoolSettings.saving'),
                    success: t('inventory.stockCountCompleted'),
                    error: t('common:genericServerError', { ns: 'common' }),
                  });
                  await promise;
                }}
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
