import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';

import { createPagination } from '@/lib/pagination';
import type { PaginatedResponse } from '~/lib/kinder/types/pagination';

import type {
  StudentContractFilters,
  StudentContractWithInvoice,
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

export const loadStudentContracts = cache(
  async (
    schoolId: string,
    {
      page = 1,
      limit = 10,
      status,
      type,
      studentId,
      search,
    }: StudentContractFilters = {},
  ): Promise<PaginatedResponse<StudentContractWithInvoice>> => {
    const client = getSupabaseServerClient();

    const { from, to } = createPagination(page, limit);

    let query = client
      .from('student_contracts')
      .select(CONTRACT_SELECT, {
        count: 'exact',
      })
      .eq('school_id', schoolId);

    if (type && type !== 'all') {
      query = query.eq(
        'contract_type',
        type as Database['public']['Enums']['student_contract_type'],
      );
    }

    if (status && status !== 'all') {
      query = query.eq(
        'status',
        status as Database['public']['Enums']['student_contract_status'],
      );
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const {
      data,
      count,
      error,
    } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    let contracts = (data ?? []) as StudentContractWithInvoice[];

    // Giữ nguyên logic search của code cũ
    if (search?.trim()) {
      const q = search.trim().toLowerCase();

      contracts = contracts.filter(
        (contract) =>
          contract.contract_number.toLowerCase().includes(q) ||
          contract.title.toLowerCase().includes(q) ||
          contract.student.full_name.toLowerCase().includes(q) ||
          contract.student.student_code.toLowerCase().includes(q),
      );
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: contracts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  },
);