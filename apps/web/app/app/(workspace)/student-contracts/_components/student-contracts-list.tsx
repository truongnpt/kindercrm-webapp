'use client';

import Link from 'next/link';

import { ExternalLink, FileSignature } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

import { StudentContractRowActions } from './student-contract-row-actions';
import { StudentContractStatusBadge } from './student-contract-status-badge';
import { StudentContractsWorkspaceProps } from './student-contract-workspace';
import { ColumnDef } from '@tanstack/react-table';
import { BaseTable } from '@/app/app/_components/base-table';
import { Suspense, useMemo } from 'react';
import { StudentContractsFilters } from './student-contracts-filters';

interface StudentContractsListProps extends StudentContractsWorkspaceProps {}

export function StudentContractsList({
  data,
  canManage,
  schoolId,
}: StudentContractsListProps) {

  const columns: ColumnDef<StudentContractWithInvoice>[] = [
      {
        accessorKey: 'contract_number',
        header: () => <Trans i18nKey="kinder:studentContracts.number" />,
      },
      {
        accessorKey: 'student',
        header: () => <Trans i18nKey="kinder:studentContracts.student" />,
        cell: ({ row }) => (
          <Link
            className="font-medium hover:text-primary hover:underline"
            href={`${pathsConfig.app.studentDetail}/${row.original.student.id}`}
          >
            {row.original.student.full_name}
          </Link>
        ),
      },
      {
        accessorKey: 'contract_type',
        header: () => <Trans i18nKey="kinder:studentContracts.type" />,
      },
      {
        accessorKey: 'period',
        header: () => <Trans i18nKey="kinder:studentContracts.period" />,
      },
      {
        accessorKey: 'total_amount',
        header: () => <Trans i18nKey="kinder:studentContracts.amount" />,
      },
      {
        accessorKey: 'status',
        header: () => <Trans i18nKey="kinder:studentContracts.status" />,
      },
      {
        accessorKey: 'invoice',
        header: () => <Trans i18nKey="kinder:studentContracts.invoice" />,
        cell: ({ row }) => {
          if (!row?.original?.invoice) return null
          return (
            <Link
            className="text-primary inline-flex items-center gap-1 hover:underline"
            href={`${pathsConfig.app.financeInvoice}/${row.original.invoice.id}`}
          >
            {row.original.invoice.invoice_number}
            <ExternalLink className="size-3" />
          </Link>
          )
        }
      },
      {
        accessorKey: 'actions',
        header: () => null,
        cell: ({ row }) => (
          <>{canManage && (
            <StudentContractRowActions
            contract={row.original}
            schoolId={schoolId}
          />
          )}</>
        ),
      },
    ];

      const toolbar = useMemo<React.ReactNode>(() => (
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Suspense>
            <StudentContractsFilters />
          </Suspense>
          {/* <StudentImportExport schoolId={schoolId} students={data.data} /> */}
        </div>
      ), [])

  return (
    <>
    <BaseTable columns={columns} data={data.data} pagination={data.pagination} toolbarActions={toolbar} />
    </>
  );
}
