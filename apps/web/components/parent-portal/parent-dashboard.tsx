'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  CreditCard,
  HeartPulse,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';
import type { ParentChildDashboardSummary } from '~/lib/kinder/parent/load-parent-dashboard';

import { ParentChildAvatar } from './parent-child-avatar';
import { ParentQuickActions } from './parent-quick-actions';
import { ParentSectionHeader } from './parent-section-header';
import { ParentTeacherInfo } from './parent-teacher-info';
import { ParentUpcomingEvents } from './parent-upcoming-events';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ParentDashboard({
  summaries,
  unreadCount,
  upcomingEvents,
}: {
  summaries: ParentChildDashboardSummary[];
  unreadCount: number;
  upcomingEvents: { event: SchoolCalendarEvent; schoolName: string }[];
}) {
  return (
    <motion.div
      animate="visible"
      className="flex flex-col gap-6"
      initial="hidden"
      transition={{ duration: 0.2, staggerChildren: 0.06 }}
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp}>
        <ParentSectionHeader
          description={<Trans i18nKey="kinder:parent.homeDescription" />}
          title={<Trans i18nKey="kinder:parent.dashboard.greeting" />}
        />
      </motion.div>

      {unreadCount > 0 ? (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                <Trans
                  i18nKey="kinder:parent.dashboard.unreadNotifications"
                  values={{ count: unreadCount }}
                />
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <motion.div variants={fadeUp}>
          <ParentUpcomingEvents items={upcomingEvents} />
        </motion.div>
      ) : null}

      <motion.div className="flex flex-col gap-4" variants={fadeUp}>
        {summaries.map((summary) => (
          <ChildDashboardCard key={summary.child.studentId} summary={summary} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function ChildDashboardCard({
  summary,
}: {
  summary: ParentChildDashboardSummary;
}) {
  const { child, todayAttendance, latestReport, unpaidBalance } = summary;
  const childHref = `${pathsConfig.parent.child}/${child.studentId}`;

  return (
    <motion.article
      className="parent-portal-card-lg overflow-hidden"
      variants={fadeUp}
    >
      <div className="flex items-start gap-4">
        <ParentChildAvatar
          name={child.fullName}
          photoUrl={child.photoUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {child.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {child.className ?? '—'} · {child.schoolName}
              </p>
              {summary.homeroomTeacher ? (
                <ParentTeacherInfo
                  className="mt-2"
                  compact
                  teacher={summary.homeroomTeacher}
                />
              ) : null}
            </div>
            {child.isPrimary ? (
              <Badge className="shrink-0 rounded-full bg-primary/10 text-primary">
                <Trans i18nKey="kinder:parent.primary" />
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatPill
          icon={CalendarCheck2}
          labelKey="kinder:parent.dashboard.todayAttendance"
          tone={
            todayAttendance?.status === 'present' ||
            todayAttendance?.status === 'late'
              ? 'success'
              : todayAttendance?.status === 'absent'
                ? 'danger'
                : 'default'
          }
          value={
            todayAttendance ? (
              <Trans
                i18nKey={`kinder:attendance.statuses.${todayAttendance.status}`}
              />
            ) : (
              '—'
            )
          }
        />
        <StatPill
          icon={BookOpen}
          labelKey="kinder:parent.dashboard.todayReport"
          tone={latestReport ? 'primary' : 'default'}
          value={
            latestReport?.daily_summary
              ? truncate(latestReport.daily_summary, 28)
              : latestReport
                ? latestReport.report_date
                : '—'
          }
        />
        <StatPill
          className="col-span-2 sm:col-span-1"
          icon={CreditCard}
          labelKey="kinder:parent.dashboard.tuition"
          tone={unpaidBalance > 0 ? 'warning' : 'success'}
          value={
            unpaidBalance > 0 ? formatVnd(unpaidBalance) : (
              <Trans i18nKey="kinder:parent.dashboard.paidUp" />
            )
          }
        />
      </div>

      <ParentQuickActions
        className="mt-5"
        studentId={child.studentId}
      />

      <Link
        className="mt-4 flex min-h-11 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        href={childHref}
      >
        <Trans i18nKey="kinder:parent.viewChild" />
        <ChevronRight className="size-4" />
      </Link>
    </motion.article>
  );
}

function StatPill({
  icon: Icon,
  labelKey,
  value,
  tone = 'default',
  className,
}: {
  icon: typeof BookOpen;
  labelKey: string;
  value: React.ReactNode;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const toneClasses = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-700',
    warning: 'bg-amber-500/10 text-amber-700',
    danger: 'bg-destructive/10 text-destructive',
  }[tone];

  return (
    <div className={`parent-portal-stat ${className ?? ''}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">
          <Trans i18nKey={labelKey} />
        </span>
      </div>
      <p className={`rounded-lg px-2 py-1 text-sm font-semibold ${toneClasses}`}>
        {value}
      </p>
    </div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}…`;
}
