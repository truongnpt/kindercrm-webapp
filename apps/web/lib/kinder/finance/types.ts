import type { Database } from '~/lib/database.types';

export type TuitionFeeItem =
  Database['public']['Tables']['tuition_fee_items']['Row'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];

export type InvoiceLineItem =
  Database['public']['Tables']['invoice_line_items']['Row'];

export type InvoiceAdjustment =
  Database['public']['Tables']['invoice_adjustments']['Row'];

export type InvoicePayment =
  Database['public']['Tables']['invoice_payments']['Row'];

export type PaymentRefund =
  Database['public']['Tables']['payment_refunds']['Row'];

export type InvoiceWithStudent = Invoice & {
  student: {
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  };
};

export type FinanceSummary = {
  revenueThisMonth: number;
  outstandingDebt: number;
  invoicesThisMonth: number;
  paidInvoicesThisMonth: number;
};
