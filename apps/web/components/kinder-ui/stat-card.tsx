import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

type StatCardProps = {
  labelKey: string;
  value: string;
  href?: string;
  icon?: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendLabelKey?: string;
  tone?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
};

const toneIconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

const trendDirectionStyles = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
};

export function StatCard({
  labelKey,
  value,
  href,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  trendLabelKey = 'kinder:ui.vsLastMonth',
  tone = 'default',
  className,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="kinder-stat-card__label">
          <Trans i18nKey={labelKey} />
        </p>
        {Icon ? (
          <div
            className={cn(
              'kinder-stat-card__icon',
              toneIconStyles[tone],
            )}
          >
            <Icon className="size-6" />
          </div>
        ) : null}
      </div>
      <p className="kinder-stat-card__value">{value}</p>
      {trend ? (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-semibold tabular-nums',
              trendDirectionStyles[trendDirection],
            )}
          >
            {trend}
          </span>
          <span className="text-muted-foreground">
            <Trans i18nKey={trendLabelKey} />
          </span>
        </p>
      ) : null}
    </>
  );

  const cardClass = cn(
    'kinder-stat-card kinder-bento-tile-interactive',
    href && 'group cursor-pointer',
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

export function MiniStatCard({
  labelKey,
  value,
  className,
}: {
  labelKey: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('kinder-stat-inline', className)}>
      <p className="kinder-stat-card__label">
        <Trans i18nKey={labelKey} />
      </p>
      <p className="text-foreground mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

export function SectionCard({
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
    <section className={cn('border rounded-lg overflow-hidden p-0', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <h3 className="kinder-section-title">{title}</h3>
          {action}
        </div>
      ) : null}
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}
