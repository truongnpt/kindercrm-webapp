'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { PlatformAdminRole } from '~/lib/kinder/platform/types';
import type { PlatformSchoolListItem } from '~/lib/kinder/platform/types';
import {
  platformArchiveSchoolAction,
  platformRestoreSchoolAction,
  platformSuspendSchoolAction,
} from '~/lib/kinder/platform/server-actions';

const STATUS_VARIANT: Record<
  PlatformSchoolListItem['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  suspended: 'destructive',
  archived: 'secondary',
};

export function PlatformSchoolsTable({
  schools,
  platformRole,
}: {
  schools: PlatformSchoolListItem[];
  platformRole: PlatformAdminRole;
}) {
  if (schools.length === 0) {
    return <PanelEmpty messageKey="kinder:platform.schools.empty" />;
  }

  return (
    <DataTableShell>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="kinder:platform.schools.name" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.schools.slug" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.schools.status" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.schools.package" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.schools.usage" />
            </th>
            <th className="text-right">
              <Trans i18nKey="kinder:platform.schools.actions" />
            </th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <tr key={school.id}>
              <td className="font-medium">{school.name}</td>
              <td className="font-mono text-xs">{school.slug}</td>
              <td>
                <Badge variant={STATUS_VARIANT[school.status]}>
                  <Trans i18nKey={`kinder:platform.schoolStatus.${school.status}`} />
                </Badge>
              </td>
              <td className="text-muted-foreground">
                {school.package_name ?? '—'}
              </td>
              <td className="text-muted-foreground">
                {school.student_count} HS / {school.campus_count} CS
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`${pathsConfig.platform.schoolDetail}/${school.id}`}>
                      <Trans i18nKey="kinder:platform.schools.detail" />
                    </Link>
                  </Button>
                  <SchoolQuickActions platformRole={platformRole} school={school} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function SchoolQuickActions({
  school,
  platformRole,
}: {
  school: PlatformSchoolListItem;
  platformRole: PlatformAdminRole;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const canSuspend = ['super_admin', 'support'].includes(platformRole);
  const canArchive = platformRole === 'super_admin';

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  if (school.status === 'active' && canSuspend) {
    return (
      <Button
        disabled={pending}
        onClick={() => run(() => platformSuspendSchoolAction({ schoolId: school.id }))}
        size="sm"
        variant="outline"
        type="button"
      >
        <Trans i18nKey="kinder:platform.actions.suspend" />
      </Button>
    );
  }

  if (school.status === 'suspended' && canSuspend) {
    return (
      <Button
        disabled={pending}
        onClick={() => run(() => platformRestoreSchoolAction({ schoolId: school.id }))}
        size="sm"
        variant="outline"
        type="button"
      >
        <Trans i18nKey="kinder:platform.actions.restore" />
      </Button>
    );
  }

  if (school.status !== 'archived' && canArchive) {
    return (
      <Button
        disabled={pending}
        onClick={() => run(() => platformArchiveSchoolAction({ schoolId: school.id }))}
        size="sm"
        variant="destructive"
        type="button"
      >
        <Trans i18nKey="kinder:platform.actions.archive" />
      </Button>
    );
  }

  return null;
}
