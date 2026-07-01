import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

export async function ensureDefaultSchoolYear(
  client: SupabaseClient<Database>,
  schoolId: string,
) {
  const { data: existing } = await client
    .from('school_years')
    .select('id')
    .eq('school_id', schoolId)
    .limit(1);

  if (existing && existing.length > 0) {
    return;
  }

  const year = new Date().getFullYear();
  const startDate = `${year}-09-01`;
  const endDate = `${year + 1}-05-31`;

  const { data: schoolYear, error } = await client
    .from('school_years')
    .insert({
      school_id: schoolId,
      name: `Năm học ${year}-${year + 1}`,
      start_date: startDate,
      end_date: endDate,
      is_current: true,
    })
    .select('id')
    .single();

  if (error || !schoolYear) {
    throw error ?? new Error('Failed to seed school year');
  }

  await client.from('semesters').insert([
    {
      school_id: schoolId,
      school_year_id: schoolYear.id,
      name: 'Học kỳ 1',
      start_date: startDate,
      end_date: `${year}-12-31`,
      sort_order: 0,
    },
    {
      school_id: schoolId,
      school_year_id: schoolYear.id,
      name: 'Học kỳ 2',
      start_date: `${year + 1}-01-01`,
      end_date: endDate,
      sort_order: 1,
    },
  ]);
}
