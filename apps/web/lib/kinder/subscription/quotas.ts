import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import {
  isActiveTrialSubscription,
  TRIAL_AI_CREDITS_MONTHLY,
} from '~/lib/kinder/subscription/package-features';
import type { Package, SchoolContext, SchoolSubscription } from '~/lib/kinder/types';

export interface SchoolUsage {
  campuses: number;
  students: number;
}

export async function getSchoolUsage(
  client: SupabaseClient<Database>,
  schoolId: string,
): Promise<SchoolUsage> {
  const [{ count: campusCount }, { count: studentCount }] = await Promise.all([
    client
      .from('campuses')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
  ]);

  return {
    campuses: campusCount ?? 0,
    students: studentCount ?? 0,
  };
}

export function getPackageLimits(
  pkg: Package | null | undefined,
  subscription?: SchoolSubscription | null,
) {
  const aiCreditsMonthly =
    isActiveTrialSubscription(subscription) ?
      TRIAL_AI_CREDITS_MONTHLY
    : (pkg?.ai_credits_monthly ?? 0);

  return {
    maxStudents: pkg?.max_students ?? 0,
    maxCampuses: pkg?.max_campuses ?? 0,
    maxStorageMb: pkg?.max_storage_mb ?? 0,
    aiCreditsMonthly,
  };
}

export async function assertCampusQuota(
  client: SupabaseClient<Database>,
  schoolId: string,
  pkg: Package | null | undefined,
) {
  const limits = getPackageLimits(pkg);
  const usage = await getSchoolUsage(client, schoolId);

  if (usage.campuses >= limits.maxCampuses) {
    throw new KinderError(
      KINDER_ERROR_CODES.CAMPUS_LIMIT_REACHED,
      'Campus limit reached for current package',
    );
  }
}

export async function assertStudentQuota(
  client: SupabaseClient<Database>,
  schoolId: string,
  pkg: Package | null | undefined,
) {
  const limits = getPackageLimits(pkg);
  const usage = await getSchoolUsage(client, schoolId);

  if (usage.students >= limits.maxStudents) {
    throw new KinderError(
      KINDER_ERROR_CODES.STUDENT_LIMIT_REACHED,
      'Student limit reached for current package',
    );
  }
}

export async function loadSchoolUsageSummary(
  client: SupabaseClient<Database>,
  context: SchoolContext,
) {
  const usage = await getSchoolUsage(client, context.school.id);
  const limits = getPackageLimits(context.package, context.subscription);

  return { usage, limits };
}
