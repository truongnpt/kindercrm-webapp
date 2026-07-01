import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

import type { Json } from '~/lib/database.types';

export async function logPlatformAction(params: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const client = getPlatformDataClient();

  const { error } = await client.from('platform_audit_logs').insert({
    actor_user_id: params.actorUserId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    metadata: (params.metadata ?? {}) as Json,
  });

  if (error) {
    console.error('[platform-audit]', error);
  }
}
