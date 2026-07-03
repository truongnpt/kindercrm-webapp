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

import { CALENDAR_EVENT_CATEGORIES } from '~/lib/kinder/calendar/types';

type ClassOption = {
  id: string;
  name: string;
  code: string;
};

export function CalendarFilters({
  classes,
}: {
  classes: ClassOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId') ?? 'all';
  const category = searchParams.get('category') ?? 'all';

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {classes.length > 0 ? (
        <Select
          onValueChange={(value) => updateParams({ classId: value })}
          value={classId}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Trans i18nKey="kinder:calendar.filters.allClasses" />
            </SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select
        onValueChange={(value) => updateParams({ category: value })}
        value={category}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans i18nKey="kinder:calendar.filters.allCategories" />
          </SelectItem>
          {CALENDAR_EVENT_CATEGORIES.map((item) => (
            <SelectItem key={item} value={item}>
              <Trans i18nKey={`kinder:calendar.categories.${item}`} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
