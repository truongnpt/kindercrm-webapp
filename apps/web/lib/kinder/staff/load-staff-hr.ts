import 'server-only';

import { cache } from 'react';

import { getHrDbClient } from './hr-db';
import pathsConfig from '~/config/paths.config';

import type {
  StaffAttendanceWithEmployee,
  StaffDocument,
  StaffHrAlert,
  StaffHrReportSummary,
  StaffLeaveRequestWithEmployee,
} from './hr-types';
import type { StaffEmployeeListItem } from './types';

function diffDays(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const diff = endDate.getTime() - startDate.getTime();

  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}

export const loadStaffAttendance = cache(
  async (
    schoolId: string,
    filters?: { date?: string; employeeId?: string },
  ) => {
    const client = getHrDbClient();
    const date = filters?.date ?? new Date().toISOString().slice(0, 10);

    let query = client
      .from('staff_attendance')
      .select(
        `
        *,
        employee:staff_employees!inner (
          id,
          full_name,
          employee_code,
          department:staff_departments (name)
        )
      `,
      )
      .eq('school_id', schoolId)
      .eq('attendance_date', date)
      .order('check_in_at', { ascending: false });

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as StaffAttendanceWithEmployee[];
  },
);

export const loadStaffLeaveRequests = cache(
  async (
    schoolId: string,
    filters?: { status?: string; employeeId?: string },
  ) => {
    const client = getHrDbClient();

    let query = client
      .from('staff_leave_requests')
      .select(
        `
        *,
        employee:staff_employees!inner (
          id,
          full_name,
          employee_code,
          department:staff_departments (name)
        )
      `,
      )
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as StaffLeaveRequestWithEmployee[];
  },
);

export const loadStaffDocuments = cache(
  async (schoolId: string, employeeId: string) => {
    const client = getHrDbClient();

    const { data, error } = await client
      .from('staff_documents')
      .select('*')
      .eq('school_id', schoolId)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as StaffDocument[];
  },
);

export const loadStaffHrAlerts = cache(
  async (schoolId: string, employees: StaffEmployeeListItem[]) => {
    const client = getHrDbClient();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const soon = new Date(today);
    soon.setDate(soon.getDate() + 30);
    const soonStr = soon.toISOString().slice(0, 10);

    const alerts: StaffHrAlert[] = [];

    const [leaveResult, contractsResult] = await Promise.all([
      client
        .from('staff_leave_requests')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'pending'),
      client
        .from('staff_contracts')
        .select('id, title, end_date, employee_id')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .not('end_date', 'is', null)
        .gte('end_date', todayStr)
        .lte('end_date', soonStr),
    ]);

    const pendingLeave = leaveResult.error ? 0 : (leaveResult.count ?? 0);
    const expiringContracts = contractsResult.error ? [] : (contractsResult.data ?? []);

    if ((pendingLeave ?? 0) > 0) {
      alerts.push({
        id: 'leave-pending',
        type: 'leave_pending',
        titleKey: 'kinder:staff.alerts.leavePendingTitle',
        descriptionKey: 'kinder:staff.alerts.leavePendingDescription',
        values: { count: pendingLeave ?? 0 },
        href: pathsConfig.app.staffLeave,
        tone: 'warning',
      });
    }

    for (const contract of expiringContracts ?? []) {
      const employee = employees.find(
        (item) => item.id === contract.employee_id,
      );

      alerts.push({
        id: `contract-${contract.id}`,
        type: 'contract_expiring',
        titleKey: 'kinder:staff.alerts.contractExpiringTitle',
        descriptionKey: 'kinder:staff.alerts.contractExpiringDescription',
        values: {
          name: employee?.full_name ?? '',
          date: contract.end_date ?? '',
        },
        href: employee ?
          `${pathsConfig.app.staffDetail}/${employee.id}`
        : pathsConfig.app.staff,
        tone: 'warning',
      });
    }

    const month = today.getMonth() + 1;
    const day = today.getDate();

    for (const employee of employees) {
      if (!employee.date_of_birth) {
        continue;
      }

      const [, birthMonth, birthDay] = employee.date_of_birth.split('-');

      if (Number(birthMonth) === month && Number(birthDay) === day) {
        alerts.push({
          id: `birthday-${employee.id}`,
          type: 'birthday',
          titleKey: 'kinder:staff.alerts.birthdayTitle',
          descriptionKey: 'kinder:staff.alerts.birthdayDescription',
          values: { name: employee.full_name },
          href: `${pathsConfig.app.staffDetail}/${employee.id}`,
          tone: 'info',
        });
      }
    }

    const { data: todayAttendance, error: attendanceError } = await client
      .from('staff_attendance')
      .select('id, is_late, is_early_leave')
      .eq('school_id', schoolId)
      .eq('attendance_date', todayStr);

    const anomalyCount =
      attendanceError ? 0
      : (todayAttendance as Array<{ is_late: boolean; is_early_leave: boolean }> | null)?.filter(
          (row) => row.is_late || row.is_early_leave,
        ).length ?? 0;

    if (anomalyCount > 0) {
      alerts.push({
        id: 'attendance-anomaly',
        type: 'attendance_anomaly',
        titleKey: 'kinder:staff.alerts.attendanceAnomalyTitle',
        descriptionKey: 'kinder:staff.alerts.attendanceAnomalyDescription',
        values: { count: anomalyCount },
        href: pathsConfig.app.staffAttendance,
        tone: 'destructive',
      });
    }

    return alerts.slice(0, 8);
  },
);

export const loadStaffHrReportSummary = cache(
  async (schoolId: string, employees: StaffEmployeeListItem[]) => {
    const client = getHrDbClient();
    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const soonStr = soon.toISOString().slice(0, 10);

    const activeEmployees = employees.filter(
      (employee) => employee.employment_status === 'active',
    );

    const departmentMap = new Map<string, number>();

    for (const employee of employees) {
      const name = employee.department?.name ?? '—';
      departmentMap.set(name, (departmentMap.get(name) ?? 0) + 1);
    }

    const [attendanceResult, leaveResult, contractsResult] = await Promise.all([
      client
        .from('staff_attendance')
        .select('employee_id, is_late')
        .eq('school_id', schoolId)
        .eq('attendance_date', today),
      client
        .from('staff_leave_requests')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'pending'),
      client
        .from('staff_contracts')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .not('end_date', 'is', null)
        .gte('end_date', today)
        .lte('end_date', soonStr),
    ]);

    const attendance = attendanceResult.error ? [] : (attendanceResult.data ?? []);
    const pendingLeave = leaveResult.error ? 0 : (leaveResult.count ?? 0);
    const expiring = contractsResult.error ? 0 : (contractsResult.count ?? 0);

    const checkedIn = attendance?.length ?? 0;
    const late = (attendance as Array<{ is_late: boolean }> | null)?.filter(
      (row) => row.is_late,
    ).length ?? 0;
    const absent = Math.max(activeEmployees.length - checkedIn, 0);

    const summary: StaffHrReportSummary = {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      byDepartment: [...departmentMap.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      attendanceToday: {
        checkedIn,
        late,
        absent,
      },
      leavePending: pendingLeave ?? 0,
      contractsExpiringSoon: expiring ?? 0,
    };

    return summary;
  },
);

export function calculateLeaveDays(startDate: string, endDate: string) {
  return diffDays(startDate, endDate);
}

export function calculateAttendanceMinutes(
  checkInAt: string | null,
  checkOutAt: string | null,
) {
  if (!checkInAt || !checkOutAt) {
    return null;
  }

  const diff =
    new Date(checkOutAt).getTime() - new Date(checkInAt).getTime();

  return Math.max(0, Math.round(diff / 60000));
}
