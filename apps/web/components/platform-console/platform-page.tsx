import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export function PlatformPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('platform-console-section-header mb-6', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function PlatformPageBody({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex w-full flex-1 flex-col gap-6', className)}>
      {children}
    </div>
  );
}

export function PlatformStatCard({
  labelKey,
  value,
  href,
  icon: Icon,
  tone = 'default',
  className,
}: {
  labelKey: string;
  value: string;
  href?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}) {
  const toneIconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    info: 'bg-sky-500/10 text-sky-600',
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          <Trans i18nKey={labelKey} />
        </p>
        {Icon ? (
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-xl',
              toneIconStyles[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </>
  );

  const cardClass = cn(
    'platform-console-stat',
    href && 'platform-console-stat-interactive',
    className,
  );

  if (href) {
    return (
      <Link className={cardClass} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}

export function PlatformSectionCard({
  title,
  children,
  action,
  className,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('platform-console-card overflow-hidden', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export function PlatformDataTable({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('platform-console-table', className)}>{children}</div>
  );
}

export function PlatformEmptyState({
  titleKey,
  descriptionKey,
  icon: Icon,
}: {
  titleKey: string;
  descriptionKey?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="platform-console-card-padded flex flex-col items-center justify-center py-12 text-center">
      {Icon ? (
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </span>
      ) : null}
      <p className="text-base font-semibold text-foreground">
        <Trans i18nKey={titleKey} />
      </p>
      {descriptionKey ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          <Trans i18nKey={descriptionKey} />
        </p>
      ) : null}
    </div>
  );
}
