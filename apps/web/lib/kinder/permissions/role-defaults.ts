import type { SchoolMemberRole } from '~/lib/kinder/types';

import {
  ALL_PERMISSIONS,
  type ConfigurableRole,
  SYSTEM_CONFIGURABLE_ROLES,
  CALENDAR_PERMISSIONS,
  CLASSES_PERMISSIONS,
  CRM_PERMISSIONS,
  REPORTS_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  STAFF_PERMISSIONS,
  STUDENTS_PERMISSIONS,
  type KinderPermission,
} from './permission-keys';
import {
  isLegacyStaffMemberRole,
  resolveMatrixRoleForMember,
} from './role-model';

const ADMIN_PERMISSIONS: KinderPermission[] = [...ALL_PERMISSIONS];

const MANAGER_PERMISSIONS: KinderPermission[] = [
  // Enrollment & students
  CRM_PERMISSIONS.LEADS_VIEW,
  CRM_PERMISSIONS.LEADS_MANAGE,
  STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
  STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
  STUDENTS_PERMISSIONS.CONTRACTS_VIEW,
  STUDENTS_PERMISSIONS.CONTRACTS_MANAGE,
  // Classes & daily ops
  CLASSES_PERMISSIONS.DIRECTORY_VIEW,
  CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
  // Staff visibility (teachers / assignments)
  STAFF_PERMISSIONS.DIRECTORY_VIEW,
  STAFF_PERMISSIONS.CLASSES_VIEW,
  STAFF_PERMISSIONS.CLASSES_MANAGE,
  STAFF_PERMISSIONS.CONTRACTS_VIEW,
  STAFF_PERMISSIONS.ATTENDANCE_VIEW,
  STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
  STAFF_PERMISSIONS.LEAVE_VIEW,
  STAFF_PERMISSIONS.LEAVE_MANAGE,
  STAFF_PERMISSIONS.DOCUMENTS_VIEW,
  // Reporting
  REPORTS_PERMISSIONS.VIEW,
  // Calendar
  CALENDAR_PERMISSIONS.EVENTS_VIEW,
  CALENDAR_PERMISSIONS.EVENTS_MANAGE,
];

/** Minimal base for staff — extend via custom roles or matrix overrides. */
const STAFF_ROLE_PERMISSIONS: KinderPermission[] = [
  STAFF_PERMISSIONS.DIRECTORY_VIEW,
  STAFF_PERMISSIONS.ATTENDANCE_VIEW,
  STAFF_PERMISSIONS.LEAVE_VIEW,
];

/** Legacy presets folded into staff + custom roles. */
const LEGACY_TEACHER_PERMISSIONS: KinderPermission[] = [
  STAFF_PERMISSIONS.DIRECTORY_VIEW,
  STAFF_PERMISSIONS.CLASSES_VIEW,
  STAFF_PERMISSIONS.ATTENDANCE_VIEW,
  STAFF_PERMISSIONS.LEAVE_VIEW,
  CLASSES_PERMISSIONS.DIRECTORY_VIEW,
  STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
  STUDENTS_PERMISSIONS.CONTRACTS_VIEW,
  CALENDAR_PERMISSIONS.EVENTS_VIEW,
];

const LEGACY_ACCOUNTANT_PERMISSIONS: KinderPermission[] = [
  STAFF_PERMISSIONS.DIRECTORY_VIEW,
  STAFF_PERMISSIONS.CONTRACTS_VIEW,
  STAFF_PERMISSIONS.DOCUMENTS_VIEW,
  STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
  STUDENTS_PERMISSIONS.CONTRACTS_VIEW,
  STUDENTS_PERMISSIONS.CONTRACTS_MANAGE,
];

export const DEFAULT_ROLE_PERMISSIONS: Record<
  ConfigurableRole,
  readonly KinderPermission[]
> = {
  admin: ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  staff: STAFF_ROLE_PERMISSIONS,
};

const LEGACY_ROLE_DEFAULTS: Record<
  'teacher' | 'accountant',
  readonly KinderPermission[]
> = {
  teacher: LEGACY_TEACHER_PERMISSIONS,
  accountant: LEGACY_ACCOUNTANT_PERMISSIONS,
};

export function getDefaultPermissionsForRole(
  role: SchoolMemberRole,
): ReadonlySet<KinderPermission> {
  if (role === 'owner') {
    return new Set(ALL_PERMISSIONS);
  }

  if (role === 'parent') {
    return new Set();
  }

  if (isLegacyStaffMemberRole(role)) {
    return new Set(LEGACY_ROLE_DEFAULTS[role]);
  }

  const matrixRole = resolveMatrixRoleForMember(role);

  if (matrixRole && matrixRole in DEFAULT_ROLE_PERMISSIONS) {
    return new Set(DEFAULT_ROLE_PERMISSIONS[matrixRole]);
  }

  return new Set();
}

export function isConfigurableRole(
  role: SchoolMemberRole,
): role is ConfigurableRole {
  return (SYSTEM_CONFIGURABLE_ROLES as readonly string[]).includes(role);
}

export function buildDefaultSchoolRolePermissionRows(schoolId: string) {
  return SYSTEM_CONFIGURABLE_ROLES.flatMap((role) =>
    ALL_PERMISSIONS.map((permission) => ({
      school_id: schoolId,
      role,
      permission,
      granted: DEFAULT_ROLE_PERMISSIONS[role].includes(permission),
    })),
  );
}
