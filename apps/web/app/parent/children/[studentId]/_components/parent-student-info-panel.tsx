'use client';

import { UserRound } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { ParentSectionHeader } from '~/components/parent-portal';
import { ParentTeacherInfo } from '~/components/parent-portal/parent-teacher-info';
import type { ParentHomeroomTeacher } from '~/lib/kinder/parent/types';

export function ParentStudentInfoPanel({
  student,
  detail,
}: {
  student: {
    full_name: string;
    student_code: string;
    class_name: string | null;
    date_of_birth: string | null;
    status: string;
  };
  detail: {
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
}) {
  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader title={<Trans i18nKey="kinder:parent.tabs.profile" />} />

      <InfoCard titleKey="kinder:parent.profile.student">
        <InfoRow labelKey="kinder:students.fullName" value={student.full_name} />
        <InfoRow labelKey="kinder:students.code" value={student.student_code} />
        <InfoRow
          labelKey="kinder:students.className"
          value={student.class_name ?? '—'}
        />
        {student.date_of_birth ? (
          <InfoRow
            labelKey="kinder:students.dateOfBirth"
            value={student.date_of_birth}
          />
        ) : null}
        {detail.homeroomClassName ? (
          <InfoRow
            labelKey="kinder:parent.profile.homeroomClass"
            value={detail.homeroomClassName}
          />
        ) : null}
      </InfoCard>

      <InfoCard titleKey="kinder:parent.profile.homeroomTeacher">
        <ParentTeacherInfo teacher={detail.homeroomTeacher} />
      </InfoCard>

      {detail.parents.length > 0 ? (
        <InfoCard titleKey="kinder:parent.profile.parents">
          {detail.parents.map((parent) => (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm" key={parent.id}>
              <p className="font-medium text-foreground">{parent.full_name}</p>
              <p className="text-muted-foreground">
                {parent.relationship ?? '—'}
                {parent.is_primary ? ' · ' : ''}
                {parent.is_primary ? (
                  <Trans i18nKey="kinder:parent.primary" />
                ) : null}
              </p>
              {parent.phone ? (
                <p className="text-muted-foreground">{parent.phone}</p>
              ) : null}
              {parent.email ? (
                <p className="text-muted-foreground">{parent.email}</p>
              ) : null}
            </div>
          ))}
        </InfoCard>
      ) : null}

      {detail.pickupPersons.length > 0 ? (
        <InfoCard titleKey="kinder:students.pickup">
          {detail.pickupPersons.map((person) => (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm" key={person.id}>
              <p className="font-medium text-foreground">{person.full_name}</p>
              <p className="text-muted-foreground">
                {person.relationship ?? '—'}
                {person.phone ? ` · ${person.phone}` : ''}
              </p>
            </div>
          ))}
        </InfoCard>
      ) : null}

      {detail.emergencyContacts.length > 0 ? (
        <InfoCard titleKey="kinder:parent.profile.emergency">
          {detail.emergencyContacts.map((contact) => (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm" key={contact.id}>
              <p className="font-medium text-foreground">{contact.full_name}</p>
              <p className="text-muted-foreground">
                {contact.relationship ?? '—'}
                {contact.phone ? ` · ${contact.phone}` : ''}
              </p>
            </div>
          ))}
        </InfoCard>
      ) : null}

      {detail.parents.length === 0 &&
      detail.pickupPersons.length === 0 &&
      detail.emergencyContacts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
          <UserRound className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <Trans i18nKey="kinder:parent.profile.emptyContacts" />
          </p>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({
  titleKey,
  children,
}: React.PropsWithChildren<{ titleKey: string }>) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">
        <Trans i18nKey={titleKey} />
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function InfoRow({
  labelKey,
  value,
}: {
  labelKey: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground">
        <Trans i18nKey={labelKey} />:
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
