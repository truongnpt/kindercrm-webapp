import { notFound } from 'next/navigation';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import {
  loadParentLeaveRequests,
  loadParentStudentAttendance,
  loadParentStudentContracts,
  loadParentStudentDetail,
  loadParentStudentInvoicePayments,
  loadParentStudentInvoices,
  loadParentStudentProfile,
} from '~/lib/kinder/parent/load-parent';
import { loadParentDailyReports } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentDailyReportAttachments } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentStudentHealth } from '~/lib/kinder/health/load-health';
import { getVietQrConfig } from '~/lib/kinder/finance/vietqr';
import { loadPaymentSettings } from '~/lib/kinder/payment-settings/load-payment-settings';
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
    contracts,
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
    loadParentStudentContracts(user.id, studentId),
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

  const paymentSettings = await loadPaymentSettings(student.school_id);

  const { data: schoolRow } = await getSupabaseServerClient()
    .from('schools')
    .select('name')
    .eq('id', student.school_id)
    .single();

  const defaultAccount =
    paymentSettings.accounts.find(
      (account) => account.is_default && account.status === 'active',
    ) ?? paymentSettings.accounts.find((account) => account.status === 'active');

  const vietQrConfig =
    defaultAccount ?
      {
        bankBin: defaultAccount.bank_code,
        accountNo: defaultAccount.account_number,
        accountName: defaultAccount.account_name,
      }
    : getVietQrConfig();

  return (
    <ParentChildDetailPanel
      attendance={attendance}
      contracts={contracts}
      dailyReports={dailyReportsWithMedia}
      defaultTab={tab ?? 'reports'}
      health={health}
      invoices={invoices}
      leaveRequests={leaveRequests}
      paymentInstructions={paymentSettings.instructions}
      payments={payments}
      schoolId={student.school_id}
      schoolName={schoolRow?.name ?? ''}
      student={student}
      studentDetail={studentDetail}
      todayMenu={todayMenu}
      vietQrConfig={vietQrConfig}
      weekMenus={weekMenus}
    />
  );
}

export default withI18n(ParentChildPage);
