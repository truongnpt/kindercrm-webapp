'use client';

import Link from 'next/link';

import {
  CreditCard,
  GraduationCap,
  Users,
  Wallet,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  MiniStatCard,
  SectionCard,
  StatCard,
} from '~/components/kinder-ui';
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
      <BentoGrid columns={4}>
        {features.students ? (
          <StatCard
            href={pathsConfig.app.students}
            icon={GraduationCap}
            labelKey="kinder:dashboard.stats.totalStudents"
            tone="info"
            value={String(summary.totalStudents)}
          />
        ) : null}
        {features.crm ? (
          <StatCard
            href={pathsConfig.app.crm}
            icon={Users}
            labelKey="kinder:dashboard.stats.totalLeads"
            tone="default"
            value={String(summary.totalLeads)}
          />
        ) : null}
        {features.finance ? (
          <StatCard
            href={pathsConfig.app.finance}
            icon={Wallet}
            labelKey="kinder:dashboard.stats.revenueMonth"
            tone="success"
            value={formatVnd(summary.revenueThisMonth)}
          />
        ) : null}
        {features.finance ? (
          <StatCard
            href={pathsConfig.app.finance}
            icon={CreditCard}
            labelKey="kinder:dashboard.stats.outstandingDebt"
            tone="warning"
            value={formatVnd(summary.outstandingDebt)}
          />
        ) : null}
      </BentoGrid>

      <BentoGrid columns={2}>
        {features.attendance ? (
          <BentoTile colSpan={1}>
            <BentoTileHeader
              action={
                <Button asChild size="sm" variant="ghost">
                  <Link href={pathsConfig.app.attendance}>
                    <Trans i18nKey="kinder:attendance.title" />
                  </Link>
                </Button>
              }
              title={<Trans i18nKey="kinder:dashboard.stats.attendanceToday" />}
            />
            <div className="flex items-end gap-3">
              <p className="text-foreground text-3xl font-semibold tracking-tight">
                {summary.attendanceToday.present}/{summary.attendanceToday.total}
              </p>
              <p className="text-muted-foreground mb-1 text-sm">
                ({summary.attendanceToday.rate}%)
              </p>
            </div>
            <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${summary.attendanceToday.rate}%` }}
              />
            </div>
          </BentoTile>
        ) : null}

        {features.crm ? (
          <BentoTile colSpan={1}>
            <BentoTileHeader
              title={<Trans i18nKey="kinder:dashboard.stats.leadPipeline" />}
            />
            <ul className="space-y-3">
              {Object.entries(summary.leadsByStage)
                .filter(([, count]) => count > 0)
                .map(([stage, count]) => (
                  <li
                    className="flex items-center justify-between gap-3 text-sm"
                    key={stage}
                  >
                    <span className="text-muted-foreground">
                      <Trans
                        i18nKey={
                          LEAD_STAGE_I18N_KEYS[
                            stage as keyof typeof LEAD_STAGE_I18N_KEYS
                          ]
                        }
                      />
                    </span>
                    <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {count}
                    </span>
                  </li>
                ))}
            </ul>
          </BentoTile>
        ) : null}
      </BentoGrid>

      <SectionCard
        title={<Trans i18nKey="kinder:dashboard.sections.quickStats" />}
      >
        <BentoGrid columns={3}>
          {features.students ? (
            <MiniStatCard
              labelKey="kinder:dashboard.stats.activeStudents"
              value={String(summary.activeStudents)}
            />
          ) : null}
          <MiniStatCard
            labelKey="kinder:dashboard.stats.activeClasses"
            value={String(summary.activeClasses)}
          />
          {features.attendance ? (
            <MiniStatCard
              labelKey="kinder:dashboard.stats.pendingLeave"
              value={String(summary.pendingLeaveRequests)}
            />
          ) : null}
        </BentoGrid>
      </SectionCard>
    </div>
  );
}
