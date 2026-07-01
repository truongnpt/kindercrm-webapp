import { cn } from '@kit/ui/utils';

export function DataTableShell({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('kinder-data-table overflow-x-auto', className)}>
      {children}
    </div>
  );
}

export function DataTableToolbar({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('kinder-toolbar sticky top-0 z-10', className)}>
      {children}
    </div>
  );
}
