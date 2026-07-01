import Link from 'next/link';

import { GraduationCap, Users } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  SectionCard,
  StatusBadge,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { Student } from '~/lib/kinder/students/types';

import { StudentAvatar } from '../../_components/student-avatar';

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
  Student['status'],
  'default' | 'success' | 'muted' | 'warning'
> = {
  active: 'success',
  inactive: 'muted',
  graduated: 'default',
  transferred: 'warning',
  withdrawn: 'muted',
};

function genderLabel(gender: Student['gender']) {
  if (gender === 'male') {
    return <Trans i18nKey="kinder:students.genderMale" />;
  }

  if (gender === 'female') {
    return <Trans i18nKey="kinder:students.genderFemale" />;
  }

  if (gender === 'other') {
    return <Trans i18nKey="kinder:students.genderOther" />;
  }

  return '—';
}

export function StudentProfileBento({ student }: { student: Student }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <BentoTile className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StudentAvatar name={student.full_name} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              {student.full_name}
            </h2>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              {student.student_code}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone={STATUS_TONE[student.status]}>
                <Trans i18nKey={`kinder:students.statuses.${student.status}`} />
              </StatusBadge>
              {student.class_name ? (
                <StatusBadge tone="info">
                  <GraduationCap className="mr-1 size-3.5" />
                  {student.class_name}
                </StatusBadge>
              ) : null}
            </div>
          </div>
        </div>
      </BentoTile>

      <div className="kinder-profile-grid">
        <div className="kinder-profile-main">
          <SectionCard title={<Trans i18nKey="kinder:students.profilePersonal" />}>
            <dl>
              <InfoRow
                label={<Trans i18nKey="kinder:students.dateOfBirth" />}
                value={student.date_of_birth ?? '—'}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:students.gender" />}
                value={genderLabel(student.gender)}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:students.enrollmentDate" />}
                value={student.enrollment_date ?? '—'}
              />
            </dl>
          </SectionCard>

          <SectionCard title={<Trans i18nKey="kinder:students.notes" />}>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {student.notes ?? '—'}
            </p>
          </SectionCard>
        </div>

        <aside className="kinder-profile-aside">
          <SectionCard title={<Trans i18nKey="kinder:students.className" />}>
            <dl>
              <InfoRow
                label={<Trans i18nKey="kinder:students.className" />}
                value={student.class_name ?? '—'}
              />
              <InfoRow
                label={<Trans i18nKey="kinder:students.status" />}
                value={
                  <StatusBadge tone={STATUS_TONE[student.status]}>
                    <Trans
                      i18nKey={`kinder:students.statuses.${student.status}`}
                    />
                  </StatusBadge>
                }
              />
              {student.lead_id ? (
                <InfoRow
                  label={<Trans i18nKey="kinder:students.enrollmentSource" />}
                  value={
                    <Link
                      className="text-primary inline-flex items-center gap-1.5 hover:underline"
                      href={`${pathsConfig.app.crmLead}/${student.lead_id}`}
                    >
                      <Users className="size-3.5" />
                      <Trans i18nKey="kinder:crm.detail" />
                    </Link>
                  }
                />
              ) : null}
            </dl>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
