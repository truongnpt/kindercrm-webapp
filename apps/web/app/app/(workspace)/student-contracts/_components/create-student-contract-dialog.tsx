'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { TuitionFeeItem } from '~/lib/kinder/finance/types';
import {
  CreateStudentContractSchema,
  STUDENT_CONTRACT_TYPES,
} from '~/lib/kinder/student-contracts/schemas/student-contract.schema';
import { createStudentContractAction } from '~/lib/kinder/student-contracts/server-actions';

function getDefaultBillingPeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const TYPE_TITLE_KEYS: Record<string, string> = {
  enrollment: 'kinder:studentContracts.defaultTitles.enrollment',
  re_enrollment: 'kinder:studentContracts.defaultTitles.re_enrollment',
  service: 'kinder:studentContracts.defaultTitles.service',
  tuition_agreement: 'kinder:studentContracts.defaultTitles.tuition_agreement',
};

export function CreateStudentContractDialog({
  schoolId,
  students,
  feeItems,
  defaultStudentId,
  trigger,
}: {
  schoolId: string;
  students: Array<{
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  }>;
  feeItems: TuitionFeeItem[];
  defaultStudentId?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm({
    resolver: zodResolver(CreateStudentContractSchema),
    defaultValues: {
      schoolId,
      studentId: defaultStudentId ?? '',
      contractType: 'enrollment' as const,
      title: '',
      startDate: today,
      endDate: '',
      totalAmount: 0,
      billingPeriod: getDefaultBillingPeriod(),
      terms: '',
      signedAt: '',
      activate: true,
      createInvoice: false,
      feeItemIds: [] as string[],
    },
  });

  const contractType = form.watch('contractType');
  const createInvoice = form.watch('createInvoice');
  const showFinanceFields =
    contractType === 'tuition_agreement' ||
    contractType === 'enrollment' ||
    contractType === 're_enrollment';

  const createContract = useKinderMutation({
    mutationFn: createStudentContractAction,
    invalidateKeys: [
      kinderQueryKeys.students.contracts(schoolId),
      ...(defaultStudentId
        ? [kinderQueryKeys.students.detail(schoolId, defaultStudentId)]
        : []),
    ],
    onSuccess: (result) => {
      toast.success('Contract created');
      form.reset({
        schoolId,
        studentId: defaultStudentId ?? '',
        contractType: 'enrollment',
        title: '',
        startDate: today,
        endDate: '',
        totalAmount: 0,
        billingPeriod: getDefaultBillingPeriod(),
        terms: '',
        signedAt: '',
        activate: true,
        createInvoice: false,
        feeItemIds: [],
      });
      setSelectedFeeIds([]);
      setOpen(false);
      router.refresh();

      if (result.invoiceId) {
        toast.message('Invoice linked to contract');
      }
    },
  });

  return (
    <KinderFormDialog
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:studentContracts.create" />}
      trigger={
        trigger ?? (
          <Button disabled={students.length === 0} type="button">
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:studentContracts.create" />
          </Button>
        )
      }
      footer={
        <KinderSubmitButton
          loading={createContract.isPending}
          onClick={form.handleSubmit((data) => createContract.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:studentContracts.create" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="space-y-4">
          {!defaultStudentId ? (
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.student" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                </FormItem>
              )}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.type" />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('title', '');
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDENT_CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          <Trans
                            i18nKey={`kinder:studentContracts.types.${type}`}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.startDate" />
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:studentContracts.titleLabel" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={TYPE_TITLE_KEYS[contractType]}
                    {...field}
                    required
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.endDate" />
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
              name="signedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.signedAt" />
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

          {showFinanceFields ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:studentContracts.billingPeriod" />
                      </FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:studentContracts.amount" />
                      </FormLabel>
                      <FormControl>
                        <Input min={0} step={100000} type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="createInvoice"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="font-medium">
                        <Trans i18nKey="kinder:studentContracts.createInvoice" />
                      </FormLabel>
                      <p className="text-muted-foreground text-xs">
                        <Trans i18nKey="kinder:studentContracts.createInvoiceHint" />
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {createInvoice && feeItems.length > 0 ? (
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-sm font-medium">
                    <Trans i18nKey="kinder:studentContracts.feeItems" />
                  </p>
                  <div className="flex flex-col gap-2">
                    {feeItems.map((item) => (
                      <label
                        className="flex items-center justify-between gap-3 text-sm"
                        key={item.id}
                      >
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedFeeIds.includes(item.id)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...selectedFeeIds, item.id]
                                : selectedFeeIds.filter((id) => id !== item.id);
                              setSelectedFeeIds(next);
                              form.setValue('feeItemIds', next);
                              const total = feeItems
                                .filter((fee) => next.includes(fee.id))
                                .reduce((sum, fee) => sum + fee.amount, 0);
                              if (next.length > 0) {
                                form.setValue('totalAmount', total);
                              }
                            }}
                          />
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatVnd(item.amount)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:studentContracts.serviceAmount" />
                  </FormLabel>
                  <FormControl>
                    <Input min={0} step={100000} type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:studentContracts.terms" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activate"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>
                  <Trans i18nKey="kinder:studentContracts.activateNow" />
                </FormLabel>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}
