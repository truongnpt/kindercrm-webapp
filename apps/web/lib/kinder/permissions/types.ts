import type { KinderPermission } from './permission-keys';
import type { ConfigurableRole } from './permission-keys';

export interface SchoolCustomRole {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SchoolRolePermissionRow {
  roleKey: string;
  permission: KinderPermission;
  granted: boolean;
  role?: ConfigurableRole;
  customRoleId?: string;
}

export interface SchoolPermissionMatrix {
  schoolId: string;
  rows: SchoolRolePermissionRow[];
  customRoles: SchoolCustomRole[];
}

export interface ResolvedSchoolPermissions {
  roleKey: string;
  permissions: ReadonlySet<KinderPermission>;
}
