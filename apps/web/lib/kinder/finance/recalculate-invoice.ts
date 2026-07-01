import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export async function recalculateInvoice(
  client: SupabaseClient<Database>,
  invoiceId: string,
  schoolId: string,
) {
  const { data: lines, error: linesError } = await client
    .from('invoice_line_items')
    .select('line_total')
    .eq('invoice_id', invoiceId);

  if (linesError) {
    throw linesError;
  }

  const subtotal = (lines ?? []).reduce((sum, line) => sum + line.line_total, 0);

  const { data: adjustments, error: adjustmentsError } = await client
    .from('invoice_adjustments')
    .select('amount')
    .eq('invoice_id', invoiceId);

  if (adjustmentsError) {
    throw adjustmentsError;
  }

  const discountAmount = (adjustments ?? []).reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const { data: payments, error: paymentsError } = await client
    .from('invoice_payments')
    .select('id, amount')
    .eq('invoice_id', invoiceId);

  if (paymentsError) {
    throw paymentsError;
  }

  let paidAmount = (payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);

  if (payments && payments.length > 0) {
    const paymentIds = payments.map((payment) => payment.id);

    const { data: refunds, error: refundsError } = await client
      .from('payment_refunds')
      .select('amount')
      .in('payment_id', paymentIds);

    if (refundsError) {
      throw refundsError;
    }

    const refundTotal = (refunds ?? []).reduce(
      (sum, refund) => sum + refund.amount,
      0,
    );

    paidAmount = Math.max(0, paidAmount - refundTotal);
  }

  const { data: invoice, error: invoiceError } = await client
    .from('invoices')
    .select('status, due_date')
    .eq('id', invoiceId)
    .eq('school_id', schoolId)
    .single();

  if (invoiceError || !invoice) {
    throw invoiceError ?? new Error('Invoice not found');
  }

  let status: InvoiceStatus = invoice.status;

  if (status !== 'cancelled' && status !== 'draft') {
    if (totalAmount > 0 && paidAmount >= totalAmount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
      status = 'overdue';
    } else {
      status = 'issued';
    }
  }

  const { error: updateError } = await client
    .from('invoices')
    .update({
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      status,
    })
    .eq('id', invoiceId)
    .eq('school_id', schoolId);

  if (updateError) {
    throw updateError;
  }
}
