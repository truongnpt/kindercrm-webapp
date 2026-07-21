'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const updateParams = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('limit', String(value));

    const query = params.toString();
    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  return (
    <div className={cn('kinder-pagination', className)}>
      <p className="text-muted-foreground text-sm">
        <Trans
          i18nKey="kinder:ui.paginationSummary"
          values={{ from, to, total: totalItems }}
        />
      </p>

      <div className="flex items-center gap-2">
       <div className='flex gap-2 items-center w-50'>
        <span className='w-40 text-right'>
          <Trans i18nKey="kinder:ui.rows" />
        </span>
        <Select
       onValueChange={(value) => updateParams(value)}
        value={String(pageSize)}
       >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
       </div>
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">
            <Trans i18nKey="kinder:ui.previous" />
          </span>
        </Button>

        <span className="text-muted-foreground px-1 text-sm tabular-nums min-w-[100px] text-center">
          <Trans
            i18nKey="kinder:ui.pageOf"
            values={{ page, totalPages: Math.max(totalPages, 1) }}
          />
        </span>

        <Button
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
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
