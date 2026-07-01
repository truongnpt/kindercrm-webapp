import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

const DEFAULT_LEAD_SOURCES = [
  { code: 'facebook', name: 'Facebook', sort_order: 0 },
  { code: 'website', name: 'Website', sort_order: 1 },
  { code: 'walk_in', name: 'Đến trực tiếp', sort_order: 2 },
  { code: 'referral', name: 'Giới thiệu', sort_order: 3 },
  { code: 'hotline', name: 'Hotline', sort_order: 4 },
] as const;

export async function seedDefaultLeadSources(
  client: SupabaseClient<Database>,
  schoolId: string,
) {
  await client.from('lead_sources').upsert(
    DEFAULT_LEAD_SOURCES.map((source) => ({
      school_id: schoolId,
      code: source.code,
      name: source.name,
      sort_order: source.sort_order,
      is_active: true,
    })),
    { onConflict: 'school_id,code' },
  );
}
