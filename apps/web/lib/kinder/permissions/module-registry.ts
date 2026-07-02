import pathsConfig from '~/config/paths.config';

import type { PackageFeature } from '~/lib/kinder/subscription/package-features';

import type { KinderPermission } from './permission-keys';
import {
  CLASSES_PERMISSIONS,
  CRM_PERMISSIONS,
  REPORTS_PERMISSIONS,
  SETTINGS_PERMISSIONS,
  STAFF_PERMISSIONS,
  STUDENTS_PERMISSIONS,
} from './permission-keys';

export interface KinderModuleDefinition {
  id: string;
  labelKey: string;
  path: string;
  packageFeature: PackageFeature;
  viewPermission: KinderPermission;
  managePermission?: KinderPermission;
}

/**
 * Maps app modules → subscription feature → minimum school permission.
 * Package feature gates the module; permission gates actions inside it.
 */
export const KINDER_MODULE_REGISTRY: KinderModuleDefinition[] = [
  {
    id: 'dashboard',
    labelKey: 'common:routes.dashboard',
    path: pathsConfig.app.home,
    packageFeature: 'crm',
    viewPermission: CRM_PERMISSIONS.LEADS_VIEW,
  },
  {
    id: 'crm',
    labelKey: 'common:routes.crm',
    path: pathsConfig.app.crm,
    packageFeature: 'crm',
    viewPermission: CRM_PERMISSIONS.LEADS_VIEW,
    managePermission: CRM_PERMISSIONS.LEADS_MANAGE,
  },
  {
    id: 'students',
    labelKey: 'common:routes.students',
    path: pathsConfig.app.students,
    packageFeature: 'students',
    viewPermission: STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'classes',
    labelKey: 'common:routes.classes',
    path: pathsConfig.app.classes,
    packageFeature: 'classes',
    viewPermission: CLASSES_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'attendance',
    labelKey: 'common:routes.attendance',
    path: pathsConfig.app.attendance,
    packageFeature: 'attendance',
    viewPermission: CLASSES_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'daily_reports',
    labelKey: 'common:routes.dailyReports',
    path: pathsConfig.app.dailyReports,
    packageFeature: 'daily_reports',
    viewPermission: CLASSES_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: CLASSES_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'menu',
    labelKey: 'common:routes.menu',
    path: pathsConfig.app.menu,
    packageFeature: 'meal_menu',
    viewPermission: CLASSES_PERMISSIONS.DIRECTORY_VIEW,
  },
  {
    id: 'health',
    labelKey: 'common:routes.health',
    path: pathsConfig.app.health,
    packageFeature: 'health_management',
    viewPermission: STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'finance',
    labelKey: 'common:routes.finance',
    path: pathsConfig.app.finance,
    packageFeature: 'finance',
    viewPermission: STUDENTS_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: STUDENTS_PERMISSIONS.DIRECTORY_MANAGE,
  },
  {
    id: 'inventory',
    labelKey: 'common:routes.inventory',
    path: pathsConfig.app.inventory,
    packageFeature: 'inventory',
    viewPermission: REPORTS_PERMISSIONS.VIEW,
  },
  {
    id: 'staff',
    labelKey: 'common:routes.staff',
    path: pathsConfig.app.staff,
    packageFeature: 'staff',
    viewPermission: STAFF_PERMISSIONS.DIRECTORY_VIEW,
    managePermission: STAFF_PERMISSIONS.DIRECTORY_UPDATE,
  },
  {
    id: 'ai',
    labelKey: 'common:routes.ai',
    path: pathsConfig.app.ai,
    packageFeature: 'ai_assistant',
    viewPermission: REPORTS_PERMISSIONS.VIEW,
  },
  {
    id: 'settings_school',
    labelKey: 'kinder:settings.school.title',
    path: pathsConfig.app.settingsSchool,
    packageFeature: 'crm',
    viewPermission: SETTINGS_PERMISSIONS.SCHOOL_MANAGE,
    managePermission: SETTINGS_PERMISSIONS.SCHOOL_MANAGE,
  },
  {
    id: 'settings_campuses',
    labelKey: 'common:routes.campuses',
    path: pathsConfig.app.settingsCampuses,
    packageFeature: 'crm',
    viewPermission: SETTINGS_PERMISSIONS.SCHOOL_MANAGE,
    managePermission: SETTINGS_PERMISSIONS.SCHOOL_MANAGE,
  },
  {
    id: 'settings_subscription',
    labelKey: 'kinder:subscription.title',
    path: pathsConfig.app.settingsSubscription,
    packageFeature: 'crm',
    viewPermission: SETTINGS_PERMISSIONS.SUBSCRIPTION_MANAGE,
    managePermission: SETTINGS_PERMISSIONS.SUBSCRIPTION_MANAGE,
  },
];

export function getModuleByPath(path: string) {
  return KINDER_MODULE_REGISTRY.find((module) => module.path === path);
}
