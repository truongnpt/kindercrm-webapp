import { notFound } from 'next/navigation';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import {
  loadParentLeaveRequests,
  loadParentStudentAttendance,
  loadParentStudentDetail,
  loadParentStudentInvoicePayments,
  loadParentStudentInvoices,
  loadParentStudentProfile,
} from '~/lib/kinder/parent/load-parent';
import { loadParentDailyReports } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentDailyReportAttachments } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentStudentHealth } from '~/lib/kinder/health/load-health';
import { getVietQrConfig } from '~/lib/kinder/finance/vietqr';
import {
  loadParentPublishedMenu,
  loadParentPublishedMenuWeek,
} from '~/lib/kinder/meal-menu/load-meal-menu';

import { ParentChildDetailPanel } from './_components/parent-child-detail-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:parent.childDetail'),
  };
};

function getWeekStart(date = new Date()) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);

  monday.setDate(date.getDate() + diff);

  return monday.toISOString().slice(0, 10);
}

async function ParentChildPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { studentId } = await params;
  const { tab } = await searchParams;
  const user = await requireUserInServerComponent();
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = getWeekStart();

  let student;

  try {
    student = await loadParentStudentProfile(user.id, studentId);
  } catch {
    notFound();
  }

  const [
    attendance,
    invoices,
    payments,
    dailyReports,
    health,
    leaveRequests,
    studentDetail,
    todayMenu,
    weekMenus,
  ] = await Promise.all([
    loadParentStudentAttendance(user.id, studentId),
    loadParentStudentInvoices(user.id, studentId),
    loadParentStudentInvoicePayments(user.id, studentId),
    loadParentDailyReports(user.id, studentId),
    loadParentStudentHealth(student.school_id, studentId),
    loadParentLeaveRequests(user.id, studentId),
    loadParentStudentDetail(user.id, studentId),
    loadParentPublishedMenu(student.school_id, today),
    loadParentPublishedMenuWeek(student.school_id, weekStart),
  ]);

  const dailyReportsWithMedia = await Promise.all(
    dailyReports.map(async (report) => ({
      report,
      attachments: await loadParentDailyReportAttachments(report.id),
    })),
  );

  return (
    <ParentChildDetailPanel
      attendance={attendance}
      dailyReports={dailyReportsWithMedia}
      defaultTab={tab ?? 'reports'}
      health={health}
      invoices={invoices}
      leaveRequests={leaveRequests}
      payments={payments}
      student={student}
      studentDetail={studentDetail}
      todayMenu={todayMenu}
      vietQrConfig={getVietQrConfig()}
      weekMenus={weekMenus}
    />
  );
}

export default withI18n(ParentChildPage);
