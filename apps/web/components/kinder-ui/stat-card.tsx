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
  tone?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
};

const toneStyles = {
  default: 'from-primary/10 to-primary/5 text-primary',
  success: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600',
  warning: 'from-amber-500/10 to-amber-500/5 text-amber-600',
  info: 'from-sky-500/10 to-sky-500/5 text-sky-600',
};

export function StatCard({
  labelKey,
  value,
  href,
  icon: Icon,
  trend,
  tone = 'default',
  className,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">
          <Trans i18nKey={labelKey} />
        </p>
        {Icon ? (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
              toneStyles[tone],
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
      <p className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
      {trend ? (
        <p className="text-muted-foreground mt-1 text-xs">{trend}</p>
      ) : null}
    </>
  );

  const cardClass = cn(
    'kinder-surface-interactive flex flex-col p-5 sm:p-6',
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
    <div className={cn('kinder-surface p-4 sm:p-5', className)}>
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey={labelKey} />
      </p>
      <p className="text-foreground mt-2 text-xl font-semibold">{value}</p>
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
    <section className={cn('kinder-surface overflow-hidden', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 bg-muted/20 px-5 py-4">
          <h3 className="kinder-section-title">{title}</h3>
          {action}
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
