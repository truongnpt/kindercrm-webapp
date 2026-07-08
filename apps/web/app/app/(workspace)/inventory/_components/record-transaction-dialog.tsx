'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { DatePicker } from '@kit/ui/date-picker';
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
import { RecordInventoryTransactionSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { recordInventoryTransactionAction } from '~/lib/kinder/inventory/server-actions';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

const TRANSACTION_TYPES = ['receipt', 'issue', 'adjustment'] as const;

export function RecordTransactionDialog({
  products,
  schoolId,
}: {
  products: InventoryProductWithStock[];
  schoolId: string;
}) {
  const [open, setOpen] = useState(false);

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

  const recordTransaction = useKinderMutation({
    mutationFn: recordInventoryTransactionAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        productId: products[0]?.id ?? '',
        transactionType: 'receipt',
        quantity: 1,
        transactionDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setOpen(false);
    },
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={
        <Trans i18nKey="kinder:inventory.recordTransactionDescription" />
      }
      footer={
        <KinderSubmitButton
          loading={recordTransaction.isPending}
          onClick={form.handleSubmit((data) => recordTransaction.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.recordTransaction" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.recordTransaction" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.recordTransaction" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
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
                    <Trans i18nKey="kinder:attendance.date" />
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      className="w-full"
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
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
