'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import {
  formatInvoiceNumber,
  formatReceiptNumber,
} from './generate-finance-number';
import { recalculateInvoice } from './recalculate-invoice';
import {
  AddInvoiceAdjustmentSchema,
  CancelInvoiceSchema,
  CreateInvoiceSchema,
  CreateTuitionFeeItemSchema,
  RecordPaymentSchema,
  RecordRefundSchema,
  UpdateTuitionFeeItemSchema,
} from './schemas/finance.schema';

const FINANCE_PATH = pathsConfig.app.finance;

function revalidateFinancePaths(invoiceId?: string) {
  revalidatePath(FINANCE_PATH);

  if (invoiceId) {
    revalidatePath(`${pathsConfig.app.financeInvoice}/${invoiceId}`);
  }
}

async function getNextInvoiceSequence(schoolId: string) {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  if (error) {
    throw error;
  }

  return (count ?? 0) + 1;
}

async function getNextReceiptSequence(schoolId: string) {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('invoice_payments')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  if (error) {
    throw error;
  }

  return (count ?? 0) + 1;
}

/** FIN-001 Create tuition fee item */
export const createTuitionFeeItemAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('tuition_fee_items').insert({
      school_id: data.schoolId,
      name: data.name,
      description: data.description || null,
      amount: data.amount,
      billing_cycle: data.billingCycle,
    });

    if (error) {
      throw error;
    }

    revalidateFinancePaths();
    return { success: true };
  },
  { schema: CreateTuitionFeeItemSchema },
);

export const updateTuitionFeeItemAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('tuition_fee_items')
      .update({
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        billing_cycle: data.billingCycle,
        is_active: data.isActive,
      })
      .eq('id', data.feeItemId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateFinancePaths();
    return { success: true };
  },
  { schema: UpdateTuitionFeeItemSchema },
);

/** FIN-002 Create invoice */
export const createInvoiceAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: feeItems, error: feeError } = await client
      .from('tuition_fee_items')
      .select('*')
      .eq('school_id', data.schoolId)
      .in('id', data.feeItemIds)
      .eq('is_active', true);

    if (feeError) {
      throw feeError;
    }

    if (!feeItems || feeItems.length === 0) {
      throw new Error('No valid fee items selected');
    }

    const sequence = await getNextInvoiceSequence(data.schoolId);
    const invoiceNumber = formatInvoiceNumber(sequence);

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .insert({
        school_id: data.schoolId,
        student_id: data.studentId,
        invoice_number: invoiceNumber,
        title: data.title,
        billing_period: data.billingPeriod,
        due_date: data.dueDate,
        notes: data.notes || null,
        status: 'issued',
      })
      .select('id')
      .single();

    if (invoiceError || !invoice) {
      throw invoiceError ?? new Error('Failed to create invoice');
    }

    const lineItems = feeItems.map((item, index) => ({
      school_id: data.schoolId,
      invoice_id: invoice.id,
      tuition_fee_item_id: item.id,
      description: item.name,
      quantity: 1,
      unit_amount: item.amount,
      line_total: item.amount,
      sort_order: index,
    }));

    const { error: linesError } = await client
      .from('invoice_line_items')
      .insert(lineItems);

    if (linesError) {
      throw linesError;
    }

    await recalculateInvoice(client, invoice.id, data.schoolId);

    revalidateFinancePaths(invoice.id);
    redirect(`${pathsConfig.app.financeInvoice}/${invoice.id}`);
  },
  { schema: CreateInvoiceSchema },
);

/** FIN-005 / FIN-006 Add discount or scholarship */
export const addInvoiceAdjustmentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('id, status')
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .single();

    if (invoiceError || !invoice) {
      throw new KinderError(
        KINDER_ERROR_CODES.INVOICE_NOT_FOUND,
        'Invoice not found',
      );
    }

    if (invoice.status === 'cancelled' || invoice.status === 'paid') {
      throw new Error('Cannot adjust this invoice');
    }

    const { error } = await client.from('invoice_adjustments').insert({
      school_id: data.schoolId,
      invoice_id: data.invoiceId,
      adjustment_type: data.adjustmentType,
      label: data.label,
      amount: data.amount,
    });

    if (error) {
      throw error;
    }

    await recalculateInvoice(client, data.invoiceId, data.schoolId);

    revalidateFinancePaths(data.invoiceId);
    return { success: true };
  },
  { schema: AddInvoiceAdjustmentSchema },
);

/** FIN-003 Record payment */
export const recordPaymentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('id, status, total_amount, paid_amount')
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .single();

    if (invoiceError || !invoice) {
      throw new KinderError(
        KINDER_ERROR_CODES.INVOICE_NOT_FOUND,
        'Invoice not found',
      );
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Cannot pay a cancelled invoice');
    }

    const balance = invoice.total_amount - invoice.paid_amount;

    if (data.amount > balance) {
      throw new Error('Payment exceeds outstanding balance');
    }

    const sequence = await getNextReceiptSequence(data.schoolId);
    const receiptNumber = formatReceiptNumber(sequence);

    const { error } = await client.from('invoice_payments').insert({
      school_id: data.schoolId,
      invoice_id: data.invoiceId,
      amount: data.amount,
      payment_method: data.paymentMethod,
      paid_at: data.paidAt
        ? new Date(data.paidAt).toISOString()
        : new Date().toISOString(),
      receipt_number: receiptNumber,
      reference_note: data.referenceNote || null,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    await recalculateInvoice(client, data.invoiceId, data.schoolId);

    revalidateFinancePaths(data.invoiceId);
    return { success: true, receiptNumber };
  },
  { schema: RecordPaymentSchema },
);

/** FIN-007 Record refund */
export const recordRefundAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: payment, error: paymentError } = await client
      .from('invoice_payments')
      .select('id, amount, invoice_id')
      .eq('id', data.paymentId)
      .eq('school_id', data.schoolId)
      .eq('invoice_id', data.invoiceId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    const { data: existingRefunds } = await client
      .from('payment_refunds')
      .select('amount')
      .eq('payment_id', data.paymentId);

    const refundedSoFar = (existingRefunds ?? []).reduce(
      (sum, refund) => sum + refund.amount,
      0,
    );

    if (refundedSoFar + data.amount > payment.amount) {
      throw new Error('Refund exceeds payment amount');
    }

    const { error } = await client.from('payment_refunds').insert({
      school_id: data.schoolId,
      payment_id: data.paymentId,
      amount: data.amount,
      reason: data.reason || null,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    await recalculateInvoice(client, data.invoiceId, data.schoolId);

    revalidateFinancePaths(data.invoiceId);
    return { success: true };
  },
  { schema: RecordRefundSchema },
);

export const cancelInvoiceAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('id, paid_amount')
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .single();

    if (invoiceError || !invoice) {
      throw new KinderError(
        KINDER_ERROR_CODES.INVOICE_NOT_FOUND,
        'Invoice not found',
      );
    }

    if (invoice.paid_amount > 0) {
      throw new Error('Cannot cancel an invoice with payments');
    }

    const { error } = await client
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateFinancePaths(data.invoiceId);
    redirect(FINANCE_PATH);
  },
  { schema: CancelInvoiceSchema },
);
