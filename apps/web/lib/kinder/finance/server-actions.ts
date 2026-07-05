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
import { attachPaymentDetailsToInvoice } from '../payment-settings/invoice-payment-setup';
import { recalculateInvoice } from './recalculate-invoice';
import {
  AddInvoiceAdjustmentSchema,
  BatchCreateInvoicesSchema,
  CancelInvoiceSchema,
  CreateFeePlanSchema,
  CreateInvoiceSchema,
  CreateTuitionFeeItemSchema,
  RecordPaymentSchema,
  RecordRefundSchema,
  SubmitParentPaymentSchema,
  UpdateTuitionFeeItemSchema,
  VerifyPaymentSchema,
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
      category: data.category,
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
        category: data.category,
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

    const { data: updatedInvoice } = await client
      .from('invoices')
      .select('total_amount, invoice_number')
      .eq('id', invoice.id)
      .single();

    if (updatedInvoice) {
      await attachPaymentDetailsToInvoice(client, {
        schoolId: data.schoolId,
        invoiceId: invoice.id,
        invoiceNumber: updatedInvoice.invoice_number,
        totalAmount: updatedInvoice.total_amount,
      });
    }

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

    const isStaffImmediate =
      data.paymentMethod === 'cash' || data.paymentMethod === 'card';

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
      status: isStaffImmediate ? 'verified' : 'verified',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
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

/** TUITION-006 Verify parent-submitted payment */
export const verifyPaymentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: payment, error: paymentError } = await client
      .from('invoice_payments')
      .select('id, status, amount, receipt_number')
      .eq('id', data.paymentId)
      .eq('invoice_id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'waiting_verification') {
      throw new Error('Payment is not awaiting verification');
    }

    const { error } = await client
      .from('invoice_payments')
      .update({
        status: data.approved ? 'verified' : 'rejected',
        verification_note: data.verificationNote || null,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', data.paymentId);

    if (error) {
      throw error;
    }

    await recalculateInvoice(client, data.invoiceId, data.schoolId);

    const { data: invoice } = await client
      .from('invoices')
      .select('invoice_number, student_id, student:students(full_name)')
      .eq('id', data.invoiceId)
      .single();

    const studentName =
      (invoice?.student as { full_name: string } | null)?.full_name ?? '';

    if (data.approved) {
      const { notifyParentsOfPaymentVerified } = await import(
        '~/lib/kinder/notifications/finance-notifications'
      );

      await notifyParentsOfPaymentVerified({
        schoolId: data.schoolId,
        studentId: invoice?.student_id ?? '',
        studentName,
        invoiceId: data.invoiceId,
        invoiceNumber: invoice?.invoice_number ?? '',
        receiptNumber: payment.receipt_number,
        amount: payment.amount,
      });
    } else {
      const { notifyParentsOfPaymentRejected } = await import(
        '~/lib/kinder/notifications/finance-notifications'
      );

      await notifyParentsOfPaymentRejected({
        schoolId: data.schoolId,
        studentId: invoice?.student_id ?? '',
        studentName,
        invoiceId: data.invoiceId,
        invoiceNumber: invoice?.invoice_number ?? '',
        note: data.verificationNote,
      });
    }

    revalidateFinancePaths(data.invoiceId);
    revalidatePath(`${FINANCE_PATH}?tab=verification`);
    return { success: true };
  },
  { schema: VerifyPaymentSchema },
);

/** PAYMENT-007 Parent submits payment for verification */
export const submitParentPaymentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('id, status, total_amount, paid_amount, student_id')
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .eq('student_id', data.studentId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    if (
      invoice.status === 'cancelled' ||
      invoice.status === 'paid' ||
      invoice.status === 'waiting_verification'
    ) {
      throw new Error('Cannot submit payment for this invoice');
    }

    const { data: pendingPayments, error: pendingError } = await client
      .from('invoice_payments')
      .select('amount')
      .eq('invoice_id', data.invoiceId)
      .eq('status', 'waiting_verification');

    if (pendingError) {
      throw pendingError;
    }

    const pendingTotal = (pendingPayments ?? []).reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const availableBalance = Math.max(
      0,
      invoice.total_amount - invoice.paid_amount - pendingTotal,
    );

    if (data.amount > availableBalance) {
      throw new Error('Payment exceeds outstanding balance');
    }

    const sequence = await getNextReceiptSequence(data.schoolId);
    const receiptNumber = formatReceiptNumber(sequence);

    const { error } = await client.from('invoice_payments').insert({
      school_id: data.schoolId,
      invoice_id: data.invoiceId,
      amount: data.amount,
      payment_method: data.paymentMethod,
      receipt_number: receiptNumber,
      reference_note: null,
      status: 'waiting_verification',
      proof_url: data.proofUrl || null,
      submitted_by: user.id,
    });

    if (error) {
      throw error;
    }

    await recalculateInvoice(client, data.invoiceId, data.schoolId);

    const { data: invoiceRow } = await client
      .from('invoices')
      .select('invoice_number, student:students(full_name)')
      .eq('id', data.invoiceId)
      .single();

    const { notifyStaffOfPaymentSubmitted } = await import(
      '~/lib/kinder/notifications/finance-notifications'
    );

    await notifyStaffOfPaymentSubmitted({
      schoolId: data.schoolId,
      studentId: data.studentId,
      studentName:
        (invoiceRow?.student as { full_name: string } | null)?.full_name ?? '',
      invoiceId: data.invoiceId,
      invoiceNumber: invoiceRow?.invoice_number ?? '',
      amount: data.amount,
    });

    revalidateFinancePaths(data.invoiceId);
    revalidatePath(`${pathsConfig.parent.child}/${data.studentId}`);
    return { success: true, receiptNumber };
  },
  { schema: SubmitParentPaymentSchema },
);

/** TUITION-002 Create fee plan */
export const createFeePlanAction = enhanceAction(
  async (data) => {
    const extClient = (await import('./finance-db')).getFinanceExtensionClient();
    const client = getSupabaseServerClient();

    const { data: feeItems, error: feeError } = await client
      .from('tuition_fee_items')
      .select('id')
      .eq('school_id', data.schoolId)
      .in('id', data.feeItemIds)
      .eq('is_active', true);

    if (feeError) {
      throw feeError;
    }

    if (!feeItems || feeItems.length === 0) {
      throw new Error('No valid fee items selected');
    }

    const { data: plan, error: planError } = await extClient
      .from('tuition_fee_plans')
      .insert({
        school_id: data.schoolId,
        name: data.name,
        class_id: data.classId || null,
        student_id: data.studentId || null,
        academic_year: data.academicYear || null,
        effective_from: data.effectiveFrom,
        effective_to: data.effectiveTo || null,
      })
      .select('id')
      .single();

    if (planError || !plan) {
      throw planError ?? new Error('Failed to create fee plan');
    }

    const planItems = feeItems.map((item, index) => ({
      school_id: data.schoolId,
      plan_id: plan.id,
      tuition_fee_item_id: item.id,
      sort_order: index,
    }));

    const { error: itemsError } = await extClient
      .from('tuition_fee_plan_items')
      .insert(planItems);

    if (itemsError) {
      throw itemsError;
    }

    revalidateFinancePaths();
    return { success: true };
  },
  { schema: CreateFeePlanSchema },
);

/** TUITION-003 Batch create invoices */
export const batchCreateInvoicesAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    let studentsQuery = client
      .from('students')
      .select('id, class_name')
      .eq('school_id', data.schoolId)
      .eq('status', 'active')
      .is('deleted_at', null);

    if (data.classId) {
      const { data: classRow } = await client
        .from('classes')
        .select('name')
        .eq('id', data.classId)
        .eq('school_id', data.schoolId)
        .maybeSingle();

      if (classRow?.name) {
        studentsQuery = studentsQuery.eq('class_name', classRow.name);
      }
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      throw studentsError;
    }

    if (!students || students.length === 0) {
      throw new Error('No students found for batch invoicing');
    }

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

    let created = 0;

    for (const student of students) {
      const sequence = await getNextInvoiceSequence(data.schoolId);
      const invoiceNumber = formatInvoiceNumber(sequence);

      const { data: invoice, error: invoiceError } = await client
        .from('invoices')
        .insert({
          school_id: data.schoolId,
          student_id: student.id,
          invoice_number: invoiceNumber,
          title: data.title,
          billing_period: data.billingPeriod,
          due_date: data.dueDate,
          notes: data.notes || null,
          status: 'issued',
        })
        .select('id, invoice_number')
        .single();

      if (invoiceError || !invoice) {
        continue;
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

      await client.from('invoice_line_items').insert(lineItems);
      await recalculateInvoice(client, invoice.id, data.schoolId);

      const { data: updatedInvoice } = await client
        .from('invoices')
        .select('total_amount, invoice_number')
        .eq('id', invoice.id)
        .single();

      if (updatedInvoice) {
        await attachPaymentDetailsToInvoice(client, {
          schoolId: data.schoolId,
          invoiceId: invoice.id,
          invoiceNumber: updatedInvoice.invoice_number,
          totalAmount: updatedInvoice.total_amount,
        });
      }

      created += 1;
    }

    revalidateFinancePaths();
    return { success: true, created };
  },
  { schema: BatchCreateInvoicesSchema },
);
