'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Badge } from '@kit/ui/badge';
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
import { Trans } from '@kit/ui/trans';

import { PanelEmpty } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { CreateFeePlanSchema } from '~/lib/kinder/finance/schemas/finance.schema';
import { createFeePlanAction } from '~/lib/kinder/finance/server-actions';
import type { TuitionFeeItem, TuitionFeePlan } from '~/lib/kinder/finance/types';

type ClassOption = { id: string; name: string; code: string | null };
type StudentOption = {
  id: string;
  full_name: string;
  student_code: string;
};

export function FeePlansPanel({
  schoolId,
  plans,
  feeItems,
  classes,
  students,
}: {
  schoolId: string;
  plans: TuitionFeePlan[];
  feeItems: TuitionFeeItem[];
  classes: ClassOption[];
  students: StudentOption[];
}) {
  const [open, setOpen] = useState(false);
  const activeFeeItems = feeItems.filter((item) => item.is_active);

  const form = useForm({
    resolver: zodResolver(CreateFeePlanSchema),
    defaultValues: {
      schoolId,
      name: '',
      classId: '',
      studentId: '',
      academicYear: '',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: '',
      feeItemIds: [] as string[],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <Trans i18nKey="kinder:finance.feePlans.add" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="kinder:finance.feePlans.add" />
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (data) => {
                  await createFeePlanAction({
                    ...data,
                    classId: data.classId === 'none' ? '' : data.classId,
                    studentId: data.studentId === 'none' ? '' : data.studentId,
                  });
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
                        <Trans i18nKey="kinder:finance.feePlans.name" />
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
                              <Trans i18nKey="kinder:finance.feePlans.allClasses" />
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
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:finance.feePlans.student" />
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
                              <Trans i18nKey="kinder:finance.feePlans.allStudents" />
                            </SelectItem>
                            {students.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:finance.feePlans.effectiveFrom" />
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

                  <FormField
                    control={form.control}
                    name="effectiveTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:finance.feePlans.effectiveTo" />
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

                <Button className="w-full" type="submit">
                  <Trans i18nKey="kinder:finance.feePlans.add" />
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <PanelEmpty messageKey="kinder:finance.feePlans.empty" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              className="rounded-xl border border-border bg-card p-4"
              key={plan.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {plan.effective_from}
                    {plan.effective_to ? ` → ${plan.effective_to}` : ''}
                  </p>
                </div>
                <Badge variant={plan.is_active ? 'default' : 'outline'}>
                  <Trans
                    i18nKey={
                      plan.is_active ?
                        'kinder:finance.tuition.active'
                      : 'kinder:finance.tuition.inactive'
                    }
                  />
                </Badge>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {(plan.items ?? []).map((item) => (
                  <li key={item.id}>
                    {item.fee_item?.name ?? '—'} ·{' '}
                    {formatVnd(item.amount_override ?? item.fee_item?.amount ?? 0)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
