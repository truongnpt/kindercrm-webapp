import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';

import type {
  FinanceSummary,
  InvoiceAdjustment,
  InvoiceLineItem,
  InvoicePayment,
  InvoiceWithStudent,
  PaymentRefund,
  TuitionFeeItem,
} from './types';

export const loadTuitionFeeItems = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('tuition_fee_items')
    .select('*')
    .eq('school_id', schoolId)
    .order('sort_order')
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as TuitionFeeItem[];
});

export const loadActiveTuitionFeeItems = cache(async (schoolId: string) => {
  const items = await loadTuitionFeeItems(schoolId);

  return items.filter((item) => item.is_active);
});

export const loadInvoices = cache(
  async (schoolId: string, status?: string, billingPeriod?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('invoices')
      .select(
        `
        *,
        student:students!inner (
          id,
          full_name,
          student_code,
          class_name
        )
      `,
      )
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq(
        'status',
        status as Database['public']['Enums']['invoice_status'],
      );
    }

    if (billingPeriod) {
      query = query.eq('billing_period', billingPeriod);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as InvoiceWithStudent[];
  },
);

export const loadDebts = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('invoices')
    .select(
      `
      *,
      student:students!inner (
        id,
        full_name,
        student_code,
        class_name
      )
    `,
    )
    .eq('school_id', schoolId)
    .in('status', ['issued', 'partial', 'overdue'])
    .order('due_date');

  if (error) {
    throw error;
  }

  return ((data ?? []) as InvoiceWithStudent[]).filter(
    (invoice) => invoice.total_amount > invoice.paid_amount,
  );
});

export const loadInvoiceById = cache(
  async (schoolId: string, invoiceId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoices')
      .select(
        `
        *,
        student:students!inner (
          id,
          full_name,
          student_code,
          class_name
        )
      `,
      )
      .eq('school_id', schoolId)
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as InvoiceWithStudent | null;
  },
);

export const loadInvoiceLineItems = cache(
  async (schoolId: string, invoiceId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoice_line_items')
      .select('*')
      .eq('school_id', schoolId)
      .eq('invoice_id', invoiceId)
      .order('sort_order');

    if (error) {
      throw error;
    }

    return (data ?? []) as InvoiceLineItem[];
  },
);

export const loadInvoiceAdjustments = cache(
  async (schoolId: string, invoiceId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoice_adjustments')
      .select('*')
      .eq('school_id', schoolId)
      .eq('invoice_id', invoiceId)
      .order('created_at');

    if (error) {
      throw error;
    }

    return (data ?? []) as InvoiceAdjustment[];
  },
);

export const loadInvoicePayments = cache(
  async (schoolId: string, invoiceId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoice_payments')
      .select('*')
      .eq('school_id', schoolId)
      .eq('invoice_id', invoiceId)
      .order('paid_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as InvoicePayment[];
  },
);

export const loadPaymentRefunds = cache(
  async (schoolId: string, paymentIds: string[]) => {
    if (paymentIds.length === 0) {
      return [] as PaymentRefund[];
    }

    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('payment_refunds')
      .select('*')
      .eq('school_id', schoolId)
      .in('payment_id', paymentIds)
      .order('refunded_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as PaymentRefund[];
  },
);

export const loadFinanceSummary = cache(
  async (schoolId: string): Promise<FinanceSummary> => {
    const client = getSupabaseServerClient();
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    ).toISOString();

    const [
      { data: monthPayments },
      { data: openInvoices },
      { count: invoicesThisMonth },
      { count: paidInvoicesThisMonth },
    ] = await Promise.all([
      client
        .from('invoice_payments')
        .select('amount')
        .eq('school_id', schoolId)
        .gte('paid_at', monthStart)
        .lte('paid_at', monthEnd),
      client
        .from('invoices')
        .select('total_amount, paid_amount')
        .eq('school_id', schoolId)
        .in('status', ['issued', 'partial', 'overdue']),
      client
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('billing_period', billingPeriod),
      client
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('billing_period', billingPeriod)
        .eq('status', 'paid'),
    ]);

    const revenueThisMonth = (monthPayments ?? []).reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const outstandingDebt = (openInvoices ?? []).reduce(
      (sum, invoice) =>
        sum + Math.max(0, invoice.total_amount - invoice.paid_amount),
      0,
    );

    return {
      revenueThisMonth,
      outstandingDebt,
      invoicesThisMonth: invoicesThisMonth ?? 0,
      paidInvoicesThisMonth: paidInvoicesThisMonth ?? 0,
    };
  },
);

export const loadActiveStudentsForFinance = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('students')
    .select('id, full_name, student_code, class_name')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  return data ?? [];
});
