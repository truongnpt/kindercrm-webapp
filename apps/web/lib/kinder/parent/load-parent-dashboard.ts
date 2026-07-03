import 'server-only';

import { cache } from 'react';

import type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';
import { loadParentDailyReports } from '~/lib/kinder/daily-reports/load-daily-reports';

import {
  loadParentLinksForUser,
  loadParentStudentAttendance,
  loadParentStudentDetail,
  loadParentStudentInvoices,
} from './load-parent';
import type { ParentChildSummary, ParentHomeroomTeacher } from './types';

export type ParentChildDashboardSummary = {
  child: ParentChildSummary;
  todayAttendance: {
    attendance_date: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
  } | null;
  latestReport: StudentDailyReport | null;
  unpaidBalance: number;
  unpaidInvoiceCount: number;
  homeroomTeacher: ParentHomeroomTeacher | null;
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export const loadParentDashboardSummaries = cache(async (userId: string) => {
  const children = await loadParentLinksForUser(userId);
  const today = getTodayDateString();

  return Promise.all(
    children.map(async (child) => {
      const [attendance, reports, invoices, studentDetail] = await Promise.all([
        loadParentStudentAttendance(userId, child.studentId, 14),
        loadParentDailyReports(userId, child.studentId, 3),
        loadParentStudentInvoices(userId, child.studentId),
        loadParentStudentDetail(userId, child.studentId),
      ]);

      const todayAttendance =
        attendance.find((row) => row.attendance_date === today) ?? null;
      const latestReport = reports[0] ?? null;
      const unpaidInvoices = invoices.filter(
        (invoice) => invoice.total_amount > invoice.paid_amount,
      );
      const unpaidBalance = unpaidInvoices.reduce(
        (sum, invoice) =>
          sum + (invoice.total_amount - invoice.paid_amount),
        0,
      );

      return {
        child,
        todayAttendance,
        latestReport,
        unpaidBalance,
        unpaidInvoiceCount: unpaidInvoices.length,
        homeroomTeacher: studentDetail.homeroomTeacher,
      } satisfies ParentChildDashboardSummary;
    }),
  );
});
