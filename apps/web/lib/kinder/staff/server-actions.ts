'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import { generateEmployeeCode } from './generate-employee-code';
import { countStaffEmployees } from './load-staff';
import {
  AssignStaffClassSchema,
  CreateDepartmentSchema,
  CreatePositionSchema,
  CreateStaffContractSchema,
  CreateStaffEmployeeSchema,
  DeleteStaffEmployeeSchema,
  RemoveStaffClassAssignmentSchema,
  UpdateStaffEmployeeSchema,
} from './schemas/staff.schema';
import { syncStaffMemberAccess } from './sync-member-access';

const STAFF_PATH = pathsConfig.app.staff;

function revalidateStaffPaths(employeeId?: string) {
  revalidatePath(STAFF_PATH);
  revalidatePath(pathsConfig.app.classes);

  if (employeeId) {
    revalidatePath(`${pathsConfig.app.staffDetail}/${employeeId}`);
  }
}

async function assertSchoolAdmin(schoolId: string, userId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || !['owner', 'admin'].includes(data.role)) {
    throw new KinderError(
      KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
      'Only school owners and admins can manage staff',
    );
  }
}

async function getNextEmployeeSequence(schoolId: string) {
  const count = await countStaffEmployees(schoolId);

  return count + 1;
}

export const createDepartmentAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { error } = await client.from('staff_departments').insert({
      school_id: data.schoolId,
      name: data.name,
      description: data.description || null,
    });

    if (error) {
      throw error;
    }

    revalidateStaffPaths();
    return { success: true };
  },
  { schema: CreateDepartmentSchema },
);

export const createPositionAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { error } = await client.from('staff_positions').insert({
      school_id: data.schoolId,
      name: data.name,
      department_id: data.departmentId || null,
      description: data.description || null,
    });

    if (error) {
      throw error;
    }

    revalidateStaffPaths();
    return { success: true };
  },
  { schema: CreatePositionSchema },
);

async function getSchoolName(schoolId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('schools')
    .select('name')
    .eq('id', schoolId)
    .single();

  if (error) {
    throw error;
  }

  return data.name;
}

export const createStaffEmployeeAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();
    const sequence = await getNextEmployeeSequence(data.schoolId);
    const employeeCode =
      data.employeeCode?.trim() || generateEmployeeCode(sequence);

    const { data: employee, error } = await client
      .from('staff_employees')
      .insert({
        school_id: data.schoolId,
        employee_code: employeeCode,
        full_name: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        is_teacher: data.isTeacher,
        access_role: data.accessRole,
        grant_system_access: data.grantSystemAccess,
        department_id: data.departmentId || null,
        position_id: data.positionId || null,
        campus_id: data.campusId || null,
        hire_date: data.hireDate || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        id_number: data.idNumber || null,
        address: data.address || null,
        emergency_contact_name: data.emergencyContactName || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        notes: data.notes || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error || !employee) {
      throw error ?? new Error('Failed to create employee');
    }

    const schoolName = await getSchoolName(data.schoolId);

    await syncStaffMemberAccess(client, {
      schoolId: data.schoolId,
      employeeId: employee.id,
      email: data.email || null,
      fullName: data.fullName,
      schoolName,
      accessRole: data.accessRole,
      grantSystemAccess: data.grantSystemAccess,
      employmentStatus: 'active',
    });

    revalidateStaffPaths(employee.id);
    redirect(`${pathsConfig.app.staffDetail}/${employee.id}`);
  },
  { schema: CreateStaffEmployeeSchema },
);

export const updateStaffEmployeeAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { error } = await client
      .from('staff_employees')
      .update({
        full_name: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        is_teacher: data.isTeacher,
        access_role: data.accessRole,
        grant_system_access: data.grantSystemAccess,
        department_id: data.departmentId || null,
        position_id: data.positionId || null,
        campus_id: data.campusId || null,
        employment_status: data.employmentStatus,
        hire_date: data.hireDate || null,
        termination_date: data.terminationDate || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        id_number: data.idNumber || null,
        address: data.address || null,
        emergency_contact_name: data.emergencyContactName || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        notes: data.notes || null,
      })
      .eq('id', data.employeeId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    const schoolName = await getSchoolName(data.schoolId);

    await syncStaffMemberAccess(client, {
      schoolId: data.schoolId,
      employeeId: data.employeeId,
      email: data.email || null,
      fullName: data.fullName,
      schoolName,
      accessRole: data.accessRole,
      grantSystemAccess: data.grantSystemAccess,
      employmentStatus: data.employmentStatus,
    });

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: UpdateStaffEmployeeSchema },
);

export const deleteStaffEmployeeAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { data: employee, error: fetchError } = await client
      .from('staff_employees')
      .select('id, member_id, user_id')
      .eq('id', data.employeeId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !employee) {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_NOT_FOUND,
        'Employee not found',
      );
    }

    const { error } = await client
      .from('staff_employees')
      .update({
        deleted_at: new Date().toISOString(),
        employment_status: 'terminated',
        termination_date: new Date().toISOString().slice(0, 10),
      })
      .eq('id', data.employeeId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (employee.member_id) {
      await client
        .from('school_members')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', employee.member_id);
    }

    if (employee.user_id) {
      await client
        .from('classes')
        .update({ teacher_user_id: null })
        .eq('school_id', data.schoolId)
        .eq('teacher_user_id', employee.user_id);
    }

    revalidateStaffPaths();
    redirect(STAFF_PATH);
  },
  { schema: DeleteStaffEmployeeSchema },
);

export const createStaffContractAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    await client
      .from('staff_contracts')
      .update({ is_active: false })
      .eq('employee_id', data.employeeId)
      .eq('school_id', data.schoolId);

    const { error } = await client.from('staff_contracts').insert({
      school_id: data.schoolId,
      employee_id: data.employeeId,
      contract_type: data.contractType,
      title: data.title,
      start_date: data.startDate,
      end_date: data.endDate || null,
      salary_amount: data.salaryAmount,
      notes: data.notes || null,
      is_active: true,
    });

    if (error) {
      throw error;
    }

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: CreateStaffContractSchema },
);

export const assignStaffClassAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { data: employee, error: employeeError } = await client
      .from('staff_employees')
      .select('id, user_id, is_teacher, employment_status')
      .eq('id', data.employeeId)
      .eq('school_id', data.schoolId)
      .single();

    if (employeeError || !employee) {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_NOT_FOUND,
        'Employee not found',
      );
    }

    if (!employee.is_teacher) {
      throw new Error('Only employees marked as teachers can be assigned to classes');
    }

    if (data.assignmentRole === 'homeroom') {
      if (!employee.user_id) {
        throw new Error('Homeroom teacher must have a linked system account');
      }

      await client
        .from('classes')
        .update({ teacher_user_id: employee.user_id })
        .eq('id', data.classId)
        .eq('school_id', data.schoolId);
    }

    const { error } = await client.from('staff_class_assignments').upsert(
      {
        school_id: data.schoolId,
        employee_id: data.employeeId,
        class_id: data.classId,
        assignment_role: data.assignmentRole,
        assigned_at: new Date().toISOString().slice(0, 10),
      },
      { onConflict: 'employee_id,class_id,assignment_role' },
    );

    if (error) {
      throw error;
    }

    revalidateStaffPaths(data.employeeId);
    return { success: true };
  },
  { schema: AssignStaffClassSchema },
);

export const removeStaffClassAssignmentAction = enhanceAction(
  async (data, user) => {
    await assertSchoolAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { data: assignment, error: fetchError } = await client
      .from('staff_class_assignments')
      .select('id, class_id, assignment_role, employee:staff_employees!inner(user_id)')
      .eq('id', data.assignmentId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !assignment) {
      throw new Error('Assignment not found');
    }

    const employee = assignment.employee as { user_id: string | null };

    if (assignment.assignment_role === 'homeroom' && employee.user_id) {
      await client
        .from('classes')
        .update({ teacher_user_id: null })
        .eq('id', assignment.class_id)
        .eq('school_id', data.schoolId)
        .eq('teacher_user_id', employee.user_id);
    }

    const { error } = await client
      .from('staff_class_assignments')
      .delete()
      .eq('id', data.assignmentId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateStaffPaths();
    return { success: true };
  },
  { schema: RemoveStaffClassAssignmentSchema },
);
