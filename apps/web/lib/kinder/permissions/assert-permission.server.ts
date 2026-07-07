import 'server-only';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { assertSubscriptionWritable } from '~/lib/kinder/subscription/subscription-access.server';
import type { SchoolContext } from '~/lib/kinder/types';

import { hasPermission } from './check-permission';
import { loadMemberPermissions } from './load-permissions';
import { SETTINGS_PERMISSIONS } from './permission-keys';
import type { KinderPermission } from './permission-keys';

const MUTATING_PERMISSION_PATTERN = /\.(manage|create|update|delete)$/;

const SUBSCRIPTION_WRITABLE_EXEMPT = new Set<string>([
  SETTINGS_PERMISSIONS.SUBSCRIPTION_MANAGE,
]);

function isMutatingPermission(permission: KinderPermission) {
  if (SUBSCRIPTION_WRITABLE_EXEMPT.has(permission)) {
    return false;
  }

  return MUTATING_PERMISSION_PATTERN.test(permission);
}

export async function assertPermission(
  schoolId: string,
  _userId: string,
  role: SchoolContext['role'],
  permission: KinderPermission,
  customRoleId?: string | null,
) {
  const permissions = await loadMemberPermissions(
    schoolId,
    role,
    customRoleId,
  );

  if (!hasPermission(permissions, permission)) {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      `Missing permission: ${permission}`,
    );
  }
}

export async function assertPermissionFromContext(
  context: SchoolContext,
  permission: KinderPermission,
) {
  if (isMutatingPermission(permission)) {
    assertSubscriptionWritable(context);
  }

  const permissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );

  if (!hasPermission(permissions, permission)) {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      `Missing permission: ${permission}`,
    );
  }

  return permissions;
}
