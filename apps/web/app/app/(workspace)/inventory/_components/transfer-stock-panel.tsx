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

import { TransferStockSchema } from '~/lib/kinder/inventory/schemas/inventory-phase3.schema';
import { transferStockAction } from '~/lib/kinder/inventory/stock-count-server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

export function TransferStockPanel({
  schoolId,
  products,
}: {
  schoolId: string;
  products: InventoryProductWithStock[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(TransferStockSchema),
    defaultValues: {
      schoolId,
      fromProductId: products[0]?.id ?? '',
      toProductId: products[1]?.id ?? products[0]?.id ?? '',
      quantity: 1,
      transactionDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  if (products.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:inventory.needTwoProducts" />
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        className="grid max-w-xl gap-3 rounded-lg border p-4"
        onSubmit={form.handleSubmit(async (data) => {
          const promise = transferStockAction(data);
          toast.promise(promise, {
            loading: t('schoolSettings.saving'),
            success: t('inventory.transferCompleted'),
            error: t('common:genericServerError', { ns: 'common' }),
          });
          await promise;
          form.reset({
            schoolId,
            fromProductId: products[0]?.id ?? '',
            toProductId: products[1]?.id ?? '',
            quantity: 1,
            transactionDate: new Date().toISOString().slice(0, 10),
            notes: '',
          });
        })}
      >
        <p className="font-medium">
          <Trans i18nKey="kinder:inventory.transferStock" />
        </p>
        <FormField
          control={form.control}
          name="fromProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:inventory.fromProduct" />
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
                      {product.name} ({product.quantity} {product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="toProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:inventory.toProduct" />
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
                <Trans i18nKey="kinder:inventory.countDate" />
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
          <Trans i18nKey="kinder:inventory.transferStock" />
        </Button>
      </form>
    </Form>
  );
}
