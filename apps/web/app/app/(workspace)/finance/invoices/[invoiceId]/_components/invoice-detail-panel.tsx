'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
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
import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import {
  AddInvoiceAdjustmentSchema,
  RecordPaymentSchema,
  RecordRefundSchema,
} from '~/lib/kinder/finance/schemas/finance.schema';
import {
  addInvoiceAdjustmentAction,
  cancelInvoiceAction,
  recordPaymentAction,
  recordRefundAction,
} from '~/lib/kinder/finance/server-actions';
import type {
  InvoiceAdjustment,
  InvoiceLineItem,
  InvoicePayment,
  InvoiceWithStudent,
  PaymentRefund,
} from '~/lib/kinder/finance/types';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'other'] as const;

export function InvoiceDetailPanel({
  invoice,
  schoolId,
  lineItems,
  adjustments,
  payments,
  refunds,
}: {
  invoice: InvoiceWithStudent;
  schoolId: string;
  lineItems: InvoiceLineItem[];
  adjustments: InvoiceAdjustment[];
  payments: InvoicePayment[];
  refunds: PaymentRefund[];
}) {
  const { t } = useTranslation('kinder');
  const balance = Math.max(0, invoice.total_amount - invoice.paid_amount);
  const canPay =
    invoice.status !== 'cancelled' &&
    invoice.status !== 'paid' &&
    balance > 0;
  const canCancel = invoice.paid_amount === 0 && invoice.status !== 'cancelled';

  const paymentForm = useForm({
    resolver: zodResolver(RecordPaymentSchema),
    defaultValues: {
      schoolId,
      invoiceId: invoice.id,
      amount: balance,
      paymentMethod: 'cash' as const,
      paidAt: new Date().toISOString().slice(0, 16),
      referenceNote: '',
    },
  });

  const adjustmentForm = useForm({
    resolver: zodResolver(AddInvoiceAdjustmentSchema),
    defaultValues: {
      schoolId,
      invoiceId: invoice.id,
      adjustmentType: 'discount' as const,
      label: '',
      amount: 0,
    },
  });

  const refundForm = useForm({
    resolver: zodResolver(RecordRefundSchema),
    defaultValues: {
      schoolId,
      invoiceId: invoice.id,
      paymentId: payments[0]?.id ?? '',
      amount: 0,
      reason: '',
    },
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="kinder-mobile-card">
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:finance.invoices.student" />
          </p>
          <p className="mt-1 font-medium">{invoice.student.full_name}</p>
          <p className="text-muted-foreground text-xs">
            {invoice.student.student_code}
          </p>
        </div>

        <div className="kinder-mobile-card">
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:finance.invoices.total" />
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatVnd(invoice.total_amount)}
          </p>
        </div>

        <div className="kinder-mobile-card">
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:finance.invoices.paid" />
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatVnd(invoice.paid_amount)}
          </p>
        </div>

        <div className="kinder-mobile-card">
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:finance.debts.balance" />
          </p>
          <p className="mt-1 text-xl font-semibold">{formatVnd(balance)}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">
          <Trans i18nKey="kinder:finance.invoices.lineItems" />
        </h2>
        <DataTableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:finance.tuition.name" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <Trans i18nKey="kinder:finance.invoices.quantity" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <Trans i18nKey="kinder:finance.tuition.amount" />
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <Trans i18nKey="kinder:finance.invoices.total" />
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">{line.description}</td>
                  <td className="px-4 py-3 text-right">{line.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {formatVnd(line.unit_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatVnd(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">
          <Trans i18nKey="kinder:finance.adjustments.title" />
        </h2>

        {adjustments.length > 0 ? (
          <div className="space-y-2">
            {adjustments.map((item) => (
              <div
                className="kinder-mobile-card flex-row items-center justify-between text-sm"
                key={item.id}
              >
                <span>
                  {item.label}{' '}
                  <Badge className="ml-2" variant="secondary">
                    <Trans
                      i18nKey={`kinder:finance.adjustments.types.${item.adjustment_type}`}
                    />
                  </Badge>
                </span>
                <span>-{formatVnd(item.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <PanelEmpty messageKey="kinder:finance.adjustments.empty" />
        )}

        {invoice.status !== 'cancelled' && invoice.status !== 'paid' ? (
          <Form {...adjustmentForm}>
            <form
              className="kinder-form-panel max-w-2xl"
              onSubmit={adjustmentForm.handleSubmit(async (data) => {
                const promise = addInvoiceAdjustmentAction(data);
                toast.promise(promise, {
                  loading: t('schoolSettings.saving'),
                  success: t('schoolSettings.saved'),
                  error: t('common:genericServerError', { ns: 'common' }),
                });
                await promise;
                adjustmentForm.reset({
                  schoolId,
                  invoiceId: invoice.id,
                  adjustmentType: 'discount',
                  label: '',
                  amount: 0,
                });
              })}
            >
              <FormField
                control={adjustmentForm.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.adjustments.type" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="discount">
                          <Trans i18nKey="kinder:finance.adjustments.types.discount" />
                        </SelectItem>
                        <SelectItem value="scholarship">
                          <Trans i18nKey="kinder:finance.adjustments.types.scholarship" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={adjustmentForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.adjustments.label" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={adjustmentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.adjustments.amount" />
                    </FormLabel>
                    <FormControl>
                      <Input min={0} step={1000} type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">
                <Trans i18nKey="kinder:finance.adjustments.add" />
              </Button>
            </form>
          </Form>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">
          <Trans i18nKey="kinder:finance.payments.title" />
        </h2>

        {payments.length === 0 ? (
          <PanelEmpty messageKey="kinder:finance.payments.empty" />
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => {
              const paymentRefunds = refunds.filter(
                (refund) => refund.payment_id === payment.id,
              );
              const refunded = paymentRefunds.reduce(
                (sum, refund) => sum + refund.amount,
                0,
              );

              return (
                <div className="kinder-mobile-card text-sm" key={payment.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {formatVnd(payment.amount)}{' '}
                        <span className="text-muted-foreground font-normal">
                          ·{' '}
                          <Trans
                            i18nKey={`kinder:finance.payments.methods.${payment.payment_method}`}
                          />
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        <Trans i18nKey="kinder:finance.payments.receipt" />:{' '}
                        {payment.receipt_number}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {new Date(payment.paid_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {paymentRefunds.length > 0 ? (
                    <div className="text-muted-foreground mt-2 text-xs">
                      <Trans i18nKey="kinder:finance.refunds.title" />:{' '}
                      {formatVnd(refunded)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {canPay ? (
          <Form {...paymentForm}>
            <form
              className="kinder-form-panel max-w-2xl"
              onSubmit={paymentForm.handleSubmit(async (data) => {
                const promise = recordPaymentAction(data);
                toast.promise(promise, {
                  loading: t('schoolSettings.saving'),
                  success: t('finance.payments.recorded'),
                  error: t('common:genericServerError', { ns: 'common' }),
                });
                await promise;
              })}
            >
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.payments.amount" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        max={balance}
                        min={1}
                        step={1000}
                        type="number"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
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
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            <Trans
                              i18nKey={`kinder:finance.payments.methods.${method}`}
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="referenceNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.payments.note" />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">
                <Trans i18nKey="kinder:finance.recordPayment" />
              </Button>
            </form>
          </Form>
        ) : null}
      </section>

      {payments.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-semibold">
            <Trans i18nKey="kinder:finance.refunds.title" />
          </h2>

          <Form {...refundForm}>
            <form
              className="kinder-form-panel max-w-2xl"
              onSubmit={refundForm.handleSubmit(async (data) => {
                const promise = recordRefundAction(data);
                toast.promise(promise, {
                  loading: t('schoolSettings.saving'),
                  success: t('finance.refunds.recorded'),
                  error: t('common:genericServerError', { ns: 'common' }),
                });
                await promise;
              })}
            >
              <FormField
                control={refundForm.control}
                name="paymentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.refunds.payment" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {payments.map((payment) => (
                          <SelectItem key={payment.id} value={payment.id}>
                            {payment.receipt_number} — {formatVnd(payment.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={refundForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.refunds.amount" />
                    </FormLabel>
                    <FormControl>
                      <Input min={1} step={1000} type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={refundForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:finance.refunds.reason" />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" variant="outline">
                <Trans i18nKey="kinder:finance.refunds.submit" />
              </Button>
            </form>
          </Form>
        </section>
      ) : null}

      {canCancel ? (
        <Button
          onClick={async () => {
            const promise = cancelInvoiceAction({
              schoolId,
              invoiceId: invoice.id,
            });
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          }}
          type="button"
          variant="destructive"
        >
          <Trans i18nKey="kinder:finance.invoices.cancel" />
        </Button>
      ) : null}
    </div>
  );
}
