import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';

import type {
  StudentContract,
  StudentContractsSummary,
  StudentContractWithInvoice,
  StudentContractWithStudent,
} from './types';

const CONTRACT_SELECT = `
  *,
  student:students!inner (
    id,
    full_name,
    student_code,
    class_name
  ),
  invoice:invoices (
    id,
    invoice_number,
    title,
    status,
    total_amount,
    paid_amount
  )
`;

export type StudentContractFilters = {
  type?: string;
  status?: string;
  studentId?: string;
  query?: string;
};

export const loadStudentContracts = cache(
  async (schoolId: string, filters: StudentContractFilters = {}) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('student_contracts')
      .select(CONTRACT_SELECT)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (filters.type && filters.type !== 'all') {
      query = query.eq(
        'contract_type',
        filters.type as Database['public']['Enums']['student_contract_type'],
      );
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq(
        'status',
        filters.status as Database['public']['Enums']['student_contract_status'],
      );
    }

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let contracts = (data ?? []) as StudentContractWithInvoice[];

    if (filters.query?.trim()) {
      const q = filters.query.trim().toLowerCase();

      contracts = contracts.filter(
        (contract) =>
          contract.contract_number.toLowerCase().includes(q) ||
          contract.title.toLowerCase().includes(q) ||
          contract.student.full_name.toLowerCase().includes(q) ||
          contract.student.student_code.toLowerCase().includes(q),
      );
    }

    return contracts;
  },
);

export const loadStudentContractsForStudent = cache(
  async (schoolId: string, studentId: string) => {
    return loadStudentContracts(schoolId, { studentId });
  },
);

export const loadStudentContractById = cache(
  async (schoolId: string, contractId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_contracts')
      .select(CONTRACT_SELECT)
      .eq('school_id', schoolId)
      .eq('id', contractId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as StudentContractWithInvoice | null) ?? null;
  },
);

export const loadStudentContractByInvoiceId = cache(
  async (schoolId: string, invoiceId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_contracts')
      .select(CONTRACT_SELECT)
      .eq('school_id', schoolId)
      .eq('invoice_id', invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as StudentContractWithInvoice | null) ?? null;
  },
);

export const loadStudentContractsSummary = cache(
  async (schoolId: string): Promise<StudentContractsSummary> => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_contracts')
      .select('status, end_date')
      .eq('school_id', schoolId);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    const today = new Date();
    const soon = new Date(today);
    soon.setDate(soon.getDate() + 30);

    const expiringSoon = rows.filter((row) => {
      if (row.status !== 'active' || !row.end_date) {
        return false;
      }

      const end = new Date(`${row.end_date}T00:00:00`);

      return end >= today && end <= soon;
    }).length;

    return {
      total: rows.length,
      active: rows.filter((row) => row.status === 'active').length,
      draft: rows.filter((row) => row.status === 'draft').length,
      expiringSoon,
    };
  },
);

export type { StudentContract, StudentContractWithStudent };
