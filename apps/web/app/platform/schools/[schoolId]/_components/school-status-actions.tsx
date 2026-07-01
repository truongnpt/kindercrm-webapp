'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';
import type { PlatformSchoolDetail } from '~/lib/kinder/platform/types';
import {
  platformArchiveSchoolAction,
  platformRestoreSchoolAction,
  platformSuspendSchoolAction,
} from '~/lib/kinder/platform/server-actions';

export function SchoolStatusActions({
  school,
  platformRole,
}: {
  school: PlatformSchoolDetail;
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

  return (
    <div className="flex flex-wrap gap-2">
      {school.status === 'active' && canSuspend ? (
        <Button
          disabled={pending}
          onClick={() => run(() => platformSuspendSchoolAction({ schoolId: school.id }))}
          type="button"
          variant="outline"
        >
          <Trans i18nKey="kinder:platform.actions.suspend" />
        </Button>
      ) : null}

      {school.status === 'suspended' && canSuspend ? (
        <Button
          disabled={pending}
          onClick={() => run(() => platformRestoreSchoolAction({ schoolId: school.id }))}
          type="button"
        >
          <Trans i18nKey="kinder:platform.actions.restore" />
        </Button>
      ) : null}

      {school.status !== 'archived' && canArchive ? (
        <Button
          disabled={pending}
          onClick={() => run(() => platformArchiveSchoolAction({ schoolId: school.id }))}
          type="button"
          variant="destructive"
        >
          <Trans i18nKey="kinder:platform.actions.archive" />
        </Button>
      ) : null}
    </div>
  );
}
