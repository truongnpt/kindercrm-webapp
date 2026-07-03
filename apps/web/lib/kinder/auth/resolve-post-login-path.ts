import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export function isSafeInternalRedirectPath(path: string) {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/auth/sign-in') &&
    !path.startsWith('/auth/sign-up') &&
    path !== pathsConfig.auth.postLogin
  );
}

export async function resolvePostLoginPath(userId: string) {
  const client = getSupabaseServerClient();

  const [{ data: memberships, error: membershipsError }, { data: platformAdmin }] =
    await Promise.all([
      client
        .from('school_members')
        .select('role')
        .eq('user_id', userId)
        .is('deleted_at', null),
      client
        .from('platform_admins')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null)
        .maybeSingle(),
    ]);

  if (membershipsError) {
    throw membershipsError;
  }

  const hasStaffMembership = (memberships ?? []).some(
    (membership) => membership.role !== 'parent',
  );

  if (hasStaffMembership) {
    return pathsConfig.app.home;
  }

  const { count: parentCount } = await client
    .from('parent_student_links')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((parentCount ?? 0) > 0) {
    return pathsConfig.parent.home;
  }

  if (platformAdmin) {
    return pathsConfig.platform.home;
  }

  return pathsConfig.app.onboarding;
}
