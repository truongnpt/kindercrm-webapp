'use client';

import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { Trans } from '@kit/ui/trans';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { createSubmitParentPaymentSchema } from '~/lib/kinder/finance/schemas/finance.schema';
import { submitParentPaymentAction } from '~/lib/kinder/finance/server-actions';
import { uploadPaymentProof } from '~/lib/kinder/finance/upload-payment-proof';

type InvoiceRow = {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
};

export function ParentSubmitPaymentDialog({
  schoolId,
  studentId,
  invoice,
  availableBalance,
}: {
  schoolId: string;
  studentId: string;
  invoice: InvoiceRow;
  availableBalance: number;
}) {
  const client = useSupabase();
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const schema = useMemo(
    () =>
      createSubmitParentPaymentSchema(availableBalance, {
        exceedsBalance: t('parent.finance.paymentExceedsBalance'),
      }),
    [availableBalance, t],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolId,
      studentId,
      invoiceId: invoice.id,
      amount: availableBalance,
      paymentMethod: 'bank_transfer' as const,
      proofUrl: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      schoolId,
      studentId,
      invoiceId: invoice.id,
      amount: availableBalance,
      paymentMethod: 'bank_transfer',
      proofUrl: '',
    });
  }, [open, availableBalance, form, invoice.id, schoolId, studentId]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full sm:w-auto" size="sm">
          <Trans i18nKey="kinder:parent.finance.markPaid" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:parent.finance.submitPayment" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(async (data) => {
              try {
                let proofUrl = data.proofUrl || '';

                const fileInput = document.getElementById(
                  `proof-${invoice.id}`,
                ) as HTMLInputElement | null;
                const file = fileInput?.files?.[0];

                if (file) {
                  const uploaded = await uploadPaymentProof(client, {
                    schoolId,
                    invoiceId: invoice.id,
                    file,
                  });
                  proofUrl = uploaded.proofUrl;
                }

                await submitParentPaymentAction({ ...data, proofUrl });
                toast.success(t('parent.finance.paymentSubmitted'));
                setOpen(false);
              } catch (error) {
                const message =
                  error instanceof Error ?
                    error.message
                  : t('parent.finance.paymentSubmitFailed');

                if (message.includes('outstanding balance')) {
                  toast.error(t('parent.finance.paymentExceedsBalance'));
                  return;
                }

                toast.error(message);
              }
            })}
          >
            <p className="text-muted-foreground text-sm">
              {invoice.invoice_number} · {formatVnd(availableBalance)}
            </p>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.payments.amount" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      min={1}
                      step={1}
                      type="number"
                      value={field.value}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      onChange={(event) => {
                        const nextValue = event.target.value;

                        field.onChange(
                          nextValue === '' ? '' : Number(nextValue),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:finance.payments.method" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        <Trans i18nKey="kinder:finance.payments.methods.bank_transfer" />
                      </SelectItem>
                      <SelectItem value="qr_banking">
                        <Trans i18nKey="kinder:finance.payments.methods.qr_banking" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:parent.finance.uploadProof" />
              </FormLabel>
              <FormControl>
                <Input
                  accept="image/*,.pdf"
                  id={`proof-${invoice.id}`}
                  type="file"
                />
              </FormControl>
            </FormItem>

            <Button className="w-full" type="submit">
              <Trans i18nKey="kinder:parent.finance.submitPayment" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
