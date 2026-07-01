'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { switchSchoolAction } from '~/lib/kinder/tenant/server-actions';
import type { SchoolMemberRole } from '~/lib/kinder/types';

type SchoolOption = {
  id: string;
  name: string;
  role: SchoolMemberRole;
};

export function SchoolSwitcher({
  schools,
  activeSchoolId,
}: {
  schools: SchoolOption[];
  activeSchoolId: string;
}) {
  if (schools.length <= 1) {
    const school = schools[0];

    if (!school) {
      return null;
    }

    return (
      <div className="text-muted-foreground truncate px-2 text-xs font-medium">
        {school.name}
      </div>
    );
  }

  const active = schools.find((s) => s.id === activeSchoolId) ?? schools[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full justify-between gap-2 rounded-lg border-border bg-muted/30 px-3 shadow-none"
          size="sm"
          variant="outline"
        >
          <span className="truncate text-left text-sm font-medium">
            {active.name}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <Trans i18nKey="kinder:schoolSwitcher.label" />
        </DropdownMenuLabel>

        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            className="flex items-center justify-between gap-2"
            onClick={() => {
              if (school.id !== activeSchoolId) {
                void switchSchoolAction({ schoolId: school.id });
              }
            }}
          >
            <span className="truncate">{school.name}</span>
            {school.id === activeSchoolId ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
