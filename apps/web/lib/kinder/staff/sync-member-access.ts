import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { findAccountByEmailForSchool } from '~/lib/kinder/tenant/account-lookup';

import { provisionStaffAccount } from './provision-staff-account';

type StaffAccessRole = Database['public']['Enums']['staff_access_role'];
type SchoolMemberRole = Database['public']['Enums']['school_member_role'];

function mapAccessRoleToMemberRole(
  accessRole: StaffAccessRole,
): SchoolMemberRole {
  if (accessRole === 'accountant') {
    return 'staff';
  }

  return accessRole as SchoolMemberRole;
}

export type SyncStaffMemberAccessResult =
  | {
      linked: true;
      userId: string;
      memberId: string | null | undefined;
      invited?: boolean;
    }
  | {
      linked: false;
      reason?:
        | 'missing_email'
        | 'account_not_found'
        | 'invite_failed'
        | 'revoked';
      message?: string;
    };

export async function syncStaffMemberAccess(
  client: SupabaseClient<Database>,
  params: {
    schoolId: string;
    employeeId: string;
    fullName: string;
    email: string | null;
    accessRole: StaffAccessRole;
    customRoleId?: string | null;
    grantSystemAccess: boolean;
    employmentStatus: Database['public']['Enums']['staff_employment_status'];
  },
): Promise<SyncStaffMemberAccessResult> {
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
      .update({
        member_id: null,
        user_id: null,
        invite_sent_at: null,
        custom_role_id: null,
      })
      .eq('id', params.employeeId);

    return { linked: false, reason: 'revoked' };
  }

  if (!params.email) {
    return { linked: false, reason: 'missing_email' };
  }

  let account = await findAccountByEmailForSchool(
    params.schoolId,
    params.email,
  );
  let invited = false;

  if (!account) {
    const provision = await provisionStaffAccount({
      email: params.email,
      fullName: params.fullName,
    });

    if (provision.outcome === 'error') {
      await client
        .from('staff_employees')
        .update({ invite_sent_at: null })
        .eq('id', params.employeeId);

      return {
        linked: false,
        reason: 'invite_failed',
        message: provision.message,
      };
    }

    invited = provision.outcome === 'invited';

    await client
      .from('staff_employees')
      .update({
        invite_sent_at: new Date().toISOString(),
      })
      .eq('id', params.employeeId);

    account = {
      id: provision.userId,
      email: params.email,
      name: params.fullName,
    };
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
        custom_role_id: params.customRoleId ?? null,
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
        custom_role_id: params.customRoleId ?? null,
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
      custom_role_id: params.customRoleId ?? null,
    })
    .eq('id', params.employeeId);

  if (employeeError) {
    throw employeeError;
  }

  return {
    linked: true,
    userId: account.id,
    memberId,
    invited,
  };
}
