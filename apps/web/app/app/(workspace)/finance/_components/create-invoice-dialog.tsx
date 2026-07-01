'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { CreateInvoiceSchema } from '~/lib/kinder/finance/schemas/finance.schema';
import { createInvoiceAction } from '~/lib/kinder/finance/server-actions';
import type { TuitionFeeItem } from '~/lib/kinder/finance/types';

function getDefaultBillingPeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getDefaultDueDate() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return lastDay.toISOString().slice(0, 10);
}

export function CreateInvoiceDialog({
  schoolId,
  students,
  feeItems,
}: {
  schoolId: string;
  students: Array<{
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  }>;
  feeItems: TuitionFeeItem[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      schoolId,
      studentId: '',
      title: `Học phí tháng ${getDefaultBillingPeriod()}`,
      billingPeriod: getDefaultBillingPeriod(),
      dueDate: getDefaultDueDate(),
      notes: '',
      feeItemIds: [] as string[],
    },
  });

  const toggleFeeItem = (feeId: string, checked: boolean) => {
    const next = checked
      ? [...selectedFeeIds, feeId]
      : selectedFeeIds.filter((id) => id !== feeId);

    setSelectedFeeIds(next);
    form.setValue('feeItemIds', next, { shouldValidate: true });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={students.length === 0 || feeItems.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          <Trans i18nKey="kinder:finance.invoices.create" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:finance.invoices.create" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (data) => {
              await createInvoiceAction(data);
            })}
          >
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.invoices.student" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            <Trans i18nKey="kinder:finance.invoices.selectStudent" />
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.student_code})
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.invoices.period" />
                    </FormLabel>
                    <FormControl>
                      <Input type="month" {...field} required />
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
                      <Input type="date" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:finance.tuition.title" />
              </FormLabel>
              <div className="kinder-mobile-card gap-2 p-3">
                {feeItems.map((item) => (
                  <label
                    className="flex cursor-pointer items-center justify-between gap-2"
                    key={item.id}
                  >
                    <span className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFeeIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          toggleFeeItem(item.id, checked === true)
                        }
                      />
                      <span>{item.name}</span>
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatVnd(item.amount)}
                    </span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>

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
              <Trans i18nKey="kinder:finance.invoices.create" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
