'use client';

import { useState } from 'react';

import { Archive } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { archiveClassAction } from '~/lib/kinder/classes/server-actions';
import type { ClassGroup } from '~/lib/kinder/classes/types';

import { EditClassDialog } from '../../_components/edit-class-dialog';

export function ClassDetailActions({
  cls,
  schoolId,
  teachers,
}: {
  cls: ClassGroup;
  schoolId: string;
  teachers: Array<{ id: string; name: string }>;
}) {
  const [archiveOpen, setArchiveOpen] = useState(false);

  const archiveClass = useKinderMutation({
    mutationFn: archiveClassAction,
    invalidateKeys: [kinderQueryKeys.classes.all(schoolId)],
    onSuccess: () => setArchiveOpen(false),
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <EditClassDialog cls={cls} schoolId={schoolId} teachers={teachers} />
        {cls.status === 'active' ? (
          <Button
            className="rounded-lg"
            onClick={() => setArchiveOpen(true)}
            size="sm"
            type="button"
            variant="destructive"
          >
            <Archive className="mr-2 size-4" />
            <Trans i18nKey="kinder:classes.archive" />
          </Button>
        ) : null}
      </div>

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="kinder:classes.archive" />}
        description={<Trans i18nKey="kinder:classes.confirmArchiveDescription" />}
        onConfirm={() =>
          archiveClass.mutate({ classId: cls.id, schoolId })
        }
        onOpenChange={setArchiveOpen}
        open={archiveOpen}
        pending={archiveClass.isPending}
        title={<Trans i18nKey="kinder:classes.confirmArchive" />}
      />
    </>
  );
}
