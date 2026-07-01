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
import { UpsertSupplierSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { upsertSupplierAction } from '~/lib/kinder/inventory/server-actions';
import type { InventorySupplier } from '~/lib/kinder/inventory/types';

export function EditSupplierDialog({
  supplier,
  schoolId,
  open: controlledOpen,
  onOpenChange,
}: {
  supplier: InventorySupplier;
  schoolId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpsertSupplierSchema),
    defaultValues: {
      id: supplier.id,
      schoolId,
      name: supplier.name,
      contactName: supplier.contact_name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      id: supplier.id,
      schoolId,
      name: supplier.name,
      contactName: supplier.contact_name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    });
  }, [form, schoolId, supplier]);

  const updateSupplier = useKinderMutation({
    mutationFn: upsertSupplierAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.editSupplierDescription" />}
      footer={
        <KinderSubmitButton
          loading={updateSupplier.isPending}
          onClick={form.handleSubmit((data) => updateSupplier.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:ui.saveChanges" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.editSupplier" />}
    >
      <Form {...form}>
        <form className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.supplier" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:schoolSettings.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:schoolSettings.email" />
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}
