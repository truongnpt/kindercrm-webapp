'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { acknowledgeDailyReportAction } from '~/lib/kinder/daily-reports/server-actions';
import type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';
import type { DailyReportAttachment } from '~/lib/kinder/daily-reports/types';

import { ParentDailyReportMedia } from './parent-daily-report-media';
import { ParentHealthPanel } from './parent-health-panel';

type AttendanceRow = {
  attendance_date: string;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  billing_period: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
};

import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedication,
  HealthVaccination,
} from '~/lib/kinder/health/types';

export function ParentChildDetailPanel({
  student,
  attendance,
  invoices,
  dailyReports,
  health,
}: {
  student: {
    full_name: string;
    student_code: string;
    class_name: string | null;
    date_of_birth: string | null;
    status: string;
  };
  attendance: AttendanceRow[];
  invoices: InvoiceRow[];
  dailyReports: Array<{
    report: StudentDailyReport;
    attachments: DailyReportAttachment[];
  }>;
  health: {
    medical: {
      blood_type: string | null;
      conditions: string | null;
      medications: string | null;
      doctor_name: string | null;
      doctor_phone: string | null;
    } | null;
    allergies: Array<{ allergen: string; severity: string | null }>;
    vaccinations: HealthVaccination[];
    growth: HealthGrowthRecord[];
    medications: HealthMedication[];
    incidents: HealthIncident[];
  };
}) {
  return (
    <div className="space-y-4">
      <div className="kinder-surface p-4">
        <p className="font-mono text-xs">{student.student_code}</p>
        <p className="mt-1 text-lg font-semibold">{student.full_name}</p>
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:students.className" />:{' '}
          {student.class_name ?? '—'}
        </p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="kinder-tab-list">
          <TabsTrigger className="kinder-tab-trigger" value="reports">
            <Trans i18nKey="kinder:parent.tabs.reports" />
          </TabsTrigger>
          <TabsTrigger className="kinder-tab-trigger" value="attendance">
            <Trans i18nKey="kinder:parent.tabs.attendance" />
          </TabsTrigger>
          <TabsTrigger className="kinder-tab-trigger" value="finance">
            <Trans i18nKey="kinder:parent.tabs.finance" />
          </TabsTrigger>
          <TabsTrigger className="kinder-tab-trigger" value="health">
            <Trans i18nKey="kinder:parent.tabs.health" />
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4 space-y-3" value="reports">
          {dailyReports.length === 0 ? (
            <PanelEmpty messageKey="kinder:parent.reports.empty" />
          ) : (
            dailyReports.map(({ report, attachments }) => (
              <div className="kinder-mobile-card text-sm" key={report.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{report.report_date}</p>
                  {report.parent_acknowledged_at ? (
                    <Badge variant="secondary">
                      <Trans i18nKey="kinder:dailyReports.acknowledged" />
                    </Badge>
                  ) : (
                    <AcknowledgeButton reportId={report.id} />
                  )}
                </div>
                {report.daily_summary ? (
                  <p className="mt-2 font-medium">{report.daily_summary}</p>
                ) : null}
                {report.mood ? (
                  <p>
                    <Trans i18nKey="kinder:parent.reports.mood" />: {report.mood}
                  </p>
                ) : null}
                {report.meals ? (
                  <p>
                    <Trans i18nKey="kinder:parent.reports.meals" />: {report.meals}
                  </p>
                ) : null}
                {report.nap ? (
                  <p>
                    <Trans i18nKey="kinder:parent.reports.nap" />: {report.nap}
                  </p>
                ) : null}
                {report.activities ? (
                  <p>
                    <Trans i18nKey="kinder:parent.reports.activities" />:{' '}
                    {report.activities}
                  </p>
                ) : null}
                {report.teacher_note ? (
                  <p className="text-muted-foreground mt-2">{report.teacher_note}</p>
                ) : null}
                {attachments.length > 0 ? (
                  <div className="mt-3">
                    <ParentDailyReportMedia attachments={attachments} />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent className="mt-4" value="attendance">
          {attendance.length === 0 ? (
            <PanelEmpty messageKey="kinder:parent.attendance.empty" />
          ) : (
            <DataTableShell>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Trans i18nKey="kinder:attendance.date" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Trans i18nKey="kinder:attendance.status" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row) => (
                    <tr key={row.attendance_date}>
                      <td className="px-4 py-3">{row.attendance_date}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          <Trans
                            i18nKey={`kinder:attendance.statuses.${row.status}`}
                          />
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableShell>
          )}
        </TabsContent>

        <TabsContent className="mt-4 space-y-3" value="finance">
          {invoices.length === 0 ? (
            <PanelEmpty messageKey="kinder:parent.finance.empty" />
          ) : (
            invoices.map((invoice) => {
              const balance = invoice.total_amount - invoice.paid_amount;

              return (
                <div className="kinder-mobile-card text-sm" key={invoice.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs">{invoice.invoice_number}</p>
                    <Badge>
                      <Trans
                        i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
                      />
                    </Badge>
                  </div>
                  <p className="mt-2">
                    {invoice.billing_period} · {formatVnd(invoice.total_amount)}
                  </p>
                  {balance > 0 ? (
                    <p className="text-muted-foreground">
                      <Trans i18nKey="kinder:finance.debts.balance" />:{' '}
                      {formatVnd(balance)}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent className="mt-4" value="health">
          <ParentHealthPanel
            allergies={health.allergies}
            growth={health.growth}
            incidents={health.incidents}
            medical={health.medical}
            medications={health.medications}
            vaccinations={health.vaccinations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AcknowledgeButton({ reportId }: { reportId: string }) {
  const { t } = useTranslation('kinder');

  return (
    <Button
      onClick={async () => {
        const promise = acknowledgeDailyReportAction({ reportId });
        toast.promise(promise, {
          loading: t('schoolSettings.saving'),
          success: t('dailyReports.acknowledged'),
          error: t('common:genericServerError', { ns: 'common' }),
        });
        await promise;
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      <Trans i18nKey="kinder:dailyReports.acknowledge" />
    </Button>
  );
}
