export {
  ALL_PERMISSIONS,
  ALL_STAFF_PERMISSIONS,
  ALL_CRM_PERMISSIONS,
  ALL_STUDENTS_PERMISSIONS,
  ALL_CLASSES_PERMISSIONS,
  ALL_REPORTS_PERMISSIONS,
  ALL_SETTINGS_PERMISSIONS,
  ALL_CALENDAR_PERMISSIONS,
  ALL_COMMUNICATION_PERMISSIONS,
  CALENDAR_PERMISSIONS,
  COMMUNICATION_PERMISSIONS,
  CONFIGURABLE_ROLES,
  CRM_PERMISSIONS,
  CLASSES_PERMISSIONS,
  PERMISSION_GROUPS,
  REPORTS_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  STAFF_PERMISSIONS,
  STUDENTS_PERMISSIONS,
  SYSTEM_CONFIGURABLE_ROLES,
  type ConfigurableRole,
  type KinderPermission,
  type StaffPermission,
} from './permission-keys';

export {
  KINDER_MODULE_REGISTRY,
  getModuleByPath,
  type KinderModuleDefinition,
} from './module-registry';

export {
  SCHOOL_ROLE_DEFINITIONS,
  LEGACY_STAFF_MEMBER_ROLES,
  isLegacyStaffMemberRole,
  isStaffAppRole,
  resolveMatrixRoleForMember,
  type LegacyStaffMemberRole,
} from './role-model';

export {
  buildMatrixRoles,
  getMatrixRoleKey,
  parseAccessRoleKey,
  toAccessRoleKey,
  type MatrixRole,
} from './matrix-roles';

export {
  DEFAULT_ROLE_PERMISSIONS,
  buildDefaultSchoolRolePermissionRows,
  getDefaultPermissionsForRole,
  isConfigurableRole,
} from './role-defaults';

export {
  loadMemberPermissions,
  loadSchoolPermissionMatrix,
  loadSchoolRolePermissions,
  resolveMemberPermissions,
} from './load-permissions';

export { loadSchoolCustomRoles } from './load-custom-roles';

export {
  assertModuleAccessFromContext,
  assertPermissionOrThrow,
  hasModulePermission,
} from './module-access.server';

export {
  assertPermission,
  assertPermissionFromContext,
} from './assert-permission.server';

export { hasAnyPermission, hasPermission } from './check-permission';

export {
  createSchoolCustomRoleAction,
  deleteSchoolCustomRoleAction,
  updateSchoolPermissionsAction,
} from './server-actions';

export {
  buildStaffModulePermissions,
  type StaffModulePermissions,
} from './staff-module-permissions';

export type {
  ResolvedSchoolPermissions,
  SchoolCustomRole,
  SchoolPermissionMatrix,
  SchoolRolePermissionRow,
} from './types';
