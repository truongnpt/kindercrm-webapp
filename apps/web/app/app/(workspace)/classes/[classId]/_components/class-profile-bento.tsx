import { GraduationCap, Users } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  SectionCard,
  StatusBadge,
} from '~/components/kinder-ui';
import type { ClassGroup } from '~/lib/kinder/classes/types';

import { ClassAvatar } from '../../_components/class-avatar';

function InfoRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-0">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm font-medium">{value}</dd>
    </div>
  );
}

const STATUS_TONE: Record<
  ClassGroup['status'],
  'default' | 'success' | 'muted'
> = {
  active: 'success',
  archived: 'muted',
};

export function ClassProfileBento({
  cls,
  enrollmentCount,
  teacherName,
  scheduleCount,
}: {
  cls: ClassGroup;
  enrollmentCount: number;
  teacherName: string | null;
  scheduleCount: number;
}) {
  const fillPercent = cls.capacity
    ? Math.min(100, Math.round((enrollmentCount / cls.capacity) * 100))
    : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <BentoTile className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ClassAvatar name={cls.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              {cls.name}
            </h2>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              {cls.code}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone={STATUS_TONE[cls.status]}>
                <Trans i18nKey={`kinder:classes.statuses.${cls.status}`} />
              </StatusBadge>
              <StatusBadge tone={fillPercent >= 90 ? 'warning' : 'info'}>
                <Users className="mr-1 size-3.5" />
                {enrollmentCount}/{cls.capacity}{' '}
                <Trans i18nKey="kinder:classes.enrolled" />
              </StatusBadge>
              {teacherName ? (
                <StatusBadge tone="default">
                  <GraduationCap className="mr-1 size-3.5" />
                  {teacherName}
                </StatusBadge>
              ) : null}
            </div>
          </div>
        </div>
      </BentoTile>

      <div className="kinder-profile-grid">
        <div className="kinder-profile-main">
          <SectionCard title={<Trans i18nKey="kinder:classes.profileAcademic" />}>
            <dl>
              <InfoRow
                label={<Trans i18nKey="kinder:classes.schoolYear" />}
                value={cls.school_year?.name ?? '—'}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.semester" />}
                value={cls.semester?.name ?? '—'}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.classroom" />}
                value={cls.classroom?.name ?? '—'}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.capacity" />}
                value={cls.capacity}
              />
            </dl>
          </SectionCard>
        </div>

        <aside className="kinder-profile-aside">
          <SectionCard title={<Trans i18nKey="kinder:classes.profileSummary" />}>
            <dl>
              <InfoRow
                label={<Trans i18nKey="kinder:classes.teacher" />}
                value={teacherName ?? <Trans i18nKey="kinder:classes.unassigned" />}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.roster" />}
                value={`${enrollmentCount} / ${cls.capacity}`}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.timetable" />}
                value={
                  scheduleCount > 0 ? (
                    <Trans
                      i18nKey="kinder:classes.scheduleSlots"
                      values={{ count: scheduleCount }}
                    />
                  ) : (
                    <Trans i18nKey="kinder:classes.noSchedule" />
                  )
                }
              />
              <InfoRow
                label={<Trans i18nKey="kinder:classes.status" />}
                value={
                  <StatusBadge tone={STATUS_TONE[cls.status]}>
                    <Trans i18nKey={`kinder:classes.statuses.${cls.status}`} />
                  </StatusBadge>
                }
              />
            </dl>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
