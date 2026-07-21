'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FileX, LucideIcon, Search } from 'lucide-react';

import { Input } from '@kit/ui/input';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@kit/ui/table';
import { EmptyState, PaginationBar } from '@/components/kinder-ui';
import { Pagination } from '@/lib/kinder/types/pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import pathsConfig from '@/config/paths.config';
import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '@/lib/i18n/i18n.server';
import { useTranslation } from 'react-i18next';

export interface BaseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];

  pagination?: Pagination

  loading?: boolean;

  searchable?: boolean;

  searchPlaceholder?: string;

  toolbarActions?: React.ReactNode;

  emptyText?: string;

  emptyDescription?: string;

  emptyIcon?: LucideIcon;

  pageSizeOptions?: number[];
}

export function BaseTable<TData>({
  data,
  columns,
  pagination,

  loading = false,

  searchable = true,

  searchPlaceholder = 'kinder:ui.search',

  toolbarActions,

  emptyText = 'kinder:ui.emptyDefaultDescription',

  emptyDescription = 'kinder:ui.emptyDefaultDescription',

  emptyIcon = FileX,

}: BaseTableProps<TData>) {
  const { t } = useTranslation('kinder');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get('search') || "";
  const router = useRouter();
  const currentPage = searchParams.get('page') ?? '1';


  const [paginateState, setPaginateState] = React.useState({
    pageIndex: Number(currentPage ?? 1) - 1,
    pageSize: pagination?.limit ?? 10,
  });

  const onChangePage = React.useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', String(page));
    setPaginateState({
      ...paginateState,
      pageIndex: page - 1
    })

    const query = params.toString();
    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }, [paginateState, setPaginateState])

  const onSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    setTimeout(() => {
      if (!!value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      const query = params.toString();
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
      );
      
    }, 2000)
  }

  const table = useReactTable({
    data,

    columns,

    getCoreRowModel: getCoreRowModel(),

  });

  return (
    <div className="space-y-4">

      {/* Toolbar */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        {searchable && (
          <div className="relative w-full md:max-w-sm">

            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />

            <Input
              defaultValue={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t(searchPlaceholder)}
              className="pl-9"
            />
          </div>
        )}

        <div className="flex items-center gap-2 justify-end  md:flex-1">
          {toolbarActions}
        </div>
      </div>

      {/* Table */}

      <div className="rounded-lg border overflow-hidden">

        <Table>

          <TableHeader>

            {table.getHeaderGroups().map((headerGroup) => (

              <TableRow key={headerGroup.id}>

                {headerGroup.headers.map((header) => (

                  <TableHead key={header.id}>

                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                  </TableHead>

                ))}

              </TableRow>

            ))}

          </TableHeader>

          <TableBody>

            {loading ? (

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  Loading...
                </TableCell>

              </TableRow>

            ) : table.getRowModel().rows.length ? (

              table.getRowModel().rows.map((row) => (

                <TableRow key={row.id}>

                  {row.getVisibleCells().map((cell) => (

                    <TableCell key={cell.id}>

                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}

                    </TableCell>

                  ))}

                </TableRow>

              ))

            ) : (

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                    <EmptyState
                      compact
                      descriptionKey={emptyDescription}
                      icon={emptyIcon}
                      titleKey={emptyText}
                    />
                  
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

      {/* Pagination */}
      <PaginationBar page={pagination?.page || 1} pageSize={pagination?.limit || 10} totalPages={pagination?.totalPages || 1} totalItems={pagination?.totalItems || 0} onPageChange={onChangePage} />


    </div>
  );
}