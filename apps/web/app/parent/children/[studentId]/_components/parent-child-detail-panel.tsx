'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck2,
  CalendarOff,
  CreditCard,
  HeartPulse,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import {
  ParentChildAvatar,
  ParentEmptyState,
  ParentQuickActions,
  ParentSectionHeader,
} from '~/components/parent-portal';
import { ParentTeacherInfo } from '~/components/parent-portal/parent-teacher-info';
import pathsConfig from '~/config/paths.config';
import type { ParentHomeroomTeacher } from '~/lib/kinder/parent/types';
import { acknowledgeDailyReportAction } from '~/lib/kinder/daily-reports/server-actions';
import type { StudentDailyReport } from '~/lib/kinder/daily-reports/types';
import type { DailyReportAttachment } from '~/lib/kinder/daily-reports/types';
import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
} from '~/lib/kinder/health/types';
import type { VietQrConfig } from '~/lib/kinder/finance/vietqr';
import type { PublishedMenuDay } from '~/lib/kinder/meal-menu/types';

import { ParentDailyReportMedia } from './parent-daily-report-media';
import { ParentFinancePanel } from './parent-finance-panel';
import { ParentHealthPanel } from './parent-health-panel';
import { ParentLeavePanel } from './parent-leave-panel';
import { ParentMealPanel } from './parent-meal-panel';
import { ParentStudentInfoPanel } from './parent-student-info-panel';

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

const tabs = [
  { value: 'reports', icon: BarChart3, labelKey: 'kinder:parent.tabs.reports' },
  {
    value: 'attendance',
    icon: CalendarCheck2,
    labelKey: 'kinder:parent.tabs.attendance',
  },
  {
    value: 'leave',
    icon: CalendarOff,
    labelKey: 'kinder:parent.tabs.leave',
  },
  {
    value: 'meals',
    icon: UtensilsCrossed,
    labelKey: 'kinder:parent.tabs.meals',
  },
  {
    value: 'finance',
    icon: CreditCard,
    labelKey: 'kinder:parent.tabs.finance',
  },
  { value: 'health', icon: HeartPulse, labelKey: 'kinder:parent.tabs.health' },
  { value: 'profile', icon: UserRound, labelKey: 'kinder:parent.tabs.profile' },
] as const;

export function ParentChildDetailPanel({
  student,
  attendance,
  invoices,
  payments,
  dailyReports,
  health,
  leaveRequests,
  todayMenu,
  weekMenus,
  studentDetail,
  vietQrConfig,
  defaultTab,
}: {
  student: {
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
    date_of_birth: string | null;
    status: string;
    photo_url?: string | null;
  };
  attendance: AttendanceRow[];
  invoices: InvoiceRow[];
  payments: Array<{
    id: string;
    invoice_id: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    reference_note: string | null;
    receipt_number: string;
  }>;
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
    checkups: HealthMedicalCheckup[];
  };
  leaveRequests: Array<{
    id: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    created_at: string;
  }>;
  todayMenu: (PublishedMenuDay & { menuTitle: string }) | null;
  weekMenus: Array<{
    menuDate: string;
    menu: (PublishedMenuDay & { menuTitle: string }) | null;
  }>;
  studentDetail: {
    homeroomTeacher: ParentHomeroomTeacher | null;
    homeroomClassName: string | null;
    parents: Array<{
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
      relationship: string | null;
      is_primary: boolean;
    }>;
    pickupPersons: Array<{
      id: string;
      full_name: string;
      phone: string | null;
      relationship: string | null;
    }>;
    emergencyContacts: Array<{
      id: string;
      full_name: string;
      phone: string | null;
      relationship: string | null;
    }>;
  };
  vietQrConfig: VietQrConfig | null;
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
  );
  const presentCount = attendance.filter((row) =>
    ['present', 'late', 'early_leave'].includes(row.status),
  ).length;
  const absentCount = attendance.filter((row) =>
    ['absent', 'excused'].includes(row.status),
  ).length;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        href={pathsConfig.parent.home}
      >
        <ArrowLeft className="size-4" />
        <Trans i18nKey="kinder:parent.backToHome" />
      </Link>

      <div className="parent-portal-card-lg">
        <div className="flex items-start gap-4">
          <ParentChildAvatar
            name={student.full_name}
            photoUrl={student.photo_url}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {student.full_name}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {student.student_code}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Trans i18nKey="kinder:students.className" />:{' '}
              {student.class_name ?? studentDetail.homeroomClassName ?? '—'}
            </p>
            <ParentTeacherInfo
              className="mt-3"
              teacher={studentDetail.homeroomTeacher}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat
            labelKey="kinder:parent.stats.reports"
            value={String(dailyReports.length)}
          />
          <MiniStat
            labelKey="kinder:parent.stats.attendancePresent"
            value={String(presentCount)}
          />
          <MiniStat
            labelKey="kinder:parent.stats.unpaidInvoices"
            value={String(unpaidInvoices.length)}
          />
        </div>

        <ParentQuickActions className="mt-5 lg:hidden" studentId={student.id} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.value;

          return (
            <button
              className={cn(
                'parent-portal-tab shrink-0',
                active
                  ? 'parent-portal-tab-active'
                  : 'parent-portal-tab-inactive',
              )}
              key={tab.value}
              onClick={() => setTab(tab.value)}
              type="button"
            >
              <Icon className="size-4" />
              <Trans i18nKey={tab.labelKey} />
            </button>
          );
        })}
      </div>

      <div className="parent-portal-card-lg min-w-0">
        {activeTab === 'reports' ? (
          <ReportsTab dailyReports={dailyReports} />
        ) : null}
        {activeTab === 'attendance' ? (
          <AttendanceTab
            absentCount={absentCount}
            attendance={attendance}
            presentCount={presentCount}
          />
        ) : null}
        {activeTab === 'leave' ? (
          <ParentLeavePanel
            leaveRequests={leaveRequests}
            studentId={student.id}
          />
        ) : null}
        {activeTab === 'meals' ? (
          <ParentMealPanel
            allergies={health.allergies}
            todayMenu={todayMenu}
            weekMenus={weekMenus}
          />
        ) : null}
        {activeTab === 'finance' ? (
          <ParentFinancePanel
            invoices={invoices}
            payments={payments}
            studentName={student.full_name}
            vietQrConfig={vietQrConfig}
          />
        ) : null}
        {activeTab === 'health' ? (
          <ParentHealthPanel
            allergies={health.allergies}
            checkups={health.checkups}
            growth={health.growth}
            incidents={health.incidents}
            medical={health.medical}
            medications={health.medications}
            vaccinations={health.vaccinations}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <ParentStudentInfoPanel detail={studentDetail} student={student} />
        ) : null}
      </div>
    </motion.div>
  );
}

function MiniStat({
  labelKey,
  value,
}: {
  labelKey: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2 text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground uppercase">
        <Trans i18nKey={labelKey} />
      </p>
    </div>
  );
}

function ReportsTab({
  dailyReports,
}: {
  dailyReports: Array<{
    report: StudentDailyReport;
    attachments: DailyReportAttachment[];
  }>;
}) {
  if (dailyReports.length === 0) {
    return (
      <ParentEmptyState
        descriptionKey="kinder:parent.reports.empty"
        icon={BarChart3}
        titleKey="kinder:parent.tabs.reports"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.reports.timelineHint" />}
        title={<Trans i18nKey="kinder:parent.tabs.reports" />}
      />
      <div className="relative flex flex-col gap-6 pl-2">
        <div aria-hidden className="parent-portal-timeline-line" />
        {dailyReports.map(({ report, attachments }, index) => (
          <ReportTimelineCard
            attachments={attachments}
            isLatest={index === 0}
            key={report.id}
            report={report}
          />
        ))}
      </div>
    </div>
  );
}

function ReportTimelineCard({
  report,
  attachments,
  isLatest,
}: {
  report: StudentDailyReport;
  attachments: DailyReportAttachment[];
  isLatest: boolean;
}) {
  return (
    <article className="relative flex gap-4 pl-8">
      <div
        className={cn(
          'parent-portal-timeline-dot',
          isLatest && 'bg-primary text-primary-foreground',
        )}
      >
        <BarChart3 className="size-4" />
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-border bg-muted p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {report.report_date}
          </p>
          {report.parent_acknowledged_at ? (
            <Badge className="rounded-full bg-emerald-50 text-emerald-700">
              <Trans i18nKey="kinder:dailyReports.acknowledged" />
            </Badge>
          ) : (
            <AcknowledgeButton reportId={report.id} />
          )}
        </div>

        {report.daily_summary ? (
          <p className="mt-3 text-base font-medium text-foreground">
            {report.daily_summary}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2">
          {report.mood ? (
            <ReportField
              labelKey="kinder:parent.reports.mood"
              value={report.mood}
            />
          ) : null}
          {report.meals ? (
            <ReportField
              labelKey="kinder:parent.reports.meals"
              value={report.meals}
            />
          ) : null}
          {report.nap ? (
            <ReportField
              labelKey="kinder:parent.reports.nap"
              value={report.nap}
            />
          ) : null}
          {report.activities ? (
            <ReportField
              labelKey="kinder:parent.reports.activities"
              value={report.activities}
            />
          ) : null}
          {parseReportJsonArray<{ title: string; description?: string }>(
            report.learning_activities,
          ).map((item) => (
            <ReportField
              key={`${item.title}-${item.description ?? ''}`}
              labelKey="kinder:parent.reports.learning"
              value={
                item.description
                  ? `${item.title} — ${item.description}`
                  : item.title
              }
            />
          ))}
          {parseReportJsonArray<{ type: string; time?: string; notes?: string }>(
            report.toilet_records,
          ).map((item, index) => (
            <ReportField
              key={`${item.type}-${index}`}
              labelKey="kinder:parent.reports.hygiene"
              value={[item.type, item.time, item.notes].filter(Boolean).join(' · ')}
            />
          ))}
        </div>

        {report.teacher_note ? (
          <blockquote className="mt-4 rounded-xl border-l-4 border-primary bg-card px-4 py-3 text-sm text-muted-foreground italic">
            {report.teacher_note}
          </blockquote>
        ) : null}

        {attachments.length > 0 ? (
          <div className="parent-portal-media-grid mt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Trans i18nKey="kinder:dailyReports.tabs.media" />
            </p>
            <ParentDailyReportMedia attachments={attachments} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ReportField({
  labelKey,
  value,
}: {
  labelKey: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 font-medium text-muted-foreground">
        <Trans i18nKey={labelKey} />:
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function AttendanceTab({
  attendance,
  presentCount,
  absentCount,
}: {
  attendance: AttendanceRow[];
  presentCount: number;
  absentCount: number;
}) {
  if (attendance.length === 0) {
    return (
      <ParentEmptyState
        descriptionKey="kinder:parent.attendance.empty"
        icon={CalendarCheck2}
        titleKey="kinder:parent.tabs.attendance"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.attendanceHint" />}
        title={<Trans i18nKey="kinder:parent.tabs.attendance" />}
      />

      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          labelKey="kinder:parent.attendance.totalDays"
          value={String(attendance.length)}
        />
        <MiniStat
          labelKey="kinder:parent.stats.attendancePresent"
          value={String(presentCount)}
        />
        <MiniStat
          labelKey="kinder:parent.attendance.absentDays"
          value={String(absentCount)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {attendance.map((row) => (
          <div
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3"
            key={row.attendance_date}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {row.attendance_date}
              </p>
              {row.check_in_at ? (
                <p className="text-xs text-muted-foreground">
                  <Trans i18nKey="kinder:parent.attendance.checkIn" />:{' '}
                  {formatTime(row.check_in_at)}
                  {row.check_out_at
                    ? ` · ${formatTime(row.check_out_at)}`
                    : ''}
                </p>
              ) : null}
            </div>
            <AttendanceStatusBadge status={row.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceStatusBadge({ status }: { status: string }) {
  const tone =
    status === 'present'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'late'
        ? 'bg-amber-50 text-amber-700'
        : status === 'absent'
          ? 'bg-red-50 text-red-700'
          : 'bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-semibold',
        tone,
      )}
    >
      <Trans i18nKey={`kinder:attendance.statuses.${status}`} />
    </span>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseReportJsonArray<T>(value: unknown) {
  if (!value || !Array.isArray(value)) {
    return [] as T[];
  }

  return value as T[];
}

function AcknowledgeButton({ reportId }: { reportId: string }) {
  const { t } = useTranslation('kinder');

  return (
    <Button className="min-h-10"
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
