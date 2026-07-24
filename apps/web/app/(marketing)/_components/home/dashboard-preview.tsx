'use client';

import {
  Bell,
  ClipboardCheck,
  GraduationCap,
  LayoutGrid,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { MotionFloat } from '~/components/marketing';
import appConfig from '@/config/app.config';

function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: React.ReactNode;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="marketing-card rounded-xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--marketing-text-muted)]">
          {label}
        </span>
        <span className="text-[var(--marketing-primary)]">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--marketing-text)]">{value}</p>
      {trend ? (
        <p className="mt-1 text-xs text-[var(--marketing-secondary)]">{trend}</p>
      ) : null}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-[var(--marketing-primary)]/20 via-transparent to-[var(--marketing-secondary)]/15 blur-3xl"
      />

      <MotionFloat className="absolute -top-4 right-4 z-10 hidden md:block">
        <div className="marketing-glass marketing-card flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg">
          <Bell className="size-4 text-[var(--marketing-accent)]" />
          <span className="text-[var(--marketing-text)]">
            <Trans i18nKey="marketing:previewFloatNotification" />
          </span>
        </div>
      </MotionFloat>

      <MotionFloat delay={1} className="absolute -left-4 bottom-8 z-10 hidden lg:block">
        <div className="marketing-glass marketing-card rounded-xl px-4 py-3 text-sm shadow-lg">
          <p className="font-medium text-[var(--marketing-text)]">
            <Trans i18nKey="marketing:previewFloatAttendance" />
          </p>
          <p className="text-xs text-[var(--marketing-secondary)]">96% today</p>
        </div>
      </MotionFloat>

      <div className="marketing-card overflow-hidden rounded-2xl border shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[var(--marketing-border)] bg-[var(--marketing-section)] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-green-400" />
          </div>
          <span className="mx-auto text-xs text-[var(--marketing-text-muted)]">
            kinderpms.app
          </span>
        </div>

        <div className="bg-white p-4 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-[var(--marketing-text)]">
                {appConfig.name}
              </p>
              <p className="text-sm text-[var(--marketing-text-muted)]">
                <Trans i18nKey="marketing:heroPreviewWorkspace" />
              </p>
            </div>
            <span className="rounded-full bg-[var(--marketing-secondary)]/10 px-3 py-1 text-xs font-medium text-[var(--marketing-secondary)]">
              <Trans i18nKey="marketing:heroPreviewBadge" />
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={<Trans i18nKey="marketing:heroPreviewStudents" />}
              value="128"
              icon={<GraduationCap className="size-4" />}
              trend="+12 this month"
            />
            <StatCard
              label={<Trans i18nKey="marketing:heroPreviewClasses" />}
              value="8"
              icon={<LayoutGrid className="size-4" />}
            />
            <StatCard
              label={<Trans i18nKey="marketing:heroPreviewAttendance" />}
              value="96%"
              icon={<ClipboardCheck className="size-4" />}
              trend="+2% vs last week"
            />
            <StatCard
              label={<Trans i18nKey="marketing:heroPreviewFees" />}
              value="92%"
              icon={<Wallet className="size-4" />}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <div className="marketing-card rounded-xl p-4 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-medium text-[var(--marketing-text)]">
                  <Trans i18nKey="marketing:previewChartTitle" />
                </p>
                <TrendingUp className="size-4 text-[var(--marketing-primary)]" />
              </div>
              <div className="flex h-32 items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-[var(--marketing-primary)] to-[color-mix(in_srgb,var(--marketing-primary)_55%,white)]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="marketing-card rounded-xl p-4 lg:col-span-2">
              <p className="mb-3 font-medium text-[var(--marketing-text)]">
                <Trans i18nKey="marketing:heroPreviewRecentTitle" />
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-lg bg-[var(--marketing-section)] px-3 py-2">
                  <span className="text-[var(--marketing-text-muted)]">
                    <Trans i18nKey="marketing:heroPreviewRecentItem1" />
                  </span>
                  <span className="text-xs font-medium text-[var(--marketing-secondary)]">
                    28/30
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-lg bg-[var(--marketing-section)] px-3 py-2">
                  <span className="text-[var(--marketing-text-muted)]">
                    <Trans i18nKey="marketing:heroPreviewRecentItem2" />
                  </span>
                  <Users className="size-4 text-[var(--marketing-primary)]" />
                </li>
                <li className="flex items-center justify-between rounded-lg bg-[var(--marketing-section)] px-3 py-2">
                  <span className="text-[var(--marketing-text-muted)]">
                    <Trans i18nKey="marketing:heroPreviewRecentItem3" />
                  </span>
                  <TrendingUp className="size-4 text-[var(--marketing-accent)]" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
