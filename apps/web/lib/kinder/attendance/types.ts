import type { Database } from '~/lib/database.types';

export type AttendanceRecord =
  Database['public']['Tables']['attendance_records']['Row'];

export type LeaveRequest =
  Database['public']['Tables']['leave_requests']['Row'];

export type AttendanceStatus = Database['public']['Enums']['attendance_status'];

export type LeaveRequestWithStudent = LeaveRequest & {
  student: {
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  };
};

export type ClassRosterStudent = {
  studentId: string;
  fullName: string;
  studentCode: string;
  record: AttendanceRecord | null;
};

export type AttendanceMonthlySummary = {
  month: string;
  classId: string | null;
  className: string | null;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  earlyLeaveCount: number;
  attendanceRate: number;
};
