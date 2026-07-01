'use client';

import Link from 'next/link';

import { GraduationCap } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableShell, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { Student } from '~/lib/kinder/students/types';

const STATUS_VARIANT: Record<
  Student['status'],
  'default' | 'secondary' | 'outline'
> = {
  active: 'default',
  inactive: 'secondary',
  graduated: 'outline',
  transferred: 'outline',
  withdrawn: 'secondary',
};

export function StudentsList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <EmptyState
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={GraduationCap}
        titleKey="kinder:students.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:students.code" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.fullName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.className" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.status" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="font-mono text-xs">{student.student_code}</td>
                  <td className="font-medium">{student.full_name}</td>
                  <td className="text-muted-foreground">
                    {student.class_name ?? '—'}
                  </td>
                  <td>
                    <Badge variant={STATUS_VARIANT[student.status]}>
                      <Trans
                        i18nKey={`kinder:students.statuses.${student.status}`}
                      />
                    </Badge>
                  </td>
                  <td className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`${pathsConfig.app.studentDetail}/${student.id}`}
                      >
                        <Trans i18nKey="kinder:students.detail" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </div>

      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <article className="kinder-mobile-card" key={student.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-foreground truncate font-medium">
                  {student.full_name}
                </p>
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                  {student.student_code}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[student.status]}>
                <Trans
                  i18nKey={`kinder:students.statuses.${student.status}`}
                />
              </Badge>
            </div>

            <div className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:students.className" />:{' '}
              <span className="text-foreground">
                {student.class_name ?? '—'}
              </span>
            </div>

            <Button asChild className="w-full" size="sm" variant="outline">
              <Link href={`${pathsConfig.app.studentDetail}/${student.id}`}>
                <Trans i18nKey="kinder:students.detail" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
