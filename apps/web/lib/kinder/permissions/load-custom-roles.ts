import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { SchoolCustomRole } from './types';

export const loadSchoolCustomRoles = cache(
  async (schoolId: string): Promise<SchoolCustomRole[]> => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('school_custom_roles')
      .select(
        'id, school_id, name, slug, description, sort_order, is_active',
      )
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('sort_order')
      .order('name');

    if (error) {
      throw error;
    }

    return (data ?? []) as SchoolCustomRole[];
  },
);
