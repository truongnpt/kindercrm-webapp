'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

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
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:students.empty" />
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:students.code" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:students.fullName" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:students.className" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:students.status" />
            </th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {student.student_code}
              </td>
              <td className="px-4 py-3">{student.full_name}</td>
              <td className="px-4 py-3">{student.class_name ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[student.status]}>
                  <Trans i18nKey={`kinder:students.statuses.${student.status}`} />
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
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
    </div>
  );
}
