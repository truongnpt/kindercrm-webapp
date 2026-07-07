export type SchoolStatus = 'active' | 'suspended' | 'archived';
export type SchoolMemberRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'staff'
  | 'teacher'
  | 'accountant'
  | 'parent';
export type CampusType = 'campus' | 'branch';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled';

/** UI-facing status; may differ from DB when trial has ended but row is still `trial`. */
export type SubscriptionDisplayStatus = SubscriptionStatus | 'trial_expired';

export interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_primary_color: string | null;
  custom_domain: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
}

export interface Campus {
  id: string;
  school_id: string;
  parent_campus_id: string | null;
  campus_type: CampusType;
  name: string;
  address: string | null;
  phone: string | null;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  role: SchoolMemberRole;
}

export interface Package {
  id: string;
  code: string;
  name: string;
  description: string | null;
  max_students: number;
  max_campuses: number;
  max_storage_mb: number;
  ai_credits_monthly: number;
  features: Record<string, boolean>;
  price_monthly: number;
  price_yearly?: number;
  sort_order: number;
  is_active: boolean;
  stripe_price_id?: string | null;
  stripe_price_yearly_id?: string | null;
}

export interface SchoolSubscription {
  id: string;
  school_id: string;
  package_id: string;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  past_due_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  package?: Package;
}

export interface SchoolContext {
  school: School;
  role: SchoolMemberRole;
  customRoleId: string | null;
  subscription: SchoolSubscription | null;
  /** Billed package on the subscription row (for display / billing). */
  package: Package | null;
  /** Package used for feature gating and quotas (may be free when cancelled / grace expired). */
  effectivePackage: Package | null;
}
