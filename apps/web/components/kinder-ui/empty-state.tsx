import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export function EmptyState({
  icon: Icon,
  titleKey,
  descriptionKey,
  actionLabelKey,
  onAction,
  actionHref,
  compact = false,
  className,
}: {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey?: string;
  actionLabelKey?: string;
  onAction?: () => void;
  actionHref?: string;
  compact?: boolean;
  className?: string;
}) {
  const actionButton =
    actionLabelKey && (onAction || actionHref) ? (
      onAction ? (
        <Button className="mt-5 rounded-lg" onClick={onAction} type="button">
          <Trans i18nKey={actionLabelKey} />
        </Button>
      ) : actionHref ? (
        <Button asChild className="mt-5 rounded-lg">
          <Link href={actionHref}>
            <Trans i18nKey={actionLabelKey} />
          </Link>
        </Button>
      ) : null
    ) : null;

  if (compact) {
    return (
      <div
        className={cn(
          'kinder-panel-empty flex flex-col items-center justify-center px-6 py-10 text-center',
          className,
        )}
      >
        <div className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </div>
        <p className="text-foreground text-sm font-medium">
          <Trans i18nKey={titleKey} />
        </p>
        {descriptionKey ? (
          <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
            <Trans i18nKey={descriptionKey} />
          </p>
        ) : null}
        {actionButton ? (
          <div className="mt-3">{actionButton}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'kinder-bento-tile flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-xl">
        <Icon className="size-7" />
      </div>
      <h3 className="text-foreground text-base font-semibold">
        <Trans i18nKey={titleKey} />
      </h3>
      {descriptionKey ? (
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          <Trans i18nKey={descriptionKey} />
        </p>
      ) : null}
      {actionButton}
    </div>
  );
}
