import Link from 'next/link';

import { ChevronRight, Home } from 'lucide-react';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
};

export function PageBreadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('kinder-breadcrumb', className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li className="flex items-center gap-1.5">
          <Link
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
            href="/app"
          >
            <Home className="size-3.5" />
            <span className="sr-only sm:not-sr-only">
              <Trans i18nKey="kinder:ui.home" />
            </span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              className="flex min-w-0 items-center gap-1.5"
              key={`${index}-${String(item.href ?? item.label)}`}
            >
              <ChevronRight
                aria-hidden
                className="text-muted-foreground size-3.5 shrink-0"
              />
              {item.href && !isLast ? (
                <Link
                  className="text-muted-foreground hover:text-primary truncate transition-colors"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'truncate',
                    isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
