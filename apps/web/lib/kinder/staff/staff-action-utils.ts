import 'server-only';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import {
  type KinderPermission,
} from '~/lib/kinder/permissions';
import { assertPermissionFromContext } from '~/lib/kinder/permissions/assert-permission.server';
import { requireSchoolContext } from '~/lib/kinder/tenant/get-school-context';

const STAFF_PATH = pathsConfig.app.staff;

export function revalidateStaffPaths(employeeId?: string) {
  revalidatePath(STAFF_PATH);
  revalidatePath(pathsConfig.app.staffAttendance);
  revalidatePath(pathsConfig.app.staffLeave);
  revalidatePath(pathsConfig.app.staffReports);
  revalidatePath(pathsConfig.app.classes);

  if (employeeId) {
    revalidatePath(`${pathsConfig.app.staffDetail}/${employeeId}`);
  }
}

export async function assertStaffPermission(
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

export async function getNextEmployeeSequence(schoolId: string) {
  const client = getSupabaseServerClient();
  const { count, error } = await client
    .from('staff_employees')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return (count ?? 0) + 1;
}
