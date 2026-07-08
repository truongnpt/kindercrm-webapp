'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateStockCountSchema } from '~/lib/kinder/inventory/schemas/inventory-phase3.schema';
import { createStockCountAction } from '~/lib/kinder/inventory/stock-count-server-actions';

export function CreateStockCountDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(CreateStockCountSchema),
    defaultValues: {
      schoolId,
      title: '',
      countDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const createStockCount = useKinderMutation({
    mutationFn: createStockCountAction,
    invalidateKeys: [kinderQueryKeys.inventory(schoolId)],
    onSuccess: (result) => {
      form.reset({
        schoolId,
        title: '',
        countDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setOpen(false);

      if (result.stockCountId) {
        router.push(`?tab=stockCounts&countId=${result.stockCountId}`);
      }
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:inventory.createStockCount" />}
      footer={
        <KinderSubmitButton
          loading={createStockCount.isPending}
          onClick={form.handleSubmit((data) => createStockCount.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:inventory.createStockCount" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:inventory.createStockCount" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:inventory.createStockCount" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.stockCountTitle" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:inventory.countDate" />
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}
