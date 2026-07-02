import type { KinderPermission } from './permission-keys';

export function hasPermission(
  permissions: ReadonlySet<KinderPermission>,
  permission: KinderPermission,
) {
  return permissions.has(permission);
}

export function hasAnyPermission(
  permissions: ReadonlySet<KinderPermission>,
  required: readonly KinderPermission[],
) {
  return required.some((permission) => permissions.has(permission));
}
