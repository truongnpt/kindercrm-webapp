/**
 * Canonical permission keys for Kinder CRM.
 * Format: `{module}.{resource}.{action}`
 *
 * Layering:
 * - Package features (`package-features.ts`) → module on/off per subscription
 * - School permissions (this file) → role/custom-role access within a school
 * - Parent portal → separate RLS; no keys here
 */
export const STAFF_PERMISSIONS = {
  DIRECTORY_VIEW: 'staff.directory.view',
  DIRECTORY_CREATE: 'staff.directory.create',
  DIRECTORY_UPDATE: 'staff.directory.update',
  DIRECTORY_DELETE: 'staff.directory.delete',
  SETUP_MANAGE: 'staff.setup.manage',
  CONTRACTS_VIEW: 'staff.contracts.view',
  CONTRACTS_MANAGE: 'staff.contracts.manage',
  CLASSES_VIEW: 'staff.classes.view',
  CLASSES_MANAGE: 'staff.classes.manage',
  ACCESS_MANAGE: 'staff.access.manage',
  PERMISSIONS_MANAGE: 'staff.permissions.manage',
  ATTENDANCE_VIEW: 'staff.attendance.view',
  ATTENDANCE_MANAGE: 'staff.attendance.manage',
  LEAVE_VIEW: 'staff.leave.view',
  LEAVE_MANAGE: 'staff.leave.manage',
  DOCUMENTS_VIEW: 'staff.documents.view',
  DOCUMENTS_MANAGE: 'staff.documents.manage',
} as const;

export const CRM_PERMISSIONS = {
  LEADS_VIEW: 'crm.leads.view',
  LEADS_MANAGE: 'crm.leads.manage',
} as const;

export const STUDENTS_PERMISSIONS = {
  DIRECTORY_VIEW: 'students.students.view',
  DIRECTORY_MANAGE: 'students.students.manage',
  CONTRACTS_VIEW: 'students.contracts.view',
  CONTRACTS_MANAGE: 'students.contracts.manage',
} as const;

export const CLASSES_PERMISSIONS = {
  DIRECTORY_VIEW: 'classes.classes.view',
  DIRECTORY_MANAGE: 'classes.classes.manage',
} as const;

export const REPORTS_PERMISSIONS = {
  VIEW: 'reports.reports.view',
} as const;

export const SETTINGS_PERMISSIONS = {
  SCHOOL_MANAGE: 'settings.school.manage',
  SUBSCRIPTION_MANAGE: 'settings.subscription.manage',
} as const;

export const CALENDAR_PERMISSIONS = {
  EVENTS_VIEW: 'calendar.events.view',
  EVENTS_MANAGE: 'calendar.events.manage',
} as const;

export const COMMUNICATION_PERMISSIONS = {
  MESSAGES_VIEW: 'communication.messages.view',
  MESSAGES_MANAGE: 'communication.messages.manage',
} as const;

export type CommunicationPermission =
  (typeof COMMUNICATION_PERMISSIONS)[keyof typeof COMMUNICATION_PERMISSIONS];

export type StaffPermission =
  (typeof STAFF_PERMISSIONS)[keyof typeof STAFF_PERMISSIONS];

export type CrmPermission =
  (typeof CRM_PERMISSIONS)[keyof typeof CRM_PERMISSIONS];

export type StudentsPermission =
  (typeof STUDENTS_PERMISSIONS)[keyof typeof STUDENTS_PERMISSIONS];

export type ClassesPermission =
  (typeof CLASSES_PERMISSIONS)[keyof typeof CLASSES_PERMISSIONS];

export type ReportsPermission =
  (typeof REPORTS_PERMISSIONS)[keyof typeof REPORTS_PERMISSIONS];

export type SettingsPermission =
  (typeof SETTINGS_PERMISSIONS)[keyof typeof SETTINGS_PERMISSIONS];

export type CalendarPermission =
  (typeof CALENDAR_PERMISSIONS)[keyof typeof CALENDAR_PERMISSIONS];

export type KinderPermission =
  | StaffPermission
  | CrmPermission
  | StudentsPermission
  | ClassesPermission
  | ReportsPermission
  | SettingsPermission
  | CalendarPermission
  | CommunicationPermission;

export const ALL_STAFF_PERMISSIONS = Object.values(
  STAFF_PERMISSIONS,
) as StaffPermission[];

export const ALL_CRM_PERMISSIONS = Object.values(
  CRM_PERMISSIONS,
) as CrmPermission[];

export const ALL_STUDENTS_PERMISSIONS = Object.values(
  STUDENTS_PERMISSIONS,
) as StudentsPermission[];

export const ALL_CLASSES_PERMISSIONS = Object.values(
  CLASSES_PERMISSIONS,
) as ClassesPermission[];

export const ALL_REPORTS_PERMISSIONS = Object.values(
  REPORTS_PERMISSIONS,
) as ReportsPermission[];

export const ALL_SETTINGS_PERMISSIONS = Object.values(
  SETTINGS_PERMISSIONS,
) as SettingsPermission[];

export const ALL_CALENDAR_PERMISSIONS = Object.values(
  CALENDAR_PERMISSIONS,
) as CalendarPermission[];

export const ALL_COMMUNICATION_PERMISSIONS = Object.values(
  COMMUNICATION_PERMISSIONS,
) as CommunicationPermission[];

export const ALL_PERMISSIONS = [
  ...ALL_STAFF_PERMISSIONS,
  ...ALL_CRM_PERMISSIONS,
  ...ALL_STUDENTS_PERMISSIONS,
  ...ALL_CLASSES_PERMISSIONS,
  ...ALL_REPORTS_PERMISSIONS,
  ...ALL_SETTINGS_PERMISSIONS,
  ...ALL_CALENDAR_PERMISSIONS,
  ...ALL_COMMUNICATION_PERMISSIONS,
] as KinderPermission[];

export const PERMISSION_GROUPS = [
  {
    id: 'staff',
    labelKey: 'kinder:permissions.groups.staff',
    permissions: [
      {
        key: STAFF_PERMISSIONS.DIRECTORY_VIEW,
        labelKey: 'kinder:permissions.staff.directoryView',
      },
      {
        key: STAFF_PERMISSIONS.DIRECTORY_CREATE,
        labelKey: 'kinder:permissions.staff.directoryCreate',
      },
      {
        key: STAFF_PERMISSIONS.DIRECTORY_UPDATE,
        labelKey: 'kinder:permissions.staff.directoryUpdate',
      },
      {
        key: STAFF_PERMISSIONS.DIRECTORY_DELETE,
        labelKey: 'kinder:permissions.staff.directoryDelete',
      },
      {
        key: STAFF_PERMISSIONS.SETUP_MANAGE,
        labelKey: 'kinder:permissions.staff.setupManage',
      },
      {
        key: STAFF_PERMISSIONS.CONTRACTS_VIEW,
        labelKey: 'kinder:permissions.staff.contractsView',
      },
      {
        key: STAFF_PERMISSIONS.CONTRACTS_MANAGE,
        labelKey: 'kinder:permissions.staff.contractsManage',
      },
      {
        key: STAFF_PERMISSIONS.CLASSES_VIEW,
        labelKey: 'kinder:permissions.staff.classesView',
      },
      {
        key: STAFF_PERMISSIONS.CLASSES_MANAGE,
        labelKey: 'kinder:permissions.staff.classesManage',
      },
      {
        key: STAFF_PERMISSIONS.ACCESS_MANAGE,
        labelKey: 'kinder:permissions.staff.accessManage',
      },
      {
        key: STAFF_PERMISSIONS.PERMISSIONS_MANAGE,
        labelKey: 'kinder:permissions.staff.permissionsManage',
      },
      {
        key: STAFF_PERMISSIONS.ATTENDANCE_VIEW,
        labelKey: 'kinder:permissions.staff.attendanceView',
      },
      {
        key: STAFF_PERMISSIONS.ATTENDANCE_MANAGE,
        labelKey: 'kinder:permissions.staff.attendanceManage',
      },
      {
        key: STAFF_PERMISSIONS.LEAVE_VIEW,
        labelKey: 'kinder:permissions.staff.leaveView',
      },
      {
        key: STAFF_PERMISSIONS.LEAVE_MANAGE,
        labelKey: 'kinder:permissions.staff.leaveManage',
      },
      {
        key: STAFF_PERMISSIONS.DOCUMENTS_VIEW,
        labelKey: 'kinder:permissions.staff.documentsView',
      },
      {
        key: STAFF_PERMISSIONS.DOCUMENTS_MANAGE,
        labelKey: 'kinder:permissions.staff.documentsManage',
      },
    ],
  },
  {
    id: 'crm',
    labelKey: 'kinder:permissions.groups.crm',
    permissions: [
      {
        key: CRM_PERMISSIONS.LEADS_VIEW,
        labelKey: 'kinder:permissions.crm.leadsView',
      },
      {
        key: CRM_PERMISSIONS.LEADS_MANAGE,
        labelKey: 'kinder:permissions.crm.leadsManage',
      },
    ],
  },
  {
    id: 'students',
    labelKey: 'kinder:permissions.groups.students',
    permissions: [
      {
        key: STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
        labelKey: 'kinder:permissions.students.directoryView',
      },
      {
        key: STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
        labelKey: 'kinder:permissions.students.directoryManage',
      },
      {
        key: STUDENTS_PERMISSIONS.CONTRACTS_VIEW,
        labelKey: 'kinder:permissions.students.contractsView',
      },
      {
        key: STUDENTS_PERMISSIONS.CONTRACTS_MANAGE,
        labelKey: 'kinder:permissions.students.contractsManage',
      },
    ],
  },
  {
    id: 'classes',
    labelKey: 'kinder:permissions.groups.classes',
    permissions: [
      {
        key: CLASSES_PERMISSIONS.DIRECTORY_VIEW,
        labelKey: 'kinder:permissions.classes.directoryView',
      },
      {
        key: CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
        labelKey: 'kinder:permissions.classes.directoryManage',
      },
    ],
  },
  {
    id: 'reports',
    labelKey: 'kinder:permissions.groups.reports',
    permissions: [
      {
        key: REPORTS_PERMISSIONS.VIEW,
        labelKey: 'kinder:permissions.reports.view',
      },
    ],
  },
  {
    id: 'settings',
    labelKey: 'kinder:permissions.groups.settings',
    permissions: [
      {
        key: SETTINGS_PERMISSIONS.SCHOOL_MANAGE,
        labelKey: 'kinder:permissions.settings.schoolManage',
      },
      {
        key: SETTINGS_PERMISSIONS.SUBSCRIPTION_MANAGE,
        labelKey: 'kinder:permissions.settings.subscriptionManage',
      },
    ],
  },
  {
    id: 'calendar',
    labelKey: 'kinder:permissions.groups.calendar',
    permissions: [
      {
        key: CALENDAR_PERMISSIONS.EVENTS_VIEW,
        labelKey: 'kinder:permissions.calendar.eventsView',
      },
      {
        key: CALENDAR_PERMISSIONS.EVENTS_MANAGE,
        labelKey: 'kinder:permissions.calendar.eventsManage',
      },
    ],
  },
  {
    id: 'communication',
    labelKey: 'kinder:permissions.groups.communication',
    permissions: [
      {
        key: COMMUNICATION_PERMISSIONS.MESSAGES_VIEW,
        labelKey: 'kinder:permissions.communication.messagesView',
      },
      {
        key: COMMUNICATION_PERMISSIONS.MESSAGES_MANAGE,
        labelKey: 'kinder:permissions.communication.messagesManage',
      },
    ],
  },
] as const;

/** Roles configurable in the school permission matrix (owner = implicit full access). */
export const SYSTEM_CONFIGURABLE_ROLES = [
  'admin',
  'manager',
  'staff',
] as const;

/** @deprecated Use SYSTEM_CONFIGURABLE_ROLES */
export const CONFIGURABLE_ROLES = SYSTEM_CONFIGURABLE_ROLES;

export type ConfigurableRole = (typeof SYSTEM_CONFIGURABLE_ROLES)[number];
