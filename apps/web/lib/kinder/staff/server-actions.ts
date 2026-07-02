'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import {
  parseAccessRoleKey,
  STAFF_PERMISSIONS,
  type KinderPermission,
} from '~/lib/kinder/permissions';
import { assertPermissionFromContext } from '~/lib/kinder/permissions/assert-permission.server';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

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
  ResendStaffInviteSchema,
  UpdateStaffEmployeeSchema,
} from './schemas/staff.schema';
import { resendStaffInvite } from './provision-staff-account';
import { syncStaffMemberAccess } from './sync-member-access';

const STAFF_PATH = pathsConfig.app.staff;

function revalidateStaffPaths(employeeId?: string) {
  revalidatePath(STAFF_PATH);
  revalidatePath(pathsConfig.app.classes);

  if (employeeId) {
    revalidatePath(`${pathsConfig.app.staffDetail}/${employeeId}`);
  }
}

async function assertStaffPermission(
  userId: string,
  schoolId: string,
  permission: KinderPermission,
) {
  const context = await requireSchoolContext(userId);

  if (context.school.id !== schoolId) {
    throw new KinderError(
      KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
      'School mismatch',
    );
  }

  await assertPermissionFromContext(context, permission);
}

async function getNextEmployeeSequence(schoolId: string) {
  const count = await countStaffEmployees(schoolId);

  return count + 1;
}

export const createDepartmentAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.SETUP_MANAGE,
    );

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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.SETUP_MANAGE,
    );

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

export const createStaffEmployeeAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DIRECTORY_CREATE,
    );

    if (data.grantSystemAccess) {
      await assertStaffPermission(
        user.id,
        data.schoolId,
        STAFF_PERMISSIONS.ACCESS_MANAGE,
      );
    }

    const client = getSupabaseServerClient();
    const sequence = await getNextEmployeeSequence(data.schoolId);
    const employeeCode =
      data.employeeCode?.trim() || generateEmployeeCode(sequence);
    const { accessRole, customRoleId } = parseAccessRoleKey(data.accessRoleKey);

    const { data: employee, error } = await client
      .from('staff_employees')
      .insert({
        school_id: data.schoolId,
        employee_code: employeeCode,
        full_name: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        is_teacher: data.isTeacher,
        access_role: accessRole,
        custom_role_id: customRoleId,
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

    await syncStaffMemberAccess(client, {
      schoolId: data.schoolId,
      employeeId: employee.id,
      fullName: data.fullName,
      email: data.email || null,
      accessRole,
      customRoleId,
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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DIRECTORY_UPDATE,
    );

    if (data.grantSystemAccess) {
      await assertStaffPermission(
        user.id,
        data.schoolId,
        STAFF_PERMISSIONS.ACCESS_MANAGE,
      );
    }

    const client = getSupabaseServerClient();
    const { accessRole, customRoleId } = parseAccessRoleKey(data.accessRoleKey);

    const { error } = await client
      .from('staff_employees')
      .update({
        full_name: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        is_teacher: data.isTeacher,
        access_role: accessRole,
        custom_role_id: customRoleId,
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

    await syncStaffMemberAccess(client, {
      schoolId: data.schoolId,
      employeeId: data.employeeId,
      fullName: data.fullName,
      email: data.email || null,
      accessRole,
      customRoleId,
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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.DIRECTORY_DELETE,
    );

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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.CONTRACTS_MANAGE,
    );

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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.CLASSES_MANAGE,
    );

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
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.CLASSES_MANAGE,
    );

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

export const resendStaffInviteAction = enhanceAction(
  async (data, user) => {
    await assertStaffPermission(
      user.id,
      data.schoolId,
      STAFF_PERMISSIONS.ACCESS_MANAGE,
    );

    const client = getSupabaseServerClient();

    const { data: employee, error } = await client
      .from('staff_employees')
      .select(
        'id, full_name, email, grant_system_access, employment_status, access_role, custom_role_id',
      )
      .eq('id', data.employeeId)
      .eq('school_id', data.schoolId)
      .is('deleted_at', null)
      .single();

    if (error || !employee) {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_NOT_FOUND,
        'Employee not found',
      );
    }

    if (!employee.grant_system_access) {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_INVITE_FAILED,
        'System access is not enabled for this employee',
      );
    }

    if (!employee.email) {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_INVITE_FAILED,
        'Employee email is required to send an invite',
      );
    }

    const provision = await resendStaffInvite({
      email: employee.email,
      fullName: employee.full_name,
    });

    if (provision.outcome === 'error') {
      throw new KinderError(
        KINDER_ERROR_CODES.STAFF_INVITE_FAILED,
        provision.message,
      );
    }

    if (provision.outcome === 'invited') {
      const { error: inviteTimestampError } = await client
        .from('staff_employees')
        .update({ invite_sent_at: new Date().toISOString() })
        .eq('id', employee.id);

      if (inviteTimestampError) {
        throw inviteTimestampError;
      }
    }

    await syncStaffMemberAccess(client, {
      schoolId: data.schoolId,
      employeeId: employee.id,
      fullName: employee.full_name,
      email: employee.email,
      accessRole: employee.access_role,
      customRoleId: employee.custom_role_id,
      grantSystemAccess: employee.grant_system_access,
      employmentStatus: employee.employment_status,
    });

    revalidateStaffPaths(employee.id);
    return { success: true, invited: provision.outcome === 'invited' };
  },
  { schema: ResendStaffInviteSchema },
);
