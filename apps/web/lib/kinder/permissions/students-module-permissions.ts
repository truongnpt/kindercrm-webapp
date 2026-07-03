import type { KinderPermission } from './permission-keys';
import { STUDENTS_PERMISSIONS } from './permission-keys';
import { hasPermission } from './check-permission';

export interface StudentsModulePermissions {
  canViewDirectory: boolean;
  canManageDirectory: boolean;
  canViewContracts: boolean;
  canManageContracts: boolean;
}

export function buildStudentsModulePermissions(
  permissions: ReadonlySet<KinderPermission>,
): StudentsModulePermissions {
  return {
    canViewDirectory: hasPermission(
      permissions,
      STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
    ),
    canManageDirectory: hasPermission(
      permissions,
      STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
    ),
    canViewContracts: hasPermission(
      permissions,
      STUDENTS_PERMISSIONS.CONTRACTS_VIEW,
    ),
    canManageContracts: hasPermission(
      permissions,
      STUDENTS_PERMISSIONS.CONTRACTS_MANAGE,
    ),
  };
}
