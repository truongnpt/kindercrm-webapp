import 'server-only';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import type { SchoolContext } from '~/lib/kinder/types';

import { hasPermission } from './check-permission';
import { loadMemberPermissions } from './load-permissions';
import type { KinderPermission } from './permission-keys';

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
