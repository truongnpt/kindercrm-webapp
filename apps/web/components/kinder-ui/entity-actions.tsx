'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function EntityRowActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: React.ReactNode;
  deleteLabel?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit ? (
        <Button onClick={onEdit} size="sm" type="button" variant="ghost">
          <Pencil className="mr-1.5 size-4" />
          {editLabel ?? <Trans i18nKey="kinder:ui.edit" />}
        </Button>
      ) : null}
      {onDelete ? (
        <Button
 onClick={onDelete}
 size="sm"
 type="button"
 variant="ghost"className="text-destructive hover:text-destructive"
 >
          <Trash2 className="mr-1.5 size-4" />
          {deleteLabel ?? <Trans i18nKey="kinder:ui.delete" />}
        </Button>
      ) : null}
    </div>
  );
}
