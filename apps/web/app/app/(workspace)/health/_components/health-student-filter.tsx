'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { StudentOption } from '~/lib/kinder/health/types';

export function HealthStudentFilter({
  students,
  studentId,
  tab,
}: {
  students: StudentOption[];
  studentId?: string;
  tab: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);

        if (value === 'all') {
          params.delete('studentId');
        } else {
          params.set('studentId', value);
        }

        router.push(`${pathsConfig.app.health}?${params.toString()}`);
      }}
      value={studentId ?? 'all'}
    >
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <Trans i18nKey="kinder:health.allStudents" />
        </SelectItem>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.full_name} ({student.student_code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
