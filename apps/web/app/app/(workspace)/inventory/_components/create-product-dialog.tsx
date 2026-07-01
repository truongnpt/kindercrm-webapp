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

export function CreateProductDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);

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

  const createProduct = useKinderMutation({
    mutationFn: upsertProductAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        name: '',
        sku: '',
        unit: 'cái',
        minQuantity: 0,
        trackExpiry: false,
        notes: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.addProductDescription" />}
      footer={
        <KinderSubmitButton
          loading={createProduct.isPending}
          onClick={form.handleSubmit((data) => createProduct.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.addProduct" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.addProduct" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.addProduct" />
        </Button>
      }
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
