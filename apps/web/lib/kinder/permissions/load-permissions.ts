import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { SchoolMemberRole } from '~/lib/kinder/types';

import { loadSchoolCustomRoles } from './load-custom-roles';
import {
  getMatrixRoleKey,
  type MatrixRole,
  SYSTEM_CONFIGURABLE_ROLES,
  buildMatrixRoles,
} from './matrix-roles';
import {
  ALL_PERMISSIONS,
  type ConfigurableRole,
  type KinderPermission,
} from './permission-keys';
import {
  DEFAULT_ROLE_PERMISSIONS,
  getDefaultPermissionsForRole,
  isConfigurableRole,
} from './role-defaults';
import {
  isLegacyStaffMemberRole,
  resolveMatrixRoleForMember,
} from './role-model';
import type { SchoolPermissionMatrix, SchoolRolePermissionRow } from './types';

export const loadSchoolRolePermissions = cache(
  async (schoolId: string): Promise<SchoolRolePermissionRow[]> => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('school_role_permissions')
      .select('role, custom_role_id, permission, granted')
      .eq('school_id', schoolId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => {
      const roleKey = row.custom_role_id
        ? `custom:${row.custom_role_id}`
        : (row.role as string);

      return {
        roleKey,
        role: row.role ? (row.role as ConfigurableRole) : undefined,
        customRoleId: row.custom_role_id ?? undefined,
        permission: row.permission as KinderPermission,
        granted: row.granted,
      };
    });
  },
);

function applyMatrixRows(
  matrixRole: ConfigurableRole,
  schoolRows: SchoolRolePermissionRow[],
  fallback: ReadonlySet<KinderPermission>,
) {
  const roleRows = schoolRows.filter((row) => row.role === matrixRole);
  const rowMap = new Map(
    roleRows.map((row) => [row.permission, row.granted] as const),
  );
  const permissions = new Set<KinderPermission>();

  for (const permission of ALL_PERMISSIONS) {
    if (rowMap.has(permission)) {
      if (rowMap.get(permission)) {
        permissions.add(permission);
      }
    } else if (fallback.has(permission)) {
      permissions.add(permission);
    }
  }

  return permissions;
}

export function resolveMemberPermissions(
  role: SchoolMemberRole,
  schoolRows: SchoolRolePermissionRow[],
  customRoleId?: string | null,
): ReadonlySet<KinderPermission> {
  if (role === 'owner') {
    return new Set(ALL_PERMISSIONS);
  }

  if (role === 'parent') {
    return new Set();
  }

  if (customRoleId) {
    const roleRows = schoolRows.filter(
      (row) => row.customRoleId === customRoleId,
    );
    const permissions = new Set<KinderPermission>();

    for (const permission of ALL_PERMISSIONS) {
      const match = roleRows.find((row) => row.permission === permission);

      if (match?.granted) {
        permissions.add(permission);
      }
    }

    return permissions;
  }

  if (isLegacyStaffMemberRole(role)) {
    const legacyRows = schoolRows.filter((row) => row.role === role);
    const fallback = getDefaultPermissionsForRole(role);

    if (legacyRows.length === 0) {
      return fallback;
    }

    return applyMatrixRows('staff', schoolRows, fallback);
  }

  const matrixRole = resolveMatrixRoleForMember(role);

  if (!matrixRole || !isConfigurableRole(matrixRole)) {
    return new Set();
  }

  const fallback = getDefaultPermissionsForRole(matrixRole);

  return applyMatrixRows(matrixRole, schoolRows, fallback);
}

function resolveGrantedForMatrixRole(
  matrixRole: MatrixRole,
  permission: KinderPermission,
  rows: SchoolRolePermissionRow[],
) {
  const roleKey = getMatrixRoleKey(matrixRole);
  const match = rows.find(
    (row) => row.roleKey === roleKey && row.permission === permission,
  );

  if (match) {
    return match.granted;
  }

  if (matrixRole.kind === 'system') {
    return DEFAULT_ROLE_PERMISSIONS[matrixRole.role].includes(permission);
  }

  return false;
}

export function buildMatrixPermissionRows(
  schoolId: string,
  customRoles: Awaited<ReturnType<typeof loadSchoolCustomRoles>>,
  storedRows: SchoolRolePermissionRow[],
): SchoolRolePermissionRow[] {
  const matrixRoles = buildMatrixRoles(customRoles);

  return matrixRoles.flatMap((matrixRole) =>
    ALL_PERMISSIONS.map((permission) => ({
      roleKey: getMatrixRoleKey(matrixRole),
      role:
        matrixRole.kind === 'system' ? matrixRole.role : undefined,
      customRoleId: matrixRole.kind === 'custom' ? matrixRole.id : undefined,
      permission,
      granted: resolveGrantedForMatrixRole(matrixRole, permission, storedRows),
    })),
  );
}

export const loadSchoolPermissionMatrix = cache(
  async (schoolId: string): Promise<SchoolPermissionMatrix> => {
    const [storedRows, customRoles] = await Promise.all([
      loadSchoolRolePermissions(schoolId),
      loadSchoolCustomRoles(schoolId),
    ]);

    return {
      schoolId,
      customRoles,
      rows: buildMatrixPermissionRows(schoolId, customRoles, storedRows),
    };
  },
);

export const loadMemberPermissions = cache(
  async (
    schoolId: string,
    role: SchoolMemberRole,
    customRoleId?: string | null,
  ): Promise<ReadonlySet<KinderPermission>> => {
    const rows = await loadSchoolRolePermissions(schoolId);

    return resolveMemberPermissions(role, rows, customRoleId);
  },
);

export { SYSTEM_CONFIGURABLE_ROLES };
