'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
  EmptyState,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { TransferStockSchema } from '~/lib/kinder/inventory/schemas/inventory-phase3.schema';
import { transferStockAction } from '~/lib/kinder/inventory/stock-count-server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

export function TransferStockDialog({
  products,
  schoolId,
}: {
  products: InventoryProductWithStock[];
  schoolId: string;
}) {
  const [open, setOpen] = useState(false);

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

  const transferStock = useKinderMutation({
    mutationFn: transferStockAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        fromProductId: products[0]?.id ?? '',
        toProductId: products[1]?.id ?? '',
        quantity: 1,
        transactionDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setOpen(false);
    },
  });

  if (products.length < 2) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:inventory.needTwoProducts"
        icon={ArrowRightLeft}
        titleKey="kinder:inventory.transferStock"
      />
    );
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.transferStock" />}
      footer={
        <KinderSubmitButton
          loading={transferStock.isPending}
          onClick={form.handleSubmit((data) => transferStock.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.transferStock" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.transferStock" />}
      trigger={
        <Button size="sm" type="button">
          <ArrowRightLeft className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.transferStock" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
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
