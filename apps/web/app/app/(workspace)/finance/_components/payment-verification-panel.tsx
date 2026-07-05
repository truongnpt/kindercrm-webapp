'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { verifyPaymentAction } from '~/lib/kinder/finance/server-actions';
import type { InvoicePaymentWithStudent } from '~/lib/kinder/finance/types';

const VerifyFormSchema = z.object({
  schoolId: z.string().uuid(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  approved: z.boolean(),
  verificationNote: z.string().max(500).optional().or(z.literal('')),
});

export function PaymentVerificationPanel({
  schoolId,
  payments,
}: {
  schoolId: string;
  payments: InvoicePaymentWithStudent[];
}) {
  const [selected, setSelected] = useState<InvoicePaymentWithStudent | null>(
    null,
  );
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);

  const form = useForm({
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      schoolId,
      paymentId: '',
      invoiceId: '',
      approved: true,
      verificationNote: '',
    },
  });

  if (payments.length === 0) {
    return <PanelEmpty messageKey="kinder:finance.verification.empty" />;
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2">
        {payments.map((payment) => (
          <div
            className="rounded-xl border border-border bg-card p-4"
            key={payment.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {payment.invoice.student.full_name}
                </p>
                <p className="text-muted-foreground font-mono text-xs">
                  {payment.invoice.invoice_number}
                </p>
              </div>
              <Badge variant="secondary">
                <Trans i18nKey="kinder:finance.verification.waiting" />
              </Badge>
            </div>

            <p className="mt-3 text-lg font-semibold">
              {formatVnd(payment.amount)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              <Trans
                i18nKey={`kinder:finance.payments.methods.${payment.payment_method}`}
              />{' '}
              · {new Date(payment.paid_at).toLocaleString()}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {payment.proof_url ? (
                <Button asChild size="sm" variant="outline">
                  <a href={payment.proof_url} rel="noreferrer" target="_blank">
                    <Eye className="mr-2 size-4" />
                    <Trans i18nKey="kinder:finance.verification.viewProof" />
                  </a>
                </Button>
              ) : null}
              <Button
                onClick={() => {
                  setSelected(payment);
                  setMode('approve');
                  form.reset({
                    schoolId,
                    paymentId: payment.id,
                    invoiceId: payment.invoice_id,
                    approved: true,
                    verificationNote: '',
                  });
                }}
                size="sm"
              >
                <Check className="mr-2 size-4" />
                <Trans i18nKey="kinder:finance.verification.approve" />
              </Button>
              <Button
                onClick={() => {
                  setSelected(payment);
                  setMode('reject');
                  form.reset({
                    schoolId,
                    paymentId: payment.id,
                    invoiceId: payment.invoice_id,
                    approved: false,
                    verificationNote: '',
                  });
                }}
                size="sm"
                variant="outline"
              >
                <X className="mr-2 size-4" />
                <Trans i18nKey="kinder:finance.verification.reject" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setMode(null);
          }
        }}
        open={Boolean(selected && mode)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Trans
                i18nKey={
                  mode === 'approve' ?
                    'kinder:finance.verification.approveTitle'
                  : 'kinder:finance.verification.rejectTitle'
                }
              />
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (data) => {
                await verifyPaymentAction(data);
                setSelected(null);
                setMode(null);
              })}
            >
              <FormField
                control={form.control}
                name="verificationNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.verification.note" />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit">
                <Trans i18nKey="common:confirm" />
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
