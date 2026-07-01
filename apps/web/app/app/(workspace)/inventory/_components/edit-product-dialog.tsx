'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpsertProductSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { upsertProductAction } from '~/lib/kinder/inventory/server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

export function EditProductDialog({
  product,
  schoolId,
  open: controlledOpen,
  onOpenChange,
}: {
  product: InventoryProductWithStock;
  schoolId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpsertProductSchema),
    defaultValues: {
      id: product.id,
      schoolId,
      name: product.name,
      sku: product.sku ?? '',
      unit: product.unit,
      minQuantity: product.min_quantity,
      trackExpiry: product.track_expiry,
      notes: product.notes ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      id: product.id,
      schoolId,
      name: product.name,
      sku: product.sku ?? '',
      unit: product.unit,
      minQuantity: product.min_quantity,
      trackExpiry: product.track_expiry,
      notes: product.notes ?? '',
    });
  }, [form, product, schoolId]);

  const updateProduct = useKinderMutation({
    mutationFn: upsertProductAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.editProductDescription" />}
      footer={
        <KinderSubmitButton
          loading={updateProduct.isPending}
          onClick={form.handleSubmit((data) => updateProduct.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:ui.saveChanges" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.editProduct" />}
    >
      <Form {...form}>
        <form className="grid gap-4 sm:grid-cols-2">
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}
