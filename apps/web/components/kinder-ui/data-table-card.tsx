import { cn } from '@kit/ui/utils';

import { DataTableShell } from './data-table-shell';

export function DataTableCard({
  title,
  description,
  toolbar,
  actions,
  footer,
  children,
  className,
  tableClassName,
}: React.PropsWithChildren<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  tableClassName?: string;
}>) {
  const hasHeader = title || description || toolbar || actions;

  return (
    <section className={cn('kinder-data-table-card', className)}>
      {hasHeader ? (
        <div className="kinder-data-table-card__header">
          <div className="min-w-0 flex-1">
            {title ? (
              <h3 className="kinder-data-table-card__title">{title}</h3>
            ) : null}
            {description ? (
              <p className="kinder-data-table-card__description">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}

      {toolbar ? (
        <div className="kinder-data-table-card__toolbar">{toolbar}</div>
      ) : null}

      <DataTableShell className={cn('rounded-none border-0 shadow-none', tableClassName)}>
        {children}
      </DataTableShell>

      {footer ? (
        <div className="kinder-data-table-card__footer">{footer}</div>
      ) : null}
    </section>
  );
}
