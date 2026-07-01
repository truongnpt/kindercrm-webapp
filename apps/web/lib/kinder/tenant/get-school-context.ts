import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import type {
  Campus,
  Package,
  School,
  SchoolContext,
  SchoolMemberRole,
  SchoolSubscription,
} from '~/lib/kinder/types';

import {
  getActiveSchoolIdFromCookie,
  setActiveSchoolIdCookie,
} from './active-school-cookie';

export const loadUserSchools = cache(async (userId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('school_members')
    .select(
      `
      role,
      school:schools (
        id,
        name,
        slug,
        logo_url,
        status
      )
    `,
    )
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => row.school && row.school.status === 'active')
    .map((row) => ({
      role: row.role as SchoolMemberRole,
      school: row.school as Pick<
        School,
        'id' | 'name' | 'slug' | 'logo_url' | 'status'
      >,
    }));
});

export const getSchoolContext = cache(
  async (userId: string): Promise<SchoolContext | null> => {
    const memberships = await loadUserSchools(userId);

    if (memberships.length === 0) {
      return null;
    }

    const staffMemberships = memberships.filter(
      (membership) => membership.role !== 'parent',
    );

    if (staffMemberships.length === 0) {
      return null;
    }

    const cookieSchoolId = await getActiveSchoolIdFromCookie();
    const active =
      staffMemberships.find((m) => m.school.id === cookieSchoolId) ??
      staffMemberships[0]!;

    if (active.school.id !== cookieSchoolId) {
      await setActiveSchoolIdCookie(active.school.id);
    }

    const client = getSupabaseServerClient();

    const { data: school, error: schoolError } = await client
      .from('schools')
      .select('*')
      .eq('id', active.school.id)
      .is('deleted_at', null)
      .single();

    if (schoolError || !school) {
      return null;
    }

    const { data: subscription } = await client
      .from('school_subscriptions')
      .select(
        `
        *,
        package:packages (*)
      `,
      )
      .eq('school_id', school.id)
      .maybeSingle();

    const sub = subscription as
      | (SchoolSubscription & { package: Package | null })
      | null;

    return {
      school: school as School,
      role: active.role,
      subscription: sub,
      package: sub?.package ?? null,
    };
  },
);

export async function requireSchoolContext(
  userId: string,
): Promise<SchoolContext> {
  const context = await getSchoolContext(userId);

  if (!context) {
    throw new KinderError(
      KINDER_ERROR_CODES.NO_ACTIVE_SCHOOL,
      'No active school',
    );
  }

  return context;
}

export const loadCampuses = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('campuses')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('is_main', { ascending: false })
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as Campus[];
});
