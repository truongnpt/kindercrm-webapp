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
import { CreateStaffContractSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import { createStaffContractAction } from '~/lib/kinder/staff/server-actions';
import type { StaffContract } from '~/lib/kinder/staff/types';

export function StaffContractsPanel({
  schoolId,
  employeeId,
  contracts,
}: {
  schoolId: string;
  employeeId: string;
  contracts: StaffContract[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(CreateStaffContractSchema),
    defaultValues: {
      schoolId,
      employeeId,
      contractType: 'full_time' as const,
      title: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      salaryAmount: 0,
      notes: '',
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">
        <Trans i18nKey="kinder:staff.contracts.title" />
      </h2>

      {contracts.length > 0 ? (
        <div className="space-y-2">
          {contracts.map((contract) => (
            <div className="rounded-lg border p-4 text-sm" key={contract.id}>
              <p className="font-medium">{contract.title}</p>
              <p className="text-muted-foreground">
                <Trans
                  i18nKey={`kinder:staff.contracts.types.${contract.contract_type}`}
                />{' '}
                · {contract.start_date}
                {contract.end_date ? ` → ${contract.end_date}` : ''}
              </p>
              <p>{formatVnd(contract.salary_amount)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:staff.contracts.empty" />
        </p>
      )}

      <Form {...form}>
        <form
          className="grid max-w-2xl gap-4 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createStaffContractAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              employeeId,
              contractType: 'full_time',
              title: '',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: '',
              salaryAmount: 0,
              notes: '',
            });
          })}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:staff.contracts.titleLabel" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.contracts.type" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_time">
                        <Trans i18nKey="kinder:staff.contracts.types.full_time" />
                      </SelectItem>
                      <SelectItem value="part_time">
                        <Trans i18nKey="kinder:staff.contracts.types.part_time" />
                      </SelectItem>
                      <SelectItem value="contract">
                        <Trans i18nKey="kinder:staff.contracts.types.contract" />
                      </SelectItem>
                      <SelectItem value="probation">
                        <Trans i18nKey="kinder:staff.contracts.types.probation" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salaryAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.contracts.salary" />
                  </FormLabel>
                  <FormControl>
                    <Input min={0} step={100000} type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.contracts.startDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.contracts.endDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <Trans i18nKey="kinder:staff.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">
            <Trans i18nKey="kinder:staff.contracts.add" />
          </Button>
        </form>
      </Form>
    </section>
  );
}
