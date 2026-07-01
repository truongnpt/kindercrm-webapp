import 'server-only';

import { cache } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import type { Package } from '~/lib/kinder/types';

export {
  hasPackageFeature,
  PACKAGE_FEATURE_KEYS,
  requirePackageFeature,
  type PackageFeature,
} from '~/lib/kinder/subscription/package-features';

export const loadPublicPackages = cache(async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    throw error;
  }

  return (data ?? []) as Package[];
});

export const loadSubscriptionHistory = cache(
  async (client: SupabaseClient<Database>, schoolId: string) => {
    const { data, error } = await client
      .from('school_subscription_history')
      .select('id, status, note, created_at, package_id, previous_package_id')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);
