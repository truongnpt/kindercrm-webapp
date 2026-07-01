'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

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

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreatePurchaseOrderSchema } from '~/lib/kinder/inventory/schemas/purchase-order.schema';
import { createPurchaseOrderAction } from '~/lib/kinder/inventory/purchase-order-server-actions';
import type {
  InventoryProductWithStock,
  InventorySupplier,
} from '~/lib/kinder/inventory/types';

export function CreatePurchaseOrderDialog({
  products,
  schoolId,
  suppliers,
}: {
  products: InventoryProductWithStock[];
  schoolId: string;
  suppliers: InventorySupplier[];
}) {
  const [open, setOpen] = useState(false);

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

  const createOrder = useKinderMutation({
    mutationFn: createPurchaseOrderAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        poNumber: `PO-${Date.now().toString().slice(-8)}`,
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDate: '',
        notes: '',
        items: [{ productId: products[0]?.id ?? '', quantity: 1, unitCost: 0 }],
      });
      setOpen(false);
    },
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.createPo" />}
      footer={
        <KinderSubmitButton
          loading={createOrder.isPending}
          onClick={form.handleSubmit((data) => createOrder.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.createPo" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="xl"
      title={<Trans i18nKey="kinder:inventory.createPo" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.createPo" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="grid gap-3 sm:grid-cols-3" key={field.id}>
              <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field: productField }) => (
                  <FormItem>
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}
