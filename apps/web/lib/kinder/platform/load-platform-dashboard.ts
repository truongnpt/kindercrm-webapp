import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { PlatformDashboardSummary } from './types';

export async function loadPlatformDashboardSummary(): Promise<PlatformDashboardSummary> {
  const client = getPlatformDataClient();

  const [{ count: totalSchools }, { count: activeSchools }, { count: suspendedSchools }, { count: trialSchools }] =
    await Promise.all([
      client
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null),
      client
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('deleted_at', null),
      client
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'suspended')
        .is('deleted_at', null),
      client
        .from('school_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'trial'),
    ]);

  return {
    totalSchools: totalSchools ?? 0,
    activeSchools: activeSchools ?? 0,
    suspendedSchools: suspendedSchools ?? 0,
    trialSchools: trialSchools ?? 0,
  };
}
