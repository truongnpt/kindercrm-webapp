import type { KinderPermission } from './permission-keys';
import { STAFF_PERMISSIONS } from './permission-keys';
import { hasPermission } from './check-permission';

export interface StaffModulePermissions {
  canViewDirectory: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageSetup: boolean;
  canViewContracts: boolean;
  canManageContracts: boolean;
  canViewClasses: boolean;
  canManageClasses: boolean;
  canManageAccess: boolean;
  canManagePermissions: boolean;
  canViewAttendance: boolean;
  canManageAttendance: boolean;
  canViewLeave: boolean;
  canManageLeave: boolean;
  canViewDocuments: boolean;
  canManageDocuments: boolean;
  /** Any write action on staff records */
  canManageDirectory: boolean;
  /** Show setup / permissions nav links */
  canAccessAdminSections: boolean;
  /** Show attendance / leave / reports nav links */
  canAccessHrSections: boolean;
}

export function buildStaffModulePermissions(
  permissions: ReadonlySet<KinderPermission>,
): StaffModulePermissions {
  const canCreate = hasPermission(permissions, STAFF_PERMISSIONS.DIRECTORY_CREATE);
  const canUpdate = hasPermission(permissions, STAFF_PERMISSIONS.DIRECTORY_UPDATE);
  const canDelete = hasPermission(permissions, STAFF_PERMISSIONS.DIRECTORY_DELETE);
  const canManageSetup = hasPermission(permissions, STAFF_PERMISSIONS.SETUP_MANAGE);
  const canManagePermissions = hasPermission(
    permissions,
    STAFF_PERMISSIONS.PERMISSIONS_MANAGE,
  );
  const canViewAttendance = hasPermission(
    permissions,
    STAFF_PERMISSIONS.ATTENDANCE_VIEW,
  );
  const canManageAttendance = hasPermission(
    permissions,
    STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
  );
  const canViewLeave = hasPermission(permissions, STAFF_PERMISSIONS.LEAVE_VIEW);
  const canManageLeave = hasPermission(permissions, STAFF_PERMISSIONS.LEAVE_MANAGE);
  const canViewDocuments = hasPermission(
    permissions,
    STAFF_PERMISSIONS.DOCUMENTS_VIEW,
  );
  const canManageDocuments = hasPermission(
    permissions,
    STAFF_PERMISSIONS.DOCUMENTS_MANAGE,
  );

  return {
    canViewDirectory: hasPermission(
      permissions,
      STAFF_PERMISSIONS.DIRECTORY_VIEW,
    ),
    canCreate,
    canUpdate,
    canDelete,
    canManageSetup,
    canViewContracts: hasPermission(
      permissions,
      STAFF_PERMISSIONS.CONTRACTS_VIEW,
    ),
    canManageContracts: hasPermission(
      permissions,
      STAFF_PERMISSIONS.CONTRACTS_MANAGE,
    ),
    canViewClasses: hasPermission(permissions, STAFF_PERMISSIONS.CLASSES_VIEW),
    canManageClasses: hasPermission(
      permissions,
      STAFF_PERMISSIONS.CLASSES_MANAGE,
    ),
    canManageAccess: hasPermission(permissions, STAFF_PERMISSIONS.ACCESS_MANAGE),
    canManagePermissions,
    canViewAttendance,
    canManageAttendance,
    canViewLeave,
    canManageLeave,
    canViewDocuments,
    canManageDocuments,
    canManageDirectory: canCreate || canUpdate || canDelete,
    canAccessAdminSections: canManageSetup || canManagePermissions,
    canAccessHrSections:
      canViewAttendance ||
      canViewLeave ||
      hasPermission(permissions, STAFF_PERMISSIONS.CONTRACTS_VIEW),
  };
}
