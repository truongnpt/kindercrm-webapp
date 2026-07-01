import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { loadFinanceSummary } from '~/lib/kinder/finance/load-finance';
import { LEAD_STAGES } from '~/lib/kinder/crm/pipeline-stages';

export type DashboardSummary = {
  totalStudents: number;
  activeStudents: number;
  activeClasses: number;
  totalLeads: number;
  leadsByStage: Record<string, number>;
  revenueThisMonth: number;
  outstandingDebt: number;
  invoicesThisMonth: number;
  attendanceToday: {
    present: number;
    absent: number;
    total: number;
    rate: number;
  };
  pendingLeaveRequests: number;
};

export const loadDashboardSummary = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    students,
    activeStudents,
    activeClasses,
    leads,
    leaveRequests,
    attendanceToday,
    finance,
  ] = await Promise.all([
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .is('deleted_at', null),
    client
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active'),
    client.from('leads').select('stage').eq('school_id', schoolId),
    client
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'pending'),
    client
      .from('attendance_records')
      .select('status')
      .eq('school_id', schoolId)
      .eq('attendance_date', today),
    loadFinanceSummary(schoolId),
  ]);

  const leadsByStage = Object.fromEntries(
    LEAD_STAGES.map((stage) => [stage, 0]),
  ) as Record<string, number>;

  for (const lead of leads.data ?? []) {
    leadsByStage[lead.stage] = (leadsByStage[lead.stage] ?? 0) + 1;
  }

  const attendanceRows = attendanceToday.data ?? [];
  const present = attendanceRows.filter(
    (row) => row.status === 'present' || row.status === 'late',
  ).length;
  const absent = attendanceRows.filter(
    (row) => row.status === 'absent',
  ).length;
  const totalAttendance = attendanceRows.length;

  return {
    totalStudents: students.count ?? 0,
    activeStudents: activeStudents.count ?? 0,
    activeClasses: activeClasses.count ?? 0,
    totalLeads: leads.data?.length ?? 0,
    leadsByStage,
    revenueThisMonth: finance.revenueThisMonth,
    outstandingDebt: finance.outstandingDebt,
    invoicesThisMonth: finance.invoicesThisMonth,
    attendanceToday: {
      present,
      absent,
      total: totalAttendance,
      rate:
        totalAttendance > 0
          ? Math.round((present / totalAttendance) * 100)
          : 0,
    },
    pendingLeaveRequests: leaveRequests.count ?? 0,
  } satisfies DashboardSummary;
});
