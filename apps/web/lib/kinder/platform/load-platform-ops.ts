import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { Package } from '~/lib/kinder/types';

import { FIXED_PACKAGE_CODES } from '~/lib/kinder/subscription/fixed-packages';

import type { PlatformAdminListItem, PlatformAuditLogItem } from './types';

export async function loadPlatformPackages(): Promise<Package[]> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('packages')
    .select('*')
    .in('code', [...FIXED_PACKAGE_CODES])
    .order('sort_order');

  if (error) {
    throw error;
  }

  return (data ?? []) as Package[];
}

export async function loadPlatformAdmins(): Promise<PlatformAdminListItem[]> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('platform_admins')
    .select('id, user_id, role, is_active, granted_at, revoked_at, notes')
    .order('granted_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  const { data: accounts } = await client
    .from('accounts')
    .select('id, name, email')
    .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

  const accountMap = new Map(
    (accounts ?? []).map((account) => [account.id, account]),
  );

  return rows.map((row) => {
    const account = accountMap.get(row.user_id);

    return {
      id: row.id,
      user_id: row.user_id,
      role: row.role as PlatformAdminListItem['role'],
      is_active: row.is_active,
      granted_at: row.granted_at,
      revoked_at: row.revoked_at,
      notes: row.notes,
      name: account?.name ?? null,
      email: account?.email ?? null,
    };
  });
}

export async function loadPlatformAuditLogs(limit = 100): Promise<PlatformAuditLogItem[]> {
  const client = getPlatformDataClient();

  const { data, error } = await client
    .from('platform_audit_logs')
    .select('id, actor_user_id, action, target_type, target_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const actorIds = [...new Set(rows.map((row) => row.actor_user_id))];

  const { data: accounts } = await client
    .from('accounts')
    .select('id, name, email')
    .in('id', actorIds.length > 0 ? actorIds : ['00000000-0000-0000-0000-000000000000']);

  const accountMap = new Map(
    (accounts ?? []).map((account) => [account.id, account]),
  );

  return rows.map((row) => {
    const account = accountMap.get(row.actor_user_id);

    return {
      id: row.id,
      actor_user_id: row.actor_user_id,
      actor_name: account?.name ?? null,
      actor_email: account?.email ?? null,
      action: row.action,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: row.metadata as Record<string, unknown>,
      created_at: row.created_at,
    };
  });
}
