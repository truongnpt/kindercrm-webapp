import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { DemoRequestListItem } from './types';

export async function loadDemoRequests(): Promise<DemoRequestListItem[]> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('demo_requests')
    .select(
      'id, school_name, email, phone, message, status, reviewed_at, reviewed_by_user_id, review_note, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    throw error;
  }

  return (data ?? []) as DemoRequestListItem[];
}
