import type { LucideIcon } from 'lucide-react';

import { cn } from '@kit/ui/utils';

const toneStyles = {
  default: 'bg-primary/10 text-foreground',
  success: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  warning: 'bg-amber-500/10 text-amber-900 dark:text-amber-100',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-sky-500/10 text-sky-900 dark:text-sky-100',
} as const;

export function InlineAlert({
  icon: Icon,
  title,
  children,
  tone = 'default',
  className,
}: React.PropsWithChildren<{
  icon?: LucideIcon;
  title?: React.ReactNode;
  tone?: keyof typeof toneStyles;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border-0 px-4 py-3.5',
        toneStyles[tone],
        className,
      )}
      role="status"
    >
      {Icon ? (
        <Icon className="mt-0.5 size-5 shrink-0 opacity-80" />
      ) : null}
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? (
          <div className={cn('opacity-90', title && 'mt-0.5')}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
