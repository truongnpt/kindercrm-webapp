'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@kit/ui/table';

export interface BaseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];

  loading?: boolean;

  searchable?: boolean;

  searchPlaceholder?: string;

  toolbarActions?: React.ReactNode;

  emptyText?: string;

  pageSizeOptions?: number[];
}

export function BaseTable<TData>({
  data,
  columns,

  loading = false,

  searchable = true,

  searchPlaceholder = 'Search...',

  toolbarActions,

  emptyText = 'No data found.',

  pageSizeOptions = [10, 20, 50],
}: BaseTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,

    columns,

    state: {
      globalFilter,
      pagination,
    },

    onGlobalFilterChange: setGlobalFilter,

    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    globalFilterFn: 'includesString',
  });

  return (
    <div className="space-y-4">

      {/* Toolbar */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        {searchable && (
          <div className="relative w-full md:max-w-sm">

            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />

            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
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
                  {emptyText}
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

      {/* Pagination */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} item(s)
        </p>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">

            <span className="text-sm">
              Rows
            </span>

            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) =>
                table.setPageSize(Number(value))
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                {pageSizeOptions.map((size) => (

                  <SelectItem
                    key={size}
                    value={String(size)}
                  >
                    {size}
                  </SelectItem>

                ))}

              </SelectContent>

            </Select>

          </div>

          <span className="text-sm">

            Page{' '}

            <strong>

              {table.getState().pagination.pageIndex + 1}

            </strong>

            {' / '}

            {table.getPageCount()}

          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>

        </div>

      </div>

    </div>
  );
}