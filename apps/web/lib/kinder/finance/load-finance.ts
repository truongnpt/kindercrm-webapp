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
    .in('status', ['issued', 'partial', 'overdue', 'waiting_verification'])
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

export const loadPendingVerificationPayments = cache(
  async (schoolId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('invoice_payments')
      .select(
        `
        *,
        invoice:invoices!inner (
          id,
          invoice_number,
          title,
          student:students!inner (
            id,
            full_name,
            student_code,
            class_name
          )
        )
      `,
      )
      .eq('school_id', schoolId)
      .eq('status', 'waiting_verification')
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []) as unknown as import('./types').InvoicePaymentWithStudent[];
  },
);

export const loadFeePlans = cache(async (schoolId: string) => {
  const { getFinanceExtensionClient } = await import('./finance-db');
  const client = getFinanceExtensionClient();

  const { data, error } = await client
    .from('tuition_fee_plans')
    .select(
      `
      *,
      items:tuition_fee_plan_items (
        id,
        tuition_fee_item_id,
        amount_override,
        fee_item:tuition_fee_items (id, name, amount, category)
      )
    `,
    )
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as import('./types').TuitionFeePlan[];
});

export const loadFinanceReportSummary = cache(
  async (schoolId: string): Promise<import('./types').FinanceReportSummary> => {
    const client = getSupabaseServerClient();

    const [{ data: invoices }, { data: payments }] = await Promise.all([
      client
        .from('invoices')
        .select(
          `
          id,
          status,
          total_amount,
          paid_amount,
          billing_period,
          student:students!inner (class_name)
        `,
        )
        .eq('school_id', schoolId)
        .neq('status', 'cancelled'),
      client
        .from('invoice_payments')
        .select('amount, paid_at, status')
        .eq('school_id', schoolId),
    ]);

    const invoiceRows = invoices ?? [];
    const paymentRows = (payments ?? []).filter(
      (payment) =>
        !('status' in payment) ||
        payment.status === 'verified' ||
        payment.status === undefined,
    );

    const totalRevenue = paymentRows.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const totalOutstanding = invoiceRows.reduce(
      (sum, invoice) =>
        sum + Math.max(0, invoice.total_amount - invoice.paid_amount),
      0,
    );

    const paidCount = invoiceRows.filter((invoice) => invoice.status === 'paid').length;
    const unpaidCount = invoiceRows.filter((invoice) =>
      ['issued', 'partial', 'waiting_verification'].includes(invoice.status),
    ).length;
    const overdueCount = invoiceRows.filter(
      (invoice) => invoice.status === 'overdue',
    ).length;

    const classMap = new Map<string, { outstanding: number; paid: number }>();

    for (const invoice of invoiceRows) {
      const className =
        (invoice.student as { class_name: string | null })?.class_name ?? '—';
      const entry = classMap.get(className) ?? { outstanding: 0, paid: 0 };
      entry.outstanding += Math.max(
        0,
        invoice.total_amount - invoice.paid_amount,
      );
      entry.paid += invoice.paid_amount;
      classMap.set(className, entry);
    }

    const monthMap = new Map<string, { revenue: number; invoices: number }>();

    for (const invoice of invoiceRows) {
      const entry = monthMap.get(invoice.billing_period) ?? {
        revenue: 0,
        invoices: 0,
      };
      entry.invoices += 1;
      entry.revenue += invoice.paid_amount;
      monthMap.set(invoice.billing_period, entry);
    }

    return {
      totalRevenue,
      totalOutstanding,
      paidCount,
      unpaidCount,
      overdueCount,
      byClass: [...classMap.entries()]
        .map(([name, values]) => ({ name, ...values }))
        .sort((a, b) => b.outstanding - a.outstanding),
      byMonth: [...monthMap.entries()]
        .map(([period, values]) => ({ period, ...values }))
        .sort((a, b) => b.period.localeCompare(a.period))
        .slice(0, 12),
    };
  },
);

export const loadActiveClassesForFinance = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classes')
    .select('id, name, code')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    throw error;
  }

  return data ?? [];
});
