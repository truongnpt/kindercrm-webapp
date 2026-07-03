'use client';

import type { LucideIcon } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

export function ParentEmptyState({
  icon: Icon,
  titleKey,
  descriptionKey,
}: {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          <Trans i18nKey={titleKey} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          <Trans i18nKey={descriptionKey} />
        </p>
      </div>
    </div>
  );
}
