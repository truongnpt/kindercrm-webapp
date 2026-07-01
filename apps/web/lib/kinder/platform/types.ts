import type { SchoolStatus } from '~/lib/kinder/types';

export type PlatformAdminRole = 'super_admin' | 'support' | 'billing';

export interface PlatformAdminContext {
  id: string;
  role: PlatformAdminRole;
}

export interface PlatformDashboardSummary {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  trialSchools: number;
}

export interface PlatformSchoolListItem {
  id: string;
  name: string;
  slug: string;
  status: SchoolStatus;
  email: string | null;
  phone: string | null;
  created_at: string;
  package_name: string | null;
  subscription_status: string | null;
  student_count: number;
  campus_count: number;
}

export interface PlatformSchoolDetail extends PlatformSchoolListItem {
  address: string | null;
  trial_ends_at: string | null;
  owner_email: string | null;
  owner_name: string | null;
  package_id: string | null;
  subscription_id: string | null;
}

export interface PlatformAdminListItem {
  id: string;
  user_id: string;
  role: PlatformAdminRole;
  is_active: boolean;
  granted_at: string;
  revoked_at: string | null;
  notes: string | null;
  name: string | null;
  email: string | null;
}

export interface PlatformAuditLogItem {
  id: string;
  actor_user_id: string;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
