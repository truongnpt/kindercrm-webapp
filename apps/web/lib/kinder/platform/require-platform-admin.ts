import 'server-only';

import { cache } from 'react';

import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import type { PlatformAdminContext, PlatformAdminRole } from './types';

const ALL_PLATFORM_ROLES: PlatformAdminRole[] = [
  'super_admin',
  'support',
  'billing',
];

export const getPlatformAdminContext = cache(
  async (userId: string): Promise<PlatformAdminContext | null> => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('platform_admins')
      .select('id, role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('revoked_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      role: data.role as PlatformAdminRole,
    };
  },
);

export async function requirePlatformAdmin(
  userId: string,
  allowedRoles: PlatformAdminRole[] = ALL_PLATFORM_ROLES,
): Promise<PlatformAdminContext> {
  const context = await getPlatformAdminContext(userId);

  if (!context || !allowedRoles.includes(context.role)) {
    throw new KinderError(
      KINDER_ERROR_CODES.PLATFORM_ACCESS_DENIED,
      'Platform access denied',
    );
  }

  return context;
}

export async function requirePlatformAdminPage(
  userId: string,
  allowedRoles: PlatformAdminRole[] = ALL_PLATFORM_ROLES,
): Promise<PlatformAdminContext> {
  const context = await getPlatformAdminContext(userId);

  if (!context || !allowedRoles.includes(context.role)) {
    redirect(pathsConfig.app.home);
  }

  return context;
}

/** Skip school onboarding — platform operators go straight to `/platform`. */
export async function redirectIfPlatformAdmin(userId: string) {
  const context = await getPlatformAdminContext(userId);

  if (context) {
    redirect(pathsConfig.platform.home);
  }
}

export function assertPlatformRole(
  context: PlatformAdminContext,
  allowedRoles: PlatformAdminRole[],
) {
  if (!allowedRoles.includes(context.role)) {
    throw new KinderError(
      KINDER_ERROR_CODES.PLATFORM_ACCESS_DENIED,
      'Insufficient platform permissions',
    );
  }
}
