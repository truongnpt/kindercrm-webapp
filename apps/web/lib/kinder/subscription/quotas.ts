import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import {
  isActiveTrialSubscription,
  resolveEffectivePackage,
  TRIAL_AI_CREDITS_MONTHLY,
} from '~/lib/kinder/subscription/package-features';
import { suggestUpgradePackage } from '~/lib/kinder/subscription/quota-suggestions';
import type { Package, SchoolContext, SchoolSubscription } from '~/lib/kinder/types';

export interface SchoolUsage {
  campuses: number;
  students: number;
  storageBytes: number;
}

export type QuotaFormSummary = {
  usage: SchoolUsage;
  limits: ReturnType<typeof getPackageLimits>;
  currentPackageName: string;
  students: {
    atLimit: boolean;
    nearLimit: boolean;
    suggestedPackageName: string | null;
  };
  campuses: {
    atLimit: boolean;
    nearLimit: boolean;
    suggestedPackageName: string | null;
  };
};

const NEAR_LIMIT_RATIO = 0.8;

function isNearLimit(used: number, max: number) {
  if (max <= 0) {
    return false;
  }

  return used / max >= NEAR_LIMIT_RATIO && used < max;
}

export async function loadQuotaFormSummary(
  client: SupabaseClient<Database>,
  context: SchoolContext,
  packages: Package[],
): Promise<QuotaFormSummary> {
  const usage = await getSchoolUsage(client, context.school.id);
  const pkg = context.effectivePackage ?? context.package;
  const limits = getPackageLimits(pkg, context.subscription);
  const currentPackageName = pkg?.name ?? context.package?.name ?? '—';

  const studentAtLimit =
    limits.maxStudents > 0 && usage.students >= limits.maxStudents;
  const campusAtLimit =
    limits.maxCampuses > 0 && usage.campuses >= limits.maxCampuses;

  const suggestedStudent = studentAtLimit
    ? suggestUpgradePackage(packages, pkg, 'students', usage.students + 1)
    : null;
  const suggestedCampus = campusAtLimit
    ? suggestUpgradePackage(packages, pkg, 'campuses', usage.campuses + 1)
    : null;

  return {
    usage,
    limits,
    currentPackageName,
    students: {
      atLimit: studentAtLimit,
      nearLimit: isNearLimit(usage.students, limits.maxStudents),
      suggestedPackageName: suggestedStudent?.name ?? null,
    },
    campuses: {
      atLimit: campusAtLimit,
      nearLimit: isNearLimit(usage.campuses, limits.maxCampuses),
      suggestedPackageName: suggestedCampus?.name ?? null,
    },
  };
}

const BYTES_PER_MB = 1024 * 1024;

export function bytesToMegabytes(bytes: number) {
  return bytes / BYTES_PER_MB;
}

export function formatStorageMegabytes(bytes: number) {
  const mb = bytesToMegabytes(bytes);

  if (mb >= 100) {
    return Math.round(mb).toString();
  }

  if (mb >= 10) {
    return mb.toFixed(1);
  }

  return mb.toFixed(2);
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

  const storageBytes = await getSchoolStorageUsageBytes(client, schoolId);

  return {
    campuses: campusCount ?? 0,
    students: studentCount ?? 0,
    storageBytes,
  };
}

export async function getSchoolStorageUsageBytes(
  client: SupabaseClient<Database>,
  schoolId: string,
) {
  const { data, error } = await client.rpc('get_school_storage_usage_bytes', {
    p_school_id: schoolId,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
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
      KINDER_ERROR_CODES.CAMPUS_LIMIT_REACHED,
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
      KINDER_ERROR_CODES.STUDENT_LIMIT_REACHED,
    );
  }
}

/** SUB-009: Block uploads when school storage exceeds package max_storage_mb. */
export async function assertStorageQuota(
  client: SupabaseClient<Database>,
  schoolId: string,
  pkg: Package | null | undefined,
  additionalBytes = 0,
) {
  const limits = getPackageLimits(pkg);
  const maxBytes = limits.maxStorageMb * BYTES_PER_MB;

  if (maxBytes <= 0) {
    return;
  }

  const usedBytes = await getSchoolStorageUsageBytes(client, schoolId);

  if (usedBytes + additionalBytes > maxBytes) {
    throw new KinderError(
      KINDER_ERROR_CODES.STORAGE_LIMIT_REACHED,
      KINDER_ERROR_CODES.STORAGE_LIMIT_REACHED,
    );
  }
}

export async function loadSchoolUsageSummary(
  client: SupabaseClient<Database>,
  context: SchoolContext,
) {
  const usage = await getSchoolUsage(client, context.school.id);
  const pkg = context.effectivePackage ?? context.package;
  const limits = getPackageLimits(pkg, context.subscription);

  return { usage, limits };
}

export async function loadSchoolPackageForQuota(
  client: SupabaseClient<Database>,
  schoolId: string,
) {
  const { data, error } = await client
    .from('school_subscriptions')
    .select(
      `
      *,
      package:packages(*)
    `,
    )
    .eq('school_id', schoolId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const sub = data as SchoolSubscription & { package: Package | null };
  const { data: freePackage, error: freePackageError } = await client
    .from('packages')
    .select('*')
    .eq('code', 'free')
    .maybeSingle();

  if (freePackageError) {
    throw freePackageError;
  }

  return resolveEffectivePackage(sub.package, sub, freePackage as Package | null);
}
