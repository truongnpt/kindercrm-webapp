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
import { Trans } from '@kit/ui/trans';

import { UpsertSupplierSchema } from '~/lib/kinder/inventory/schemas/inventory.schema';
import { upsertSupplierAction } from '~/lib/kinder/inventory/server-actions';
import type { InventorySupplier } from '~/lib/kinder/inventory/types';

export function SuppliersPanel({
  schoolId,
  suppliers,
}: {
  schoolId: string;
  suppliers: InventorySupplier[];
}) {
  const { t } = useTranslation('kinder');

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

  return (
    <div className="space-y-6">
      {suppliers.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:inventory.emptySuppliers" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {suppliers.map((supplier) => (
            <li className="p-4 text-sm" key={supplier.id}>
              <p className="font-medium">{supplier.name}</p>
              {supplier.phone ? (
                <p className="text-muted-foreground text-xs">{supplier.phone}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertSupplierAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              name: '',
              contactName: '',
              phone: '',
              email: '',
              address: '',
              notes: '',
            });
          })}
        >
          <p className="font-medium sm:col-span-2">
            <Trans i18nKey="kinder:inventory.addSupplier" />
          </p>
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
          <Button className="sm:col-span-2" type="submit">
            <Trans i18nKey="kinder:inventory.addSupplier" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
