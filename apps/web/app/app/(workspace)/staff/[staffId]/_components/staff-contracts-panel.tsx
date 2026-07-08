'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import {
  renewStaffContractAction,
  terminateStaffContractAction,
} from '~/lib/kinder/staff/hr-server-actions';
import { CreateStaffContractSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import { createStaffContractAction } from '~/lib/kinder/staff/server-actions';
import type { StaffContract } from '~/lib/kinder/staff/types';

export function StaffContractsPanel({
  schoolId,
  employeeId,
  contracts,
  canManage,
}: {
  schoolId: string;
  employeeId: string;
  contracts: StaffContract[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

  const createContract = useKinderMutation({
    mutationFn: createStaffContractAction,
    invalidateKeys: [kinderQueryKeys.staff.detail(schoolId, employeeId)],
    onSuccess: () => {
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
      setOpen(false);
    },
  });

  const renewContract = useKinderMutation({
    mutationFn: renewStaffContractAction,
    onSuccess: () => router.refresh(),
  });

  const terminateContract = useKinderMutation({
    mutationFn: terminateStaffContractAction,
    onSuccess: () => router.refresh(),
  });

  return (
    <BentoTile>
      <div className="flex items-start justify-between gap-3">
        <BentoTileHeader
          description={<Trans i18nKey="kinder:staff.contracts.hint" />}
          title={<Trans i18nKey="kinder:staff.contracts.title" />}
        />
        {canManage ? (
          <Button className="shrink-0"
 onClick={() => setOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.contracts.add" />
          </Button>
        ) : null}
      </div>

      {contracts.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {contracts.map((contract) => (
            <li
              className="rounded-2xl bg-muted/25 px-4 py-3 text-sm"
              key={contract.id}
            >
              <div className="flex items-start gap-3">
                <FileText className="text-primary mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{contract.title}</p>
                  <p className="text-muted-foreground mt-1">
                    <Trans
                      i18nKey={`kinder:staff.contracts.types.${contract.contract_type}`}
                    />{' '}
                    · {contract.start_date}
                    {contract.end_date ? ` → ${contract.end_date}` : ''}
                  </p>
                  <p className="text-foreground mt-1 font-medium">
                    {formatVnd(contract.salary_amount)}
                  </p>
                  {canManage && contract.is_active ?
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        disabled={renewContract.isPending}
                        onClick={() => {
                          const nextStart = contract.end_date ?? new Date().toISOString().slice(0, 10);
                          const nextEnd = contract.end_date ?
                            new Date(
                              new Date(`${contract.end_date}T00:00:00`).getTime() +
                                365 * 24 * 60 * 60 * 1000,
                            )
                              .toISOString()
                              .slice(0, 10)
                          : '';

                          renewContract.mutate({
                            schoolId,
                            contractId: contract.id,
                            employeeId,
                            startDate: nextStart,
                            endDate: nextEnd,
                          });
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trans i18nKey="kinder:staff.contracts.renew" />
                      </Button>
                      <Button
                        disabled={terminateContract.isPending}
                        onClick={() =>
                          terminateContract.mutate({
                            schoolId,
                            contractId: contract.id,
                            employeeId,
                          })
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trans i18nKey="kinder:staff.contracts.terminate" />
                      </Button>
                    </div>
                  : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <PanelEmpty messageKey="kinder:staff.contracts.empty" />
        </div>
      )}

      {canManage ? (
        <KinderFormDialog
        onOpenChange={setOpen}
        open={open}
        size="md"
        title={<Trans i18nKey="kinder:staff.contracts.add" />}
        footer={
          <KinderSubmitButton
            loading={createContract.isPending}
            onClick={form.handleSubmit((data) => createContract.mutate(data))}
            type="button"
          >
            <Trans i18nKey="kinder:staff.contracts.add" />
          </KinderSubmitButton>
        }
      >
        <Form {...form}>
          <form className="space-y-4">
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

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.contracts.startDate" />
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
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.contracts.endDate" />
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
          </form>
        </Form>
      </KinderFormDialog>
      ) : null}
    </BentoTile>
  );
}
