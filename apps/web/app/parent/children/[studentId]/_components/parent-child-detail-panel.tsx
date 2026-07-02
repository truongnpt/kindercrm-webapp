'use client';

import { BarChart3, CalendarCheck2, CreditCard, HeartPulse } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  DataTableCard,
  PanelEmpty,
  StatCard,
  StatusBadge,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
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
  defaultTab,
}: {
  student: {
    id: string;
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
  defaultTab: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(
      `${pathsConfig.parent.child}/${student.id}?${params.toString()}`,
    );
  };

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.total_amount > invoice.paid_amount,
  ).length;
  const attendancePresent = attendance.filter((row) =>
    ['present', 'late', 'early_leave'].includes(row.status),
  ).length;

  return (
    <div className="space-y-4">
      <BentoGrid columns={3}>
        <StatCard
          icon={BarChart3}
          labelKey="kinder:parent.stats.reports"
          tone="default"
          value={String(dailyReports.length)}
        />
        <StatCard
          icon={CalendarCheck2}
          labelKey="kinder:parent.stats.attendancePresent"
          tone="success"
          value={String(attendancePresent)}
        />
        <StatCard
          icon={CreditCard}
          labelKey="kinder:parent.stats.unpaidInvoices"
          tone="warning"
          value={String(unpaidInvoices)}
        />
      </BentoGrid>

      <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <BentoTileHeader
            className="mb-0 border-0 pb-0"
            description={
              <span className="text-sm">
                <span className="font-mono">{student.student_code}</span>
                {' · '}
                <Trans i18nKey="kinder:students.className" />
                : {student.class_name ?? '—'}
              </span>
            }
            title={<Trans i18nKey="kinder:parent.childWorkspaceTitle" />}
          />
        </div>

        <TabbedModule
          className="min-w-0 gap-0 p-4 sm:p-6"
          defaultValue={defaultTab}
          onValueChange={setTab}
          value={activeTab}
        >
          <TabbedModuleList className="mb-4 flex-wrap">
            <TabbedModuleTrigger value="reports">
              <BarChart3 className="mr-2 size-4" />
              <Trans i18nKey="kinder:parent.tabs.reports" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="attendance">
              <CalendarCheck2 className="mr-2 size-4" />
              <Trans i18nKey="kinder:parent.tabs.attendance" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="finance">
              <CreditCard className="mr-2 size-4" />
              <Trans i18nKey="kinder:parent.tabs.finance" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="health">
              <HeartPulse className="mr-2 size-4" />
              <Trans i18nKey="kinder:parent.tabs.health" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

        <TabbedModuleContent value="reports">
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
                    <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                      <Trans i18nKey="kinder:dailyReports.tabs.media" />
                    </p>
                    <ParentDailyReportMedia attachments={attachments} />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </TabbedModuleContent>

        <TabbedModuleContent value="attendance">
          {attendance.length === 0 ? (
            <PanelEmpty messageKey="kinder:parent.attendance.empty" />
          ) : (
            <DataTableCard
              description={<Trans i18nKey="kinder:parent.attendanceHint" />}
              title={<Trans i18nKey="kinder:parent.tabs.attendance" />}
            >
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
                        <StatusBadge
                          tone={
                            row.status === 'present'
                              ? 'success'
                              : row.status === 'late'
                                ? 'warning'
                                : row.status === 'absent'
                                  ? 'danger'
                                  : 'default'
                          }
                        >
                          <Trans
                            i18nKey={`kinder:attendance.statuses.${row.status}`}
                          />
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          )}
        </TabbedModuleContent>

        <TabbedModuleContent value="finance">
          {invoices.length === 0 ? (
            <PanelEmpty messageKey="kinder:parent.finance.empty" />
          ) : (
            <DataTableCard
              description={<Trans i18nKey="kinder:parent.financeHint" />}
              title={<Trans i18nKey="kinder:parent.tabs.finance" />}
            >
              <div className="space-y-3">
                {invoices.map((invoice) => {
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
                })}
              </div>
            </DataTableCard>
          )}
        </TabbedModuleContent>

        <TabbedModuleContent value="health">
          <ParentHealthPanel
            allergies={health.allergies}
            growth={health.growth}
            incidents={health.incidents}
            medical={health.medical}
            medications={health.medications}
            vaccinations={health.vaccinations}
          />
        </TabbedModuleContent>
      </TabbedModule>
      </BentoTile>
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
