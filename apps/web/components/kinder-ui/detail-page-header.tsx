import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export function DetailPageHeader({
  title,
  description,
  backHref,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  backHref: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 sm:mb-8', className)}>
      <Button
        asChild
        className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
        size="sm"
        variant="ghost"
      >
        <Link href={backHref}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          <Trans i18nKey="kinder:ui.back" />
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="kinder-page-title">{title}</h1>
          {description ? (
            <p className="kinder-page-description">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
