import 'server-only';

import { cache } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import {
  resolveEffectivePackage,
  shouldBlockSchoolMutations,
} from '~/lib/kinder/subscription/package-features';
import type { Package, SchoolContext, SchoolSubscription } from '~/lib/kinder/types';

import { requireSchoolContext } from '../tenant/get-school-context';

export const loadFreePackage = cache(
  async (client: SupabaseClient<Database>): Promise<Package | null> => {
    const { data, error } = await client
      .from('packages')
      .select('*')
      .eq('code', 'free')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as Package | null) ?? null;
  },
);

export function resolveSchoolEffectivePackage(
  billedPackage: Package | null | undefined,
  subscription: SchoolSubscription | null | undefined,
  freePackage: Package | null | undefined,
) {
  return resolveEffectivePackage(billedPackage, subscription, freePackage);
}

export function assertSubscriptionWritable(context: SchoolContext) {
  if (shouldBlockSchoolMutations(context)) {
    throw new KinderError(
      KINDER_ERROR_CODES.SUBSCRIPTION_READ_ONLY,
      'School subscription is read-only',
    );
  }
}

export async function requireWritableSchoolContext(userId: string) {
  const context = await requireSchoolContext(userId);
  assertSubscriptionWritable(context);
  return context;
}
