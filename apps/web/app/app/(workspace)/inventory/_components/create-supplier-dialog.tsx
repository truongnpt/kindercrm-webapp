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
import { UpsertSupplierSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { upsertSupplierAction } from '~/lib/kinder/inventory/server-actions';

export function CreateSupplierDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpsertSupplierSchema),
    defaultValues: {
      schoolId,
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const createSupplier = useKinderMutation({
    mutationFn: upsertSupplierAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.addSupplierDescription" />}
      footer={
        <KinderSubmitButton
          loading={createSupplier.isPending}
          onClick={form.handleSubmit((data) => createSupplier.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.addSupplier" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.addSupplier" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.addSupplier" />
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
