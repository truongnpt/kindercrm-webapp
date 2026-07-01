'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
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

import { UpsertProductSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import { upsertProductAction } from '~/lib/kinder/inventory/server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

export function ProductsPanel({
  schoolId,
  products,
}: {
  schoolId: string;
  products: InventoryProductWithStock[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpsertProductSchema),
    defaultValues: {
      schoolId,
      name: '',
      sku: '',
      unit: 'cái',
      minQuantity: 0,
      trackExpiry: false,
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <PanelEmpty messageKey="kinder:inventory.emptyProducts" />
      ) : (
        <DataTableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">
                  <Trans i18nKey="kinder:inventory.productName" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Trans i18nKey="kinder:inventory.sku" />
                </th>
                <th className="px-4 py-3 text-right">
                  <Trans i18nKey="kinder:inventory.quantity" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Trans i18nKey="kinder:inventory.lowStock" />
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                    {product.sku ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={product.isLowStock ? 'destructive' : 'secondary'}
                    >
                      <Trans
                        i18nKey={
                          product.isLowStock
                            ? 'kinder:inventory.lowStock'
                            : 'kinder:inventory.inStock'
                        }
                      />
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertProductAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              name: '',
              sku: '',
              unit: 'cái',
              minQuantity: 0,
              trackExpiry: false,
              notes: '',
            });
          })}
        >
          <p className="font-medium sm:col-span-2">
            <Trans i18nKey="kinder:inventory.addProduct" />
          </p>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.productName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.sku" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.minQuantity" />
                </FormLabel>
                <FormControl>
                  <Input min={0} type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="sm:col-span-2" type="submit">
            <Trans i18nKey="kinder:inventory.addProduct" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
