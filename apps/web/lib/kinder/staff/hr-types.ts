export type StaffLeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type StaffLeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type StaffDocumentType =
  | 'id_card'
  | 'degree'
  | 'certificate'
  | 'contract'
  | 'other';
export type StaffAttendanceSource = 'check_in' | 'manual';

export type StaffAttendance = {
  id: string;
  school_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  total_minutes: number | null;
  is_late: boolean;
  is_early_leave: boolean;
  source: StaffAttendanceSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffAttendanceWithEmployee = StaffAttendance & {
  employee: {
    id: string;
    full_name: string;
    employee_code: string;
    department: { name: string } | null;
  };
};

export type StaffLeaveRequest = {
  id: string;
  school_id: string;
  employee_id: string;
  leave_type: StaffLeaveType;
  status: StaffLeaveStatus;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffLeaveRequestWithEmployee = StaffLeaveRequest & {
  employee: {
    id: string;
    full_name: string;
    employee_code: string;
    department: { name: string } | null;
  };
};

export type StaffDocument = {
  id: string;
  school_id: string;
  employee_id: string;
  document_type: StaffDocumentType;
  title: string;
  file_url: string;
  file_name: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffHrAlert = {
  id: string;
  type:
    | 'contract_expiring'
    | 'birthday'
    | 'leave_pending'
    | 'attendance_anomaly';
  titleKey: string;
  descriptionKey: string;
  values?: Record<string, string | number>;
  href?: string;
  tone: 'warning' | 'info' | 'destructive';
};

export type StaffHrReportSummary = {
  totalEmployees: number;
  activeEmployees: number;
  byDepartment: Array<{ name: string; count: number }>;
  attendanceToday: {
    checkedIn: number;
    late: number;
    absent: number;
  };
  leavePending: number;
  contractsExpiringSoon: number;
};
