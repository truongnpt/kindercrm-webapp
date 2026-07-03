'use client';

import { Mail, Phone, UserRound } from 'lucide-react';

import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import type { ParentHomeroomTeacher } from '~/lib/kinder/parent/types';

export function ParentTeacherInfo({
  teacher,
  className,
  compact = false,
}: {
  teacher: ParentHomeroomTeacher | null;
  className?: string;
  compact?: boolean;
}) {
  if (!teacher) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        <Trans i18nKey="kinder:parent.profile.noHomeroomTeacher" />
      </p>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        <ProfileAvatar
          className="size-6 rounded-md"
          displayName={teacher.name}
          fallbackClassName="rounded-md text-[10px]"
          pictureUrl={teacher.photoUrl}
        />
        <span>
          <Trans i18nKey="kinder:parent.profile.homeroomTeacher" />:{' '}
          <span className="font-medium text-foreground">{teacher.name}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4',
        className,
      )}
    >
      <ProfileAvatar
        className="size-12 rounded-xl"
        displayName={teacher.name}
        fallbackClassName="rounded-xl"
        pictureUrl={teacher.photoUrl}
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Trans i18nKey="kinder:parent.profile.homeroomTeacher" />
        </p>
        <p className="mt-1 text-base font-semibold text-foreground">{teacher.name}</p>

        {teacher.phone ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <a className="hover:text-foreground" href={`tel:${teacher.phone}`}>
              {teacher.phone}
            </a>
          </p>
        ) : null}

        {teacher.email ? (
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <a className="truncate hover:text-foreground" href={`mailto:${teacher.email}`}>
              {teacher.email}
            </a>
          </p>
        ) : null}

        {!teacher.phone && !teacher.email ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4 shrink-0" />
            <Trans i18nKey="kinder:parent.profile.teacherContactUnavailable" />
          </p>
        ) : null}
      </div>
    </div>
  );
}
