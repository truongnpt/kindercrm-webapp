import type { Database } from '~/lib/database.types';

export type StudentContract =
  Database['public']['Tables']['student_contracts']['Row'];

export type StudentContractType =
  Database['public']['Enums']['student_contract_type'];

export type StudentContractStatus =
  Database['public']['Enums']['student_contract_status'];

export type StudentContractWithStudent = StudentContract & {
  student: {
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  };
};

export type StudentContractWithInvoice = StudentContractWithStudent & {
  invoice: {
    id: string;
    invoice_number: string;
    title: string;
    status: Database['public']['Enums']['invoice_status'];
    total_amount: number;
    paid_amount: number;
  } | null;
};

export type StudentContractsSummary = {
  total: number;
  active: number;
  draft: number;
  expiringSoon: number;
};
