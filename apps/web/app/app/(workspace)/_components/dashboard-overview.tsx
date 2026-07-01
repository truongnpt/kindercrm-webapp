'use client';

import Link from 'next/link';

import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { DashboardSummary } from '~/lib/kinder/dashboard/load-dashboard';
import { LEAD_STAGE_I18N_KEYS } from '~/lib/kinder/crm/pipeline-stages';

export function DashboardOverview({
  summary,
  features,
}: {
  summary: DashboardSummary;
  features: {
    crm: boolean;
    students: boolean;
    finance: boolean;
    attendance: boolean;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.students ? (
          <StatCard
            href={pathsConfig.app.students}
            labelKey="kinder:dashboard.stats.totalStudents"
            value={String(summary.totalStudents)}
          />
        ) : null}
        {features.crm ? (
          <StatCard
            href={pathsConfig.app.crm}
            labelKey="kinder:dashboard.stats.totalLeads"
            value={String(summary.totalLeads)}
          />
        ) : null}
        {features.finance ? (
          <StatCard
            href={pathsConfig.app.finance}
            labelKey="kinder:dashboard.stats.revenueMonth"
            value={formatVnd(summary.revenueThisMonth)}
          />
        ) : null}
        {features.finance ? (
          <StatCard
            href={pathsConfig.app.finance}
            labelKey="kinder:dashboard.stats.outstandingDebt"
            value={formatVnd(summary.outstandingDebt)}
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {features.attendance ? (
          <div className="rounded-lg border p-4">
            <p className="font-medium">
              <Trans i18nKey="kinder:dashboard.stats.attendanceToday" />
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {summary.attendanceToday.present}/{summary.attendanceToday.total}{' '}
              <span className="text-muted-foreground text-base font-normal">
                ({summary.attendanceToday.rate}%)
              </span>
            </p>
            <Link
              className="text-primary mt-2 inline-block text-sm hover:underline"
              href={pathsConfig.app.attendance}
            >
              <Trans i18nKey="kinder:attendance.title" />
            </Link>
          </div>
        ) : null}

        {features.crm ? (
          <div className="rounded-lg border p-4">
            <p className="mb-3 font-medium">
              <Trans i18nKey="kinder:dashboard.stats.leadPipeline" />
            </p>
            <ul className="space-y-2 text-sm">
              {Object.entries(summary.leadsByStage)
                .filter(([, count]) => count > 0)
                .map(([stage, count]) => (
                  <li className="flex justify-between gap-2" key={stage}>
                    <span>
                      <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage as keyof typeof LEAD_STAGE_I18N_KEYS]} />
                    </span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.students ? (
          <MiniStat
            labelKey="kinder:dashboard.stats.activeStudents"
            value={String(summary.activeStudents)}
          />
        ) : null}
        <MiniStat
          labelKey="kinder:dashboard.stats.activeClasses"
          value={String(summary.activeClasses)}
        />
        {features.attendance ? (
          <MiniStat
            labelKey="kinder:dashboard.stats.pendingLeave"
            value={String(summary.pendingLeaveRequests)}
          />
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  labelKey,
  value,
  href,
}: {
  labelKey: string;
  value: string;
  href: string;
}) {
  return (
    <Link className="rounded-lg border p-4 transition-colors hover:bg-muted/30" href={href}>
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey={labelKey} />
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function MiniStat({ labelKey, value }: { labelKey: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey={labelKey} />
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
