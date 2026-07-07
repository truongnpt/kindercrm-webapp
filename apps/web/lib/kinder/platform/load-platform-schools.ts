import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { PlatformSchoolDetail, PlatformSchoolListItem } from './types';

async function countForSchools(schoolIds: string[]) {
  const client = getPlatformDataClient();

  if (schoolIds.length === 0) {
    return new Map<string, { students: number; campuses: number }>();
  }

  const [studentsResult, campusesResult] = await Promise.all([
    client.from('students').select('school_id').in('school_id', schoolIds).is('deleted_at', null),
    client.from('campuses').select('school_id').in('school_id', schoolIds).is('deleted_at', null),
  ]);

  const counts = new Map<string, { students: number; campuses: number }>();

  for (const id of schoolIds) {
    counts.set(id, { students: 0, campuses: 0 });
  }

  for (const row of studentsResult.data ?? []) {
    const entry = counts.get(row.school_id);

    if (entry) {
      entry.students += 1;
    }
  }

  for (const row of campusesResult.data ?? []) {
    const entry = counts.get(row.school_id);

    if (entry) {
      entry.campuses += 1;
    }
  }

  return counts;
}

function mapSchoolRow(
  school: {
    id: string;
    name: string;
    slug: string;
    status: PlatformSchoolListItem['status'];
    email: string | null;
    phone: string | null;
    created_at: string;
    address?: string | null;
    school_subscriptions:
      | Array<{
          id: string;
          package_id: string;
          status: string;
          trial_ends_at: string | null;
          package: { name: string } | null;
        }>
      | {
          id: string;
          package_id: string;
          status: string;
          trial_ends_at: string | null;
          package: { name: string } | null;
        }
      | null;
  },
  counts: { students: number; campuses: number },
): PlatformSchoolListItem {
  const subscription = Array.isArray(school.school_subscriptions)
    ? (school.school_subscriptions[0] ?? null)
    : (school.school_subscriptions ?? null);

  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    status: school.status,
    email: school.email,
    phone: school.phone,
    created_at: school.created_at,
    package_name: subscription?.package?.name ?? null,
    subscription_status: subscription?.status ?? null,
    has_subscription: Boolean(subscription),
    student_count: counts.students,
    campus_count: counts.campuses,
  };
}

export async function loadPlatformSchools(filters?: {
  status?: string;
  search?: string;
  missingSubscription?: boolean;
}): Promise<PlatformSchoolListItem[]> {
  const client = getPlatformDataClient();

  let query = client
    .from('schools')
    .select(
      `
      id,
      name,
      slug,
      status,
      email,
      phone,
      created_at,
      school_subscriptions (
        id,
        package_id,
        status,
        trial_ends_at,
        package:packages ( name )
      )
    `,
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq(
      'status',
      filters.status as PlatformSchoolListItem['status'],
    );
  }

  if (filters?.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term},email.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const schools = data ?? [];
  const counts = await countForSchools(schools.map((school) => school.id));

  const rows = schools.map((school) =>
    mapSchoolRow(school, counts.get(school.id) ?? { students: 0, campuses: 0 }),
  );

  if (filters?.missingSubscription) {
    return rows.filter((school) => !school.has_subscription);
  }

  return rows;
}

export async function loadPlatformSchoolDetail(
  schoolId: string,
): Promise<PlatformSchoolDetail | null> {
  const client = getPlatformDataClient();

  const { data: school, error } = await client
    .from('schools')
    .select(
      `
      id,
      name,
      slug,
      status,
      email,
      phone,
      address,
      created_at,
      school_subscriptions (
        id,
        package_id,
        status,
        trial_ends_at,
        package:packages ( name )
      )
    `,
    )
    .eq('id', schoolId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!school) {
    return null;
  }

  const counts = await countForSchools([school.id]);
  const base = mapSchoolRow(
    school,
    counts.get(school.id) ?? { students: 0, campuses: 0 },
  );
  const subscription = Array.isArray(school.school_subscriptions)
    ? (school.school_subscriptions[0] ?? null)
    : (school.school_subscriptions ?? null);

  const { data: ownerMember } = await client
    .from('school_members')
    .select('user_id')
    .eq('school_id', schoolId)
    .eq('role', 'owner')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  let owner_email: string | null = null;
  let owner_name: string | null = null;

  if (ownerMember?.user_id) {
    const { data: account } = await client
      .from('accounts')
      .select('email, name')
      .eq('id', ownerMember.user_id)
      .maybeSingle();

    owner_email = account?.email ?? null;
    owner_name = account?.name ?? null;
  }

  return {
    ...base,
    address: school.address,
    trial_ends_at: subscription?.trial_ends_at ?? null,
    package_id: subscription?.package_id ?? null,
    subscription_id: subscription?.id ?? null,
    owner_email,
    owner_name,
  };
}
