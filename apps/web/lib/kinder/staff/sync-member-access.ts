import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { provisionUserAccount } from '~/lib/kinder/auth/provision-user-account';
import { findAccountByEmailForSchool } from '~/lib/kinder/tenant/account-lookup';

type StaffAccessRole = Database['public']['Enums']['staff_access_role'];
type SchoolMemberRole = Database['public']['Enums']['school_member_role'];

function mapAccessRoleToMemberRole(
  accessRole: StaffAccessRole,
): SchoolMemberRole {
  return accessRole;
}

export async function syncStaffMemberAccess(
  client: SupabaseClient<Database>,
  params: {
    schoolId: string;
    employeeId: string;
    email: string | null;
    fullName: string;
    schoolName?: string;
    accessRole: StaffAccessRole;
    grantSystemAccess: boolean;
    employmentStatus: Database['public']['Enums']['staff_employment_status'];
  },
) {
  if (
    !params.grantSystemAccess ||
    params.employmentStatus === 'terminated' ||
    params.employmentStatus === 'inactive'
  ) {
    const { data: employee } = await client
      .from('staff_employees')
      .select('member_id')
      .eq('id', params.employeeId)
      .single();

    if (employee?.member_id) {
      await client
        .from('school_members')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', employee.member_id);
    }

    await client
      .from('staff_employees')
      .update({ member_id: null, user_id: null })
      .eq('id', params.employeeId);

    return { linked: false as const };
  }

  if (!params.email) {
    return { linked: false as const, reason: 'missing_email' as const };
  }

  let account = await findAccountByEmailForSchool(params.schoolId, params.email);
  let accountCreated = false;
  let credentialsEmailSent = false;

  if (!account) {
    const provisioned = await provisionUserAccount({
      email: params.email,
      name: params.fullName,
      accountType: 'staff',
      schoolName: params.schoolName,
    });

    account = {
      id: provisioned.userId,
      email: provisioned.email,
      name: params.fullName,
    };
    accountCreated = provisioned.created;
    credentialsEmailSent = provisioned.credentialsEmailSent;
  }

  const memberRole = mapAccessRoleToMemberRole(params.accessRole);

  const { data: existingMember } = await client
    .from('school_members')
    .select('id, deleted_at')
    .eq('school_id', params.schoolId)
    .eq('user_id', account.id)
    .maybeSingle();

  let memberId = existingMember?.id;

  if (existingMember) {
    const { error } = await client
      .from('school_members')
      .update({
        role: memberRole,
        deleted_at: null,
      })
      .eq('id', existingMember.id);

    if (error) {
      throw error;
    }
  } else {
    const { data: member, error } = await client
      .from('school_members')
      .insert({
        school_id: params.schoolId,
        user_id: account.id,
        role: memberRole,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    memberId = member?.id;
  }

  const { error: employeeError } = await client
    .from('staff_employees')
    .update({
      user_id: account.id,
      member_id: memberId ?? null,
    })
    .eq('id', params.employeeId);

  if (employeeError) {
    throw employeeError;
  }

  return {
    linked: true as const,
    userId: account.id,
    memberId,
    accountCreated,
    credentialsEmailSent,
  };
}
