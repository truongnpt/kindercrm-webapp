export type SchoolPaymentMethodType = 'cash' | 'bank_transfer' | 'qr_banking';

export type PaymentAccountStatus = 'active' | 'inactive';

export type SchoolPaymentMethod = {
  id: string;
  school_id: string;
  method: SchoolPaymentMethodType;
  is_enabled: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentAccount = {
  id: string;
  school_id: string;
  campus_id: string | null;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  branch: string | null;
  logo_url: string | null;
  is_default: boolean;
  status: PaymentAccountStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentInstructions = {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentAuditLog = {
  id: string;
  school_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};

export type PaymentSettingsBundle = {
  methods: SchoolPaymentMethod[];
  accounts: PaymentAccount[];
  instructions: PaymentInstructions | null;
  auditLogs: PaymentAuditLog[];
};
