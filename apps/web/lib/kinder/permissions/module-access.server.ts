import 'server-only';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import type { SchoolContext } from '~/lib/kinder/types';

import { assertPermissionFromContext } from './assert-permission.server';
import { hasPermission } from './check-permission';
import { getModuleByPath } from './module-registry';
import type { KinderPermission } from './permission-keys';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { assertSubscriptionWritable } from '~/lib/kinder/subscription/subscription-access.server';

export async function assertModuleAccessFromContext(
  context: SchoolContext,
  path: string,
  mode: 'view' | 'manage' = 'view',
) {
  const module = getModuleByPath(path);

  if (!module) {
    return;
  }

  requirePackageFeature(context, module.packageFeature);

  if (mode === 'manage') {
    assertSubscriptionWritable(context);
  }

  const permission =
    mode === 'manage' && module.managePermission ?
      module.managePermission
    : module.viewPermission;

  await assertPermissionFromContext(context, permission);
}

export function hasModulePermission(
  permissions: ReadonlySet<KinderPermission>,
  permission: KinderPermission,
) {
  return hasPermission(permissions, permission);
}

export async function assertPermissionOrThrow(
  context: SchoolContext,
  permission: KinderPermission,
) {
  try {
    await assertPermissionFromContext(context, permission);
  } catch {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      `Missing permission: ${permission}`,
    );
  }
}
