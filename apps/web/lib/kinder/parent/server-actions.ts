'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { provisionUserAccount } from '~/lib/kinder/auth/provision-user-account';
import { upsertDailyReportAction } from '~/lib/kinder/daily-reports/server-actions';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { findAccountByEmailForSchool } from '~/lib/kinder/tenant/account-lookup';

import {
  LinkParentAccountSchema,
  UnlinkParentAccountSchema,
} from './schemas/parent.schema';

function revalidateParentPaths(studentId?: string) {
  revalidatePath(pathsConfig.parent.home);

  if (studentId) {
    revalidatePath(`${pathsConfig.parent.child}/${studentId}`);
    revalidatePath(`${pathsConfig.app.studentDetail}/${studentId}`);
  }
}

async function assertSchoolStaffAdmin(schoolId: string, userId: string) {
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

  if (!data || !['owner', 'admin', 'staff'].includes(data.role)) {
    throw new KinderError(
      KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
      'Insufficient permissions',
    );
  }
}

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

/** PARENT-001 Link parent portal account */
export const linkParentAccountAction = enhanceAction(
  async (data, user) => {
    await assertSchoolStaffAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();
    const schoolName = await getSchoolName(data.schoolId);

    let account = await findAccountByEmailForSchool(data.schoolId, data.email);
    let accountCreated = false;
    let credentialsEmailSent = false;

    if (!account) {
      const { data: student } = await client
        .from('students')
        .select('full_name')
        .eq('id', data.studentId)
        .eq('school_id', data.schoolId)
        .single();

      const provisioned = await provisionUserAccount({
        email: data.email,
        name: student?.full_name ? `Phụ huynh ${student.full_name}` : data.email,
        accountType: 'parent',
        schoolName,
      });

      account = {
        id: provisioned.userId,
        email: provisioned.email,
        name: student?.full_name ? `Phụ huynh ${student.full_name}` : provisioned.email,
      };
      accountCreated = provisioned.created;
      credentialsEmailSent = provisioned.credentialsEmailSent;
    }

    const { data: link, error: linkError } = await client
      .from('parent_student_links')
      .upsert(
        {
          school_id: data.schoolId,
          student_id: data.studentId,
          user_id: account.id,
          student_parent_id: data.studentParentId || null,
          relationship: data.relationship,
          is_primary: data.isPrimary,
          created_by: user.id,
        },
        { onConflict: 'school_id,student_id,user_id' },
      )
      .select('id')
      .single();

    if (linkError) {
      throw linkError;
    }

    const { data: existingMember } = await client
      .from('school_members')
      .select('id')
      .eq('school_id', data.schoolId)
      .eq('user_id', account.id)
      .maybeSingle();

    if (!existingMember) {
      await client.from('school_members').insert({
        school_id: data.schoolId,
        user_id: account.id,
        role: 'parent',
      });
    } else {
      await client
        .from('school_members')
        .update({ deleted_at: null, role: 'parent' })
        .eq('id', existingMember.id);
    }

    revalidateParentPaths(data.studentId);
    return {
      success: true,
      linkId: link?.id,
      accountCreated,
      credentialsEmailSent,
    };
  },
  { schema: LinkParentAccountSchema },
);

export const unlinkParentAccountAction = enhanceAction(
  async (data, user) => {
    await assertSchoolStaffAdmin(data.schoolId, user.id);

    const client = getSupabaseServerClient();

    const { data: link, error: fetchError } = await client
      .from('parent_student_links')
      .select('id, user_id')
      .eq('id', data.linkId)
      .eq('school_id', data.schoolId)
      .eq('student_id', data.studentId)
      .single();

    if (fetchError || !link) {
      throw new Error('Parent link not found');
    }

    const { error } = await client
      .from('parent_student_links')
      .delete()
      .eq('id', data.linkId);

    if (error) {
      throw error;
    }

    const { count } = await client
      .from('parent_student_links')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', link.user_id)
      .eq('school_id', data.schoolId);

    if ((count ?? 0) === 0) {
      await client
        .from('school_members')
        .update({ deleted_at: new Date().toISOString() })
        .eq('school_id', data.schoolId)
        .eq('user_id', link.user_id)
        .eq('role', 'parent');
    }

    revalidateParentPaths(data.studentId);
    return { success: true };
  },
  { schema: UnlinkParentAccountSchema },
);

export { upsertDailyReportAction };
