'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreatePurchaseOrderSchema } from '~/lib/kinder/inventory/schemas/purchase-order.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import {
  cancelPurchaseOrderAction,
  createPurchaseOrderAction,
  receivePurchaseOrderAction,
} from '~/lib/kinder/inventory/purchase-order-server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';
import type { InventorySupplier } from '~/lib/kinder/inventory/types';

type PurchaseOrderRow = {
  id: string;
  po_number: string;
  status: string;
  order_date: string;
  total_amount: number;
  supplier: { name: string } | null;
};

export function PurchaseOrdersPanel({
  schoolId,
  orders,
  products,
  suppliers,
}: {
  schoolId: string;
  orders: PurchaseOrderRow[];
  products: InventoryProductWithStock[];
  suppliers: InventorySupplier[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(CreatePurchaseOrderSchema),
    defaultValues: {
      schoolId,
      poNumber: `PO-${Date.now().toString().slice(-8)}`,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: '',
      notes: '',
      items: [{ productId: products[0]?.id ?? '', quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <PanelEmpty messageKey="kinder:inventory.emptyPurchaseOrders" />
      ) : (
        <ul className="kinder-list-panel">
          {orders.map((order) => (
            <li
              className="flex items-center justify-between gap-3 p-4 text-sm"
              key={order.id}
            >
              <div>
                <p className="font-mono font-medium">{order.po_number}</p>
                <p className="text-muted-foreground text-xs">
                  {order.order_date}
                  {order.supplier?.name ? ` · ${order.supplier.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{order.status}</Badge>
                {order.status === 'submitted' ? (
                  <>
                    <Button
                      onClick={async () => {
                        const promise = receivePurchaseOrderAction({
                          schoolId,
                          purchaseOrderId: order.id,
                        });
                        toast.promise(promise, {
                          loading: t('schoolSettings.saving'),
                          success: t('inventory.poReceived'),
                          error: t('common:genericServerError', { ns: 'common' }),
                        });
                        await promise;
                      }}
                      size="sm"
                      type="button"
                    >
                      <Trans i18nKey="kinder:inventory.receivePo" />
                    </Button>
                    <Button
                      onClick={async () => {
                        const promise = cancelPurchaseOrderAction({
                          schoolId,
                          purchaseOrderId: order.id,
                        });
                        await promise;
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trans i18nKey="common:cancel" />
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 ? (
        <Form {...form}>
          <form
            className="kinder-form-panel max-w-2xl gap-3"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = createPurchaseOrderAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('inventory.poCreated'),
                error: t('common:genericServerError', { ns: 'common' }),
              });
              await promise;
            })}
          >
            <p className="font-medium">
              <Trans i18nKey="kinder:inventory.createPo" />
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:inventory.poNumber" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:inventory.supplier" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {fields.map((field, index) => (
              <div className="grid gap-2 sm:grid-cols-3" key={field.id}>
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({ field: productField }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>
                        <Trans i18nKey="kinder:inventory.productName" />
                      </FormLabel>
                      <Select
                        onValueChange={productField.onChange}
                        value={productField.value}
                      >
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
                  name={`items.${index}.quantity`}
                  render={({ field: qtyField }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:inventory.quantity" />
                      </FormLabel>
                      <FormControl>
                        <Input min={0.01} step="0.01" type="number" {...qtyField} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.unitCost`}
                  render={({ field: costField }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:inventory.unitCost" />
                      </FormLabel>
                      <FormControl>
                        <Input min={0} step="1000" type="number" {...costField} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              onClick={() =>
                append({
                  productId: products[0]?.id ?? '',
                  quantity: 1,
                  unitCost: 0,
                })
              }
              type="button"
              variant="outline"
            >
              <Trans i18nKey="kinder:inventory.addPoLine" />
            </Button>

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
              <Trans i18nKey="kinder:inventory.createPo" />
            </Button>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
