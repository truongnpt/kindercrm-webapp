import { cn } from '@kit/ui/utils';

const COL_SPAN = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  4: 'col-span-full lg:col-span-4',
  full: 'col-span-full',
} as const;

export function BentoGrid({
  children,
  className,
  columns = 4,
}: React.PropsWithChildren<{
  className?: string;
  columns?: 2 | 3 | 4;
}>) {
  const colClass =
    columns === 2 ? 'sm:grid-cols-2'
    : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3'
    : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div
      className={cn(
        'grid auto-rows-min grid-cols-1 gap-4',
        colClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoTile({
  children,
  className,
  colSpan = 1,
  interactive,
  padding = 'default',
}: React.PropsWithChildren<{
  className?: string;
  colSpan?: keyof typeof COL_SPAN;
  interactive?: boolean;
  padding?: 'none' | 'default' | 'compact';
}>) {
  const paddingClass =
    padding === 'none' ? 'p-0'
    : padding === 'compact' ? 'p-4'
    : 'p-5 sm:p-6';

  return (
    <article
      className={cn(
        'kinder-bento-tile',
        COL_SPAN[colSpan],
        paddingClass,
        interactive && 'kinder-bento-tile-interactive',
        className,
      )}
    >
      {children}
    </article>
  );
}

export function BentoTileHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'kinder-bento-tile-header',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="kinder-section-title">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
