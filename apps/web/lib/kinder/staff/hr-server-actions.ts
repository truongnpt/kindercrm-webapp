'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { STAFF_PERMISSIONS } from '~/lib/kinder/permissions';

import { generateEmployeeCode } from './generate-employee-code';
import { getHrDbClient } from './hr-db';
import {
  calculateAttendanceMinutes,
  calculateLeaveDays,
} from './load-staff-hr';
import { countStaffEmployees } from './load-staff';
import {
  CreateStaffDocumentSchema,
  CreateStaffLeaveRequestSchema,
  DeleteStaffDocumentSchema,
  ImportStaffEmployeesSchema,
  RenewStaffContractSchema,
  ReviewStaffLeaveRequestSchema,
  StaffCheckInSchema,
  StaffCheckOutSchema,
  StaffManualAttendanceSchema,
  TerminateStaffContractSchema,
} from './schemas/hr.schema';
import { assertStaffPermission, revalidateStaffPaths } from './staff-action-utils';
import type { StaffContract } from './types';

export const staffCheckInAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
    );

    const client = getHrDbClient();
    const checkInAt = data.checkInAt ?? new Date().toISOString();
    const workStart = new Date(`${data.attendanceDate}T08:00:00`);
    const isLate = new Date(checkInAt) > workStart;

    const { error } = await client
      .from('staff_attendance')
      .upsert(
        {
          school_id: data.schoolId,
          employee_id: data.employeeId,
          attendance_date: data.attendanceDate,
          check_in_at: checkInAt,
          is_late: isLate,
          source: 'check_in',
          notes: data.notes || null,
          created_by: user.id,
        },
        { onConflict: 'employee_id,attendance_date' },
      );

    if (error) {
      throw error;
    }

    revalidatePath(pathsConfig.app.staffAttendance);
    return { success: true };
  },
  { schema: StaffCheckInSchema },
);

export const staffCheckOutAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
    );

    const client = getHrDbClient();
    const checkOutAt = data.checkOutAt ?? new Date().toISOString();

    const { data: record, error: fetchError } = await client
      .from('staff_attendance')
      .select('check_in_at, attendance_date')
      .eq('id', data.attendanceId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !record) {
      throw new Error('Attendance record not found');
    }

    const workEnd = new Date(`${record.attendance_date}T17:00:00`);
    const isEarlyLeave =
      data.isEarlyLeave || new Date(checkOutAt) < workEnd;

    const { error } = await client
      .from('staff_attendance')
      .update({
        check_out_at: checkOutAt,
        is_early_leave: isEarlyLeave,
        total_minutes: calculateAttendanceMinutes(
          record.check_in_at,
          checkOutAt,
        ),
      })
      .eq('id', data.attendanceId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidatePath(pathsConfig.app.staffAttendance);
    return { success: true };
  },
  { schema: StaffCheckOutSchema },
);

export const staffManualAttendanceAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
    );

    const client = getHrDbClient();
    const checkInAt = data.checkInAt ?
      `${data.attendanceDate}T${data.checkInAt}:00`
    : null;
    const checkOutAt = data.checkOutAt ?
      `${data.attendanceDate}T${data.checkOutAt}:00`
    : null;

    const { error } = await client
      .from('staff_attendance')
      .upsert(
        {
          school_id: data.schoolId,
          employee_id: data.employeeId,
          attendance_date: data.attendanceDate,
          check_in_at: checkInAt,
          check_out_at: checkOutAt,
          total_minutes: calculateAttendanceMinutes(checkInAt, checkOutAt),
          is_late: data.isLate,
          is_early_leave: data.isEarlyLeave,
          source: 'manual',
          notes: data.notes || null,
          created_by: user.id,
        },
        { onConflict: 'employee_id,attendance_date' },
      );

    if (error) {
      throw error;
    }

    revalidatePath(pathsConfig.app.staffAttendance);
    return { success: true };
  },
  { schema: StaffManualAttendanceSchema },
);

export const createStaffLeaveRequestAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.LEAVE_VIEW,
    );

    const client = getHrDbClient();

    const { error } = await client
      .from('staff_leave_requests')
      .insert({
        school_id: data.schoolId,
        employee_id: data.employeeId,
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        days_count: calculateLeaveDays(data.startDate, data.endDate),
        reason: data.reason || null,
        created_by: user.id,
      });

    if (error) {
      throw error;
    }

    revalidatePath(pathsConfig.app.staffLeave);
    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: CreateStaffLeaveRequestSchema },
);

export const reviewStaffLeaveRequestAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.LEAVE_MANAGE,
    );

    const client = getHrDbClient();

    const { data: request, error: fetchError } = await client
      .from('staff_leave_requests')
      .select('employee_id, status')
      .eq('id', data.requestId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !request) {
      throw new Error('Leave request not found');
    }

    const { error } = await client
      .from('staff_leave_requests')
      .update({
        status: data.status,
        review_note: data.reviewNote || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', data.requestId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (data.status === 'approved') {
      await client
        .from('staff_employees')
        .update({ employment_status: 'on_leave' })
        .eq('id', request.employee_id)
        .eq('school_id', data.schoolId);
    }

    revalidatePath(pathsConfig.app.staffLeave);
    revalidateStaffPaths(request.employee_id);
    return { success: true };
  },
  { schema: ReviewStaffLeaveRequestSchema },
);

export const createStaffDocumentAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DOCUMENTS_MANAGE,
    );

    const client = getHrDbClient();

    const { error } = await client
      .from('staff_documents')
      .insert({
        school_id: data.schoolId,
        employee_id: data.employeeId,
        document_type: data.documentType,
        title: data.title,
        file_url: data.fileUrl,
        file_name: data.fileName || null,
        expires_at: data.expiresAt || null,
        notes: data.notes || null,
        uploaded_by: user.id,
      });

    if (error) {
      throw error;
    }

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: CreateStaffDocumentSchema },
);

export const deleteStaffDocumentAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DOCUMENTS_MANAGE,
    );

    const client = getHrDbClient();

    const { data: document, error: fetchError } = await client
      .from('staff_documents')
      .select('employee_id')
      .eq('id', data.documentId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !document) {
      throw new Error('Document not found');
    }

    const { error } = await client
      .from('staff_documents')
      .delete()
      .eq('id', data.documentId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateStaffPaths(document.employee_id);
    return { success: true };
  },
  { schema: DeleteStaffDocumentSchema },
);

export const renewStaffContractAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.CONTRACTS_MANAGE,
    );

    const client = getHrDbClient();

    const { data: contract, error: fetchError } = await client
      .from('staff_contracts')
      .select('*')
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !contract) {
      throw new Error('Contract not found');
    }

    await client
      .from('staff_contracts')
      .update({ is_active: false })
      .eq('employee_id', data.employeeId)
      .eq('school_id', data.schoolId);

    const { error } = await client.from('staff_contracts').insert({
      school_id: data.schoolId,
      employee_id: data.employeeId,
      contract_type: contract.contract_type,
      title: contract.title,
      start_date: data.startDate,
      end_date: data.endDate || null,
      salary_amount: data.salaryAmount ?? contract.salary_amount,
      notes: contract.notes,
      document_url: (contract as StaffContract).document_url ?? null,
      is_active: true,
    });

    if (error) {
      throw error;
    }

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: RenewStaffContractSchema },
);

export const terminateStaffContractAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.CONTRACTS_MANAGE,
    );

    const client = getHrDbClient();

    const { error } = await client
      .from('staff_contracts')
      .update({
        is_active: false,
        terminated_at: new Date().toISOString(),
      })
      .eq('id', data.contractId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: TerminateStaffContractSchema },
);

export const importStaffEmployeesAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DIRECTORY_CREATE,
    );

    const client = getHrDbClient();
    const [departments, positions, count] = await Promise.all([
      client
        .from('staff_departments')
        .select('id, name')
        .eq('school_id', data.schoolId),
      client
        .from('staff_positions')
        .select('id, name')
        .eq('school_id', data.schoolId),
      countStaffEmployees(data.schoolId),
    ]);

    const departmentByName = new Map(
      (departments.data ?? []).map((item: { name: string; id: string }) => [
        item.name.toLowerCase(),
        item.id,
      ]),
    );
    const positionByName = new Map(
      (positions.data ?? []).map((item: { name: string; id: string }) => [
        item.name.toLowerCase(),
        item.id,
      ]),
    );

    let sequence = count + 1;
    let imported = 0;

    for (const row of data.rows) {
      const employeeCode =
        row.employeeCode?.trim() || generateEmployeeCode(sequence);
      sequence += 1;

      const { error } = await client.from('staff_employees').insert({
        school_id: data.schoolId,
        employee_code: employeeCode,
        full_name: row.fullName,
        email: row.email || null,
        phone: row.phone || null,
        department_id:
          row.departmentName ?
            departmentByName.get(row.departmentName.toLowerCase()) ?? null
          : null,
        position_id:
          row.positionName ?
            positionByName.get(row.positionName.toLowerCase()) ?? null
          : null,
        hire_date: row.hireDate || null,
        date_of_birth: row.dateOfBirth || null,
        gender: row.gender || null,
        id_number: row.idNumber || null,
        address: row.address || null,
        is_teacher: row.isTeacher,
        created_by: user.id,
      });

      if (!error) {
        imported += 1;
      }
    }

    revalidateStaffPaths();
    return { success: true, imported };
  },
  { schema: ImportStaffEmployeesSchema },
);
