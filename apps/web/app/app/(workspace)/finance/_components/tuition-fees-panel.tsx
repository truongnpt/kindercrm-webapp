'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { CreateTuitionFeeItemSchema } from '~/lib/kinder/finance/schemas/finance.schema';
import { createTuitionFeeItemAction } from '~/lib/kinder/finance/server-actions';
import type { TuitionFeeItem } from '~/lib/kinder/finance/types';

const BILLING_CYCLES = [
  'monthly',
  'quarterly',
  'semester',
  'yearly',
  'one_time',
] as const;

const FEE_CATEGORIES = [
  'tuition',
  'meals',
  'bus',
  'uniform',
  'extracurricular',
  'club',
  'insurance',
  'other',
] as const;

export function TuitionFeesPanel({
  schoolId,
  feeItems,
}: {
  schoolId: string;
  feeItems: TuitionFeeItem[];
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateTuitionFeeItemSchema),
    defaultValues: {
      schoolId,
      name: '',
      description: '',
      amount: 0,
      billingCycle: 'monthly' as const,
      category: 'tuition' as const,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <Trans i18nKey="kinder:finance.tuition.add" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="kinder:finance.tuition.add" />
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (data) => {
                  await createTuitionFeeItemAction(data);
                  form.reset();
                  setOpen(false);
                })}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.tuition.name" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.tuition.amount" />
                      </FormLabel>
                      <FormControl>
                        <Input min={0} step={1000} type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.tuition.category" />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FEE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              <Trans
                                i18nKey={`kinder:finance.tuition.categories.${category}`}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.tuition.billingCycle" />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BILLING_CYCLES.map((cycle) => (
                            <SelectItem key={cycle} value={cycle}>
                              <Trans
                                i18nKey={`kinder:finance.tuition.cycles.${cycle}`}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:finance.tuition.description" />
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" type="submit">
                  <Trans i18nKey="kinder:finance.tuition.add" />
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {feeItems.length === 0 ? (
        <PanelEmpty messageKey="kinder:finance.tuition.empty" />
      ) : (
        <DataTableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:finance.tuition.name" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <Trans i18nKey="kinder:finance.tuition.amount" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:finance.tuition.category" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:finance.tuition.billingCycle" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:finance.tuition.status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-right">
                    {formatVnd(item.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Trans
                      i18nKey={`kinder:finance.tuition.categories.${(item as { category?: string }).category ?? 'other'}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Trans
                      i18nKey={`kinder:finance.tuition.cycles.${item.billing_cycle}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Trans
                      i18nKey={
                        item.is_active
                          ? 'kinder:finance.tuition.active'
                          : 'kinder:finance.tuition.inactive'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      )}
    </div>
  );
}
