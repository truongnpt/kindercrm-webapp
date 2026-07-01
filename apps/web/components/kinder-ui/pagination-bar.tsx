'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  className?: string;
}) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className={cn('kinder-pagination', className)}>
      <p className="text-muted-foreground text-sm">
        <Trans
          i18nKey="kinder:ui.paginationSummary"
          values={{ from, to, total: totalItems }}
        />
      </p>

      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">
            <Trans i18nKey="kinder:ui.previous" />
          </span>
        </Button>

        <span className="text-muted-foreground px-1 text-sm tabular-nums">
          <Trans
            i18nKey="kinder:ui.pageOf"
            values={{ page, totalPages: Math.max(totalPages, 1) }}
          />
        </span>

        <Button
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          <span className="hidden sm:inline">
            <Trans i18nKey="kinder:ui.next" />
          </span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
