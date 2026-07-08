'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { BatchCreateInvoicesSchema } from '~/lib/kinder/finance/schemas/finance.schema';
import { batchCreateInvoicesAction } from '~/lib/kinder/finance/server-actions';
import type { TuitionFeeItem } from '~/lib/kinder/finance/types';

type ClassOption = { id: string; name: string; code: string | null };

export function BatchCreateInvoicesDialog({
  schoolId,
  feeItems,
  classes,
}: {
  schoolId: string;
  feeItems: TuitionFeeItem[];
  classes: ClassOption[];
}) {
  const [open, setOpen] = useState(false);
  const activeFeeItems = feeItems.filter((item) => item.is_active);

  const form = useForm({
    resolver: zodResolver(BatchCreateInvoicesSchema),
    defaultValues: {
      schoolId,
      title: '',
      billingPeriod: new Date().toISOString().slice(0, 7),
      dueDate: '',
      notes: '',
      classId: '',
      feeItemIds: [] as string[],
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          <Trans i18nKey="kinder:finance.invoices.batchCreate" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:finance.invoices.batchCreate" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (data) => {
              const payload = {
                ...data,
                classId: data.classId === 'none' ? '' : data.classId,
              };
              const result = await batchCreateInvoicesAction(payload);
              toast.success(
                `Created ${result.created} invoice(s)`,
              );
              setOpen(false);
              form.reset();
            })}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.invoices.title" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="billingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.invoices.period" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="2026-07" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.invoices.dueDate" />
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.feePlans.class" />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <Trans i18nKey="kinder:finance.invoices.allStudents" />
                      </SelectItem>
                      {classes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
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
              name="feeItemIds"
              render={() => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.feePlans.feeItems" />
                  </FormLabel>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {activeFeeItems.map((item) => (
                      <FormField
                        control={form.control}
                        key={item.id}
                        name="feeItemIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? [];

                                  field.onChange(
                                    checked ?
                                      [...current, item.id]
                                    : current.filter((id) => id !== item.id),
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="mb-0 font-normal">
                              {item.name} · {formatVnd(item.amount)}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.invoices.notes" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              <Trans i18nKey="kinder:finance.invoices.batchCreate" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
