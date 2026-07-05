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

export type TuitionFeeCategory =
  | 'tuition'
  | 'meals'
  | 'bus'
  | 'uniform'
  | 'extracurricular'
  | 'club'
  | 'insurance'
  | 'other';

export type TuitionFeePlan = {
  id: string;
  school_id: string;
  name: string;
  class_id: string | null;
  student_id: string | null;
  academic_year: string | null;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
  items?: Array<{
    id: string;
    tuition_fee_item_id: string;
    amount_override: number | null;
    fee_item?: TuitionFeeItem | null;
  }>;
};

export type InvoicePaymentWithStudent = InvoicePayment & {
  invoice: {
    id: string;
    invoice_number: string;
    title: string;
    student: {
      id: string;
      full_name: string;
      student_code: string;
      class_name: string | null;
    };
  };
};

export type FinanceReportSummary = {
  totalRevenue: number;
  totalOutstanding: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  byClass: Array<{ name: string; outstanding: number; paid: number }>;
  byMonth: Array<{ period: string; revenue: number; invoices: number }>;
};
