import type { SchoolMemberRole } from '~/lib/kinder/types';

import type { ConfigurableRole } from './permission-keys';

/**
 * Production role taxonomy for Kinder CRM.
 *
 * | Role    | App area        | Permission source                    |
 * |---------|-----------------|--------------------------------------|
 * | owner   | /app (full)     | Implicit all permissions             |
 * | admin   | /app (full)     | Matrix column `admin` (all grants)   |
 * | manager | /app (ops)      | Matrix column `manager`              |
 * | staff   | /app (scoped)   | Matrix column `staff` + custom role|
 * | parent  | /parent only    | Parent portal RLS (not in matrix)    |
 *
 * Legacy enum values `teacher` and `accountant` are mapped to `staff`
 * defaults until migrated. Use custom roles (HR, Kế toán, ...) for presets.
 */
export const SCHOOL_ROLE_DEFINITIONS = {
  owner: {
    id: 'owner',
    labelKey: 'kinder:permissions.roles.owner',
    descriptionKey: 'kinder:permissions.roleDescriptions.owner',
    portal: 'app',
    configurable: false,
  },
  admin: {
    id: 'admin',
    labelKey: 'kinder:permissions.roles.admin',
    descriptionKey: 'kinder:permissions.roleDescriptions.admin',
    portal: 'app',
    configurable: true,
  },
  manager: {
    id: 'manager',
    labelKey: 'kinder:permissions.roles.manager',
    descriptionKey: 'kinder:permissions.roleDescriptions.manager',
    portal: 'app',
    configurable: true,
  },
  staff: {
    id: 'staff',
    labelKey: 'kinder:permissions.roles.staff',
    descriptionKey: 'kinder:permissions.roleDescriptions.staff',
    portal: 'app',
    configurable: true,
  },
  parent: {
    id: 'parent',
    labelKey: 'kinder:permissions.roles.parent',
    descriptionKey: 'kinder:permissions.roleDescriptions.parent',
    portal: 'parent',
    configurable: false,
  },
} as const;

/** @deprecated Legacy roles kept for DB compatibility — resolve via staff defaults. */
export const LEGACY_STAFF_MEMBER_ROLES = ['teacher', 'accountant'] as const;

export type LegacyStaffMemberRole =
  (typeof LEGACY_STAFF_MEMBER_ROLES)[number];

export function isLegacyStaffMemberRole(
  role: SchoolMemberRole,
): role is LegacyStaffMemberRole {
  return (LEGACY_STAFF_MEMBER_ROLES as readonly string[]).includes(role);
}

/** Maps legacy DB roles to the staff matrix column for permission resolution. */
export function resolveMatrixRoleForMember(
  role: SchoolMemberRole,
): ConfigurableRole | null {
  if (role === 'admin' || role === 'manager' || role === 'staff') {
    return role;
  }

  if (isLegacyStaffMemberRole(role)) {
    return 'staff';
  }

  return null;
}

export function isStaffAppRole(role: SchoolMemberRole) {
  return role !== 'parent';
}
