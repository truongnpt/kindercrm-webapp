'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';

import pathsConfig from '~/config/paths.config';
import type { Database } from '~/lib/database.types';
import { formatInvoiceNumber } from '~/lib/kinder/finance/generate-finance-number';
import { recalculateInvoice } from '~/lib/kinder/finance/recalculate-invoice';
import {
  STUDENTS_PERMISSIONS,
  type KinderPermission,
} from '~/lib/kinder/permissions';
import { assertPermissionFromContext } from '~/lib/kinder/permissions/assert-permission.server';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

import { formatStudentContractNumber } from './generate-contract-number';
import {
  CreateStudentContractSchema,
  LinkStudentContractInvoiceSchema,
  UpdateStudentContractSchema,
  UpdateStudentContractStatusSchema,
} from './schemas/student-contract.schema';

const CONTRACTS_PATH = pathsConfig.app.studentContracts;
const FINANCE_PATH = pathsConfig.app.finance;
const STUDENTS_PATH = pathsConfig.app.students;

function revalidateContractPaths(options?: {
  studentId?: string;
  invoiceId?: string;
}) {
  revalidatePath(CONTRACTS_PATH);
  revalidatePath(STUDENTS_PATH);
  revalidatePath(FINANCE_PATH);

  if (options?.studentId) {
    revalidatePath(`${pathsConfig.app.studentDetail}/${options.studentId}`);
  }

  if (options?.invoiceId) {
    revalidatePath(`${pathsConfig.app.financeInvoice}/${options.invoiceId}`);
  }
}

async function assertContractPermission(
  userId: string,
  permission: KinderPermission,
) {
  const context = await requireSchoolContext(userId);
  await assertPermissionFromContext(context, permission);
  return context;
}

async function getNextContractSequence(schoolId: string) {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('student_contracts')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  if (error) {
    throw error;
  }

  return (count ?? 0) + 1;
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

async function deactivateSameTypeContracts(
  schoolId: string,
  studentId: string,
  contractType: string,
  excludeId?: string,
) {
  if (contractType !== 'enrollment' && contractType !== 're_enrollment') {
    return;
  }

  const client = getSupabaseServerClient();

  let query = client
    .from('student_contracts')
    .update({ status: 'terminated' })
    .eq('school_id', schoolId)
    .eq('student_id', studentId)
    .eq('contract_type', contractType)
    .eq('status', 'active');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

async function createInvoiceForContract(
  data: {
    schoolId: string;
    studentId: string;
    title: string;
    billingPeriod: string;
    dueDate: string;
    totalAmount: number;
    feeItemIds?: string[];
    notes?: string | null;
  },
  userId: string,
) {
  const client = getSupabaseServerClient();

  let lineItems: Array<{
    school_id: string;
    description: string;
    quantity: number;
    unit_amount: number;
    line_total: number;
    sort_order: number;
    tuition_fee_item_id?: string | null;
  }> = [];

  if (data.feeItemIds && data.feeItemIds.length > 0) {
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

    lineItems = feeItems.map((item, index) => ({
      school_id: data.schoolId,
      description: item.name,
      quantity: 1,
      unit_amount: item.amount,
      line_total: item.amount,
      sort_order: index,
      tuition_fee_item_id: item.id,
    }));
  } else if (data.totalAmount > 0) {
    lineItems = [
      {
        school_id: data.schoolId,
        description: data.title,
        quantity: 1,
        unit_amount: data.totalAmount,
        line_total: data.totalAmount,
        sort_order: 0,
        tuition_fee_item_id: null,
      },
    ];
  } else {
    throw new Error('Contract amount or fee items required to create invoice');
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
      notes: data.notes ?? null,
      status: 'issued',
    })
    .select('id')
    .single();

  if (invoiceError || !invoice) {
    throw invoiceError ?? new Error('Failed to create invoice');
  }

  const { error: linesError } = await client.from('invoice_line_items').insert(
    lineItems.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    })),
  );

  if (linesError) {
    throw linesError;
  }

  await recalculateInvoice(
    client as unknown as SupabaseClient<Database>,
    invoice.id,
    data.schoolId,
  );

  return invoice.id;
}

export const createStudentContractAction = enhanceAction(
  async (data, user) => {
    await assertContractPermission(user.id, STUDENTS_PERMISSIONS.CONTRACTS_MANAGE);

    const client = getSupabaseServerClient();
    const sequence = await getNextContractSequence(data.schoolId);
    const contractNumber = formatStudentContractNumber(sequence);
    const status = data.activate ? 'active' : 'draft';

    if (status === 'active') {
      await deactivateSameTypeContracts(
        data.schoolId,
        data.studentId,
        data.contractType,
      );
    }

    const { data: contract, error } = await client
      .from('student_contracts')
      .insert({
        school_id: data.schoolId,
        student_id: data.studentId,
        contract_number: contractNumber,
        contract_type: data.contractType,
        title: data.title,
        status,
        start_date: data.startDate,
        end_date: data.endDate || null,
        total_amount: data.totalAmount,
        billing_period: data.billingPeriod || null,
        terms: data.terms || null,
        signed_at: data.signedAt || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error || !contract) {
      throw error ?? new Error('Failed to create contract');
    }

    let invoiceId: string | null = null;

    if (
      data.createInvoice &&
      status === 'active' &&
      (data.contractType === 'tuition_agreement' ||
        data.contractType === 'enrollment' ||
        data.contractType === 're_enrollment')
    ) {
      const billingPeriod =
        data.billingPeriod || new Date().toISOString().slice(0, 7);
      const dueDate = data.endDate || `${billingPeriod}-28`;

      invoiceId = await createInvoiceForContract(
        {
          schoolId: data.schoolId,
          studentId: data.studentId,
          title: data.title,
          billingPeriod,
          dueDate,
          totalAmount: data.totalAmount,
          feeItemIds: data.feeItemIds,
          notes: data.terms || null,
        },
        user.id,
      );

      const { error: linkError } = await client
        .from('student_contracts')
        .update({ invoice_id: invoiceId })
        .eq('id', contract.id)
        .eq('school_id', data.schoolId);

      if (linkError) {
        throw linkError;
      }
    }

    revalidateContractPaths({
      studentId: data.studentId,
      invoiceId: invoiceId ?? undefined,
    });

    return { success: true, contractId: contract.id, invoiceId };
  },
  { schema: CreateStudentContractSchema },
);

export const updateStudentContractAction = enhanceAction(
  async (data, user) => {
    await assertContractPermission(user.id, STUDENTS_PERMISSIONS.CONTRACTS_MANAGE);

    const client = getSupabaseServerClient();

    const { data: existing, error: loadError } = await client
      .from('student_contracts')
      .select('id, status, student_id')
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId)
      .single();

    if (loadError || !existing) {
      throw loadError ?? new Error('Contract not found');
    }

    if (existing.status === 'cancelled' || existing.status === 'terminated') {
      throw new Error('Cannot update a closed contract');
    }

    const { error } = await client
      .from('student_contracts')
      .update({
        title: data.title,
        start_date: data.startDate,
        end_date: data.endDate || null,
        total_amount: data.totalAmount,
        billing_period: data.billingPeriod || null,
        terms: data.terms || null,
        signed_at: data.signedAt || null,
      })
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateContractPaths({ studentId: existing.student_id });
    return { success: true };
  },
  { schema: UpdateStudentContractSchema },
);

export const updateStudentContractStatusAction = enhanceAction(
  async (data, user) => {
    await assertContractPermission(user.id, STUDENTS_PERMISSIONS.CONTRACTS_MANAGE);

    const client = getSupabaseServerClient();

    const { data: existing, error: loadError } = await client
      .from('student_contracts')
      .select('id, status, student_id, contract_type')
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId)
      .single();

    if (loadError || !existing) {
      throw loadError ?? new Error('Contract not found');
    }

    const allowed: Record<string, string[]> = {
      draft: ['active', 'cancelled'],
      active: ['terminated', 'expired'],
      expired: ['terminated'],
      terminated: [],
      cancelled: [],
    };

    if (!allowed[existing.status]?.includes(data.status)) {
      throw new Error(
        `Cannot change status from ${existing.status} to ${data.status}`,
      );
    }

    if (data.status === 'active') {
      await deactivateSameTypeContracts(
        data.schoolId,
        existing.student_id,
        existing.contract_type,
        data.contractId,
      );
    }

    const { error } = await client
      .from('student_contracts')
      .update({ status: data.status })
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateContractPaths({ studentId: existing.student_id });
    return { success: true };
  },
  { schema: UpdateStudentContractStatusSchema },
);

export const linkStudentContractInvoiceAction = enhanceAction(
  async (data, user) => {
    await assertContractPermission(user.id, STUDENTS_PERMISSIONS.CONTRACTS_MANAGE);

    const client = getSupabaseServerClient();

    const { data: contract, error: contractError } = await client
      .from('student_contracts')
      .select('id, student_id')
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId)
      .single();

    if (contractError || !contract) {
      throw contractError ?? new Error('Contract not found');
    }

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('id, student_id')
      .eq('id', data.invoiceId)
      .eq('school_id', data.schoolId)
      .single();

    if (invoiceError || !invoice) {
      throw invoiceError ?? new Error('Invoice not found');
    }

    if (invoice.student_id !== contract.student_id) {
      throw new Error('Invoice student does not match contract student');
    }

    const { error } = await client
      .from('student_contracts')
      .update({ invoice_id: data.invoiceId })
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateContractPaths({
      studentId: contract.student_id,
      invoiceId: data.invoiceId,
    });

    return { success: true };
  },
  { schema: LinkStudentContractInvoiceSchema },
);
