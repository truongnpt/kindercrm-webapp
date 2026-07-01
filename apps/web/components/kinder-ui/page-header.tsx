import { cn } from '@kit/ui/utils';

import { PageBreadcrumb, type BreadcrumbItem } from './page-breadcrumb';

export function KinderPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4', className)}>
      {breadcrumbs?.length ? <PageBreadcrumb items={breadcrumbs} /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="kinder-page-title">{title}</h1>
          {description ? (
            <p className="kinder-page-description">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="kinder-page-actions flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function KinderPageBody({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex w-full flex-1 flex-col gap-6', className)}>
      {children}
    </div>
  );
}
