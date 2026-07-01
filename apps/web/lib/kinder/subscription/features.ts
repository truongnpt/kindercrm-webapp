import 'server-only';

import { cache } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import type { Package, SchoolContext } from '~/lib/kinder/types';

export type PackageFeature =
  | 'crm'
  | 'students'
  | 'classes'
  | 'finance'
  | 'finance_basic'
  | 'attendance'
  | 'staff'
  | 'parent_portal'
  | 'daily_reports'
  | 'meal_menu'
  | 'inventory'
  | 'health_management'
  | 'reports'
  | 'ai_assistant';

export function hasPackageFeature(
  pkg: Package | null | undefined,
  feature: PackageFeature,
) {
  if (!pkg) {
    return false;
  }

  const features = pkg.features as Record<string, boolean>;

  if (features.all) {
    return true;
  }

  if (feature === 'finance' && features.finance_basic) {
    return true;
  }

  return Boolean(features[feature]);
}

export function requirePackageFeature(
  context: SchoolContext,
  feature: PackageFeature,
) {
  if (!hasPackageFeature(context.package, feature)) {
    throw new Error(`Feature "${feature}" is not available on your plan`);
  }
}

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
