'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

import { assertPermissionFromContext } from './assert-permission.server';
import { STAFF_PERMISSIONS } from './permission-keys';
import {
  CreateSchoolCustomRoleSchema,
  DeleteSchoolCustomRoleSchema,
  UpdateSchoolPermissionsSchema,
} from './schemas/permissions.schema';

function revalidatePermissionPaths() {
  revalidatePath(pathsConfig.app.staff);
  revalidatePath(pathsConfig.app.staffSetup);
  revalidatePath(pathsConfig.app.staffPermissions);
}

export const updateSchoolPermissionsAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    if (context.school.id !== data.schoolId) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'School mismatch',
      );
    }

    await assertPermissionFromContext(
      context,
      STAFF_PERMISSIONS.PERMISSIONS_MANAGE,
    );

    const client = getSupabaseServerClient();

    const grantsPayload = data.grants.map((grant) => ({
      role: grant.role ?? null,
      custom_role_id: grant.customRoleId ?? null,
      permission: grant.permission,
      granted: grant.granted,
    }));

    const { error } = await client.rpc('upsert_school_role_permission_grants', {
      p_school_id: data.schoolId,
      p_grants: grantsPayload,
    });

    if (error) {
      throw error;
    }

    revalidatePermissionPaths();

    return { success: true };
  },
  { schema: UpdateSchoolPermissionsSchema },
);

export const createSchoolCustomRoleAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    if (context.school.id !== data.schoolId) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'School mismatch',
      );
    }

    await assertPermissionFromContext(
      context,
      STAFF_PERMISSIONS.PERMISSIONS_MANAGE,
    );

    const client = getSupabaseServerClient();

    const { data: customRole, error } = await client
      .from('school_custom_roles')
      .insert({
        school_id: data.schoolId,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new KinderError(
          KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
          'Role slug already exists',
        );
      }

      throw error;
    }

    const { error: seedError } = await client.rpc('seed_custom_role_permissions', {
      p_custom_role_id: customRole.id,
    });

    if (seedError) {
      throw seedError;
    }

    revalidatePermissionPaths();

    return { success: true, customRoleId: customRole.id };
  },
  { schema: CreateSchoolCustomRoleSchema },
);

export const deleteSchoolCustomRoleAction = enhanceAction(
  async (data, user) => {
    const context = await requireSchoolContext(user.id);

    if (context.school.id !== data.schoolId) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'School mismatch',
      );
    }

    await assertPermissionFromContext(
      context,
      STAFF_PERMISSIONS.PERMISSIONS_MANAGE,
    );

    const client = getSupabaseServerClient();

    const { count, error: memberCountError } = await client
      .from('school_members')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', data.schoolId)
      .eq('custom_role_id', data.customRoleId)
      .is('deleted_at', null);

    if (memberCountError) {
      throw memberCountError;
    }

    if ((memberCount ?? 0) > 0) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'Cannot delete a role that is assigned to members',
      );
    }

    const { count: staffCount, error: staffCountError } = await client
      .from('staff_employees')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', data.schoolId)
      .eq('custom_role_id', data.customRoleId)
      .is('deleted_at', null);

    if (staffCountError) {
      throw staffCountError;
    }

    if ((staffCount ?? 0) > 0) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'Cannot delete a role that is assigned to staff',
      );
    }

    const { error } = await client
      .from('school_custom_roles')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', data.customRoleId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidatePermissionPaths();

    return { success: true };
  },
  { schema: DeleteSchoolCustomRoleSchema },
);
