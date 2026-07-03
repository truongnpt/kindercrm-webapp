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

import type { ParentChildSummary } from '~/lib/kinder/parent/types';

export function ParentCalendarFilters({
  schools,
  children,
  schoolId,
  studentId,
}: {
  schools: { schoolId: string; schoolName: string }[];
  children: ParentChildSummary[];
  schoolId: string;
  studentId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {schools.length > 1 ? (
        <Select
          onValueChange={(value) =>
            updateParams({ schoolId: value, studentId: null })
          }
          value={schoolId}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.schoolId} value={school.schoolId}>
                {school.schoolName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {children.length > 0 ? (
        <Select
          onValueChange={(value) =>
            updateParams({
              studentId: value === 'all' ? null : value,
            })
          }
          value={studentId ?? 'all'}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans i18nKey="kinder:parent.calendar.allChildren" />
            </SelectItem>
            {children.map((child) => (
              <SelectItem key={child.studentId} value={child.studentId}>
                {child.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
