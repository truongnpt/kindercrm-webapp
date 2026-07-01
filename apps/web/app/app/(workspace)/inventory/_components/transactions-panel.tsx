'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { RecordInventoryTransactionSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import { recordInventoryTransactionAction } from '~/lib/kinder/inventory/server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

const TRANSACTION_TYPES = ['receipt', 'issue', 'adjustment'] as const;

export function TransactionsPanel({
  schoolId,
  products,
  transactions,
}: {
  schoolId: string;
  products: InventoryProductWithStock[];
  transactions: Array<{
    id: string;
    transaction_type: string;
    quantity: number;
    transaction_date: string;
    product: { name: string; unit: string } | null;
  }>;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(RecordInventoryTransactionSchema),
    defaultValues: {
      schoolId,
      productId: products[0]?.id ?? '',
      transactionType: 'receipt' as const,
      quantity: 1,
      transactionDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      {transactions.length === 0 ? (
        <PanelEmpty messageKey="kinder:inventory.emptyTransactions" />
      ) : (
        <ul className="kinder-list-panel">
          {transactions.map((tx) => (
            <li className="flex items-center justify-between p-4 text-sm" key={tx.id}>
              <div>
                <p className="font-medium">{tx.product?.name ?? '—'}</p>
                <p className="text-muted-foreground text-xs">{tx.transaction_date}</p>
              </div>
              <div className="text-right">
                <p>
                  <Trans
                    i18nKey={`kinder:inventory.transactionTypes.${tx.transaction_type}`}
                  />
                </p>
                <p className="font-mono text-xs">
                  {tx.quantity} {tx.product?.unit}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 ? (
        <Form {...form}>
          <form
            className="kinder-form-panel max-w-xl grid-cols-1"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = recordInventoryTransactionAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('common:genericServerError', { ns: 'common' }),
              });
              await promise;
            })}
          >
            <p className="font-medium">
              <Trans i18nKey="kinder:inventory.recordTransaction" />
            </p>
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:inventory.productName" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:inventory.recordTransaction" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          <Trans
                            i18nKey={`kinder:inventory.transactionTypes.${type}`}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:inventory.quantity" />
                  </FormLabel>
                  <FormControl>
                    <Input min={0.01} step="0.01" type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:attendance.date" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:crm.notes" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">
              <Trans i18nKey="kinder:inventory.recordTransaction" />
            </Button>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
