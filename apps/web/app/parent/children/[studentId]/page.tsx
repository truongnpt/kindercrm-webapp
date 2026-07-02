import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import {
  loadParentStudentAttendance,
  loadParentStudentInvoices,
  loadParentStudentProfile,
} from '~/lib/kinder/parent/load-parent';
import { loadParentDailyReports } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentDailyReportAttachments } from '~/lib/kinder/daily-reports/load-daily-reports';
import { loadParentStudentHealth } from '~/lib/kinder/health/load-health';

import { ParentChildDetailPanel } from './_components/parent-child-detail-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:parent.childDetail'),
  };
};

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

  let student;

  try {
    student = await loadParentStudentProfile(user.id, studentId);
  } catch {
    notFound();
  }

  const [attendance, invoices, dailyReports, health] = await Promise.all([
    loadParentStudentAttendance(user.id, studentId),
    loadParentStudentInvoices(user.id, studentId),
    loadParentDailyReports(user.id, studentId),
    loadParentStudentHealth(student.school_id, studentId),
  ]);

  const dailyReportsWithMedia = await Promise.all(
    dailyReports.map(async (report) => ({
      report,
      attachments: await loadParentDailyReportAttachments(report.id),
    })),
  );

  return (
    <>
      <PageHeader title={student.full_name} />

      <PageBody>
        <ParentChildDetailPanel
          attendance={attendance}
          defaultTab={tab ?? 'reports'}
          dailyReports={dailyReportsWithMedia}
          health={health}
          invoices={invoices}
          student={student}
        />
      </PageBody>
    </>
  );
}

export default withI18n(ParentChildPage);
