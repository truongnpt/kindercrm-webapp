import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { EnterpriseInquiryListItem } from './types';

export async function loadEnterpriseInquiries(): Promise<EnterpriseInquiryListItem[]> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('enterprise_inquiries')
    .select(
      `
      id,
      school_id,
      submitted_by_user_id,
      contact_name,
      phone,
      campus_count,
      notes,
      status,
      created_at,
      schools ( name, slug )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((row) => row.submitted_by_user_id))];

  const accountsByUserId = new Map<string, { name: string | null; email: string | null }>();

  if (userIds.length > 0) {
    const { data: accounts } = await client
      .from('accounts')
      .select('id, name, email')
      .in('id', userIds);

    for (const account of accounts ?? []) {
      accountsByUserId.set(account.id, {
        name: account.name,
        email: account.email,
      });
    }
  }

  return rows.map((row) => {
    const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    const account = accountsByUserId.get(row.submitted_by_user_id);

    return {
      id: row.id,
      school_id: row.school_id,
      school_name: school?.name ?? '—',
      school_slug: school?.slug ?? '—',
      contact_name: row.contact_name,
      phone: row.phone,
      campus_count: row.campus_count,
      notes: row.notes,
      status: row.status,
      submitter_name: account?.name ?? null,
      submitter_email: account?.email ?? null,
      created_at: row.created_at,
    };
  });
}
