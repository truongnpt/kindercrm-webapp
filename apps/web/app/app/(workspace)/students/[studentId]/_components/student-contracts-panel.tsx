'use client';

import Link from 'next/link';

import { ExternalLink, FileSignature, Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  PanelEmpty,
} from '~/components/kinder-ui';
import { StudentContractsExportMenu } from '~/components/student-contracts/student-contracts-export-menu';
import pathsConfig from '~/config/paths.config';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { TuitionFeeItem } from '~/lib/kinder/finance/types';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

import { CreateStudentContractDialog } from '../../../student-contracts/_components/create-student-contract-dialog';
import { StudentContractRowActions } from '../../../student-contracts/_components/student-contract-row-actions';
import { StudentContractStatusBadge } from '../../../student-contracts/_components/student-contract-status-badge';

export function StudentContractsPanel({
  schoolId,
  studentId,
  studentName,
  contracts,
  students,
  feeItems,
  canManage,
}: {
  schoolId: string;
  studentId: string;
  studentName: string;
  contracts: StudentContractWithInvoice[];
  students: Array<{
    id: string;
    full_name: string;
    student_code: string;
    class_name: string | null;
  }>;
  feeItems: TuitionFeeItem[];
  canManage: boolean;
}) {
  const activeContract = contracts.find((contract) => contract.status === 'active');
  const studentCode =
    contracts[0]?.student.student_code ??
    students.find((student) => student.id === studentId)?.student_code;

  return (
    <BentoTile>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <BentoTileHeader
          description={<Trans i18nKey="kinder:studentContracts.studentHint" />}
          title={<Trans i18nKey="kinder:studentContracts.title" />}
        />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StudentContractsExportMenu
            contracts={contracts}
            includeStudentColumns={false}
            studentCode={studentCode}
            studentName={studentName}
          />

          {canManage ? (
            <CreateStudentContractDialog
              defaultStudentId={studentId}
              feeItems={feeItems}
              schoolId={schoolId}
              students={students}
              trigger={
                <Button className="shrink-0" size="sm" type="button" variant="outline">
                  <Plus className="mr-1.5 size-4" />
                  <Trans i18nKey="kinder:studentContracts.create" />
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      {activeContract ? (
        <div className="bg-primary/5 mt-4 rounded-2xl border border-primary/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              <Trans i18nKey="kinder:studentContracts.activeContract" />
            </p>
            <StudentContractStatusBadge status={activeContract.status} />
          </div>
          <p className="mt-2 font-semibold">{activeContract.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeContract.contract_number} ·{' '}
            <Trans
              i18nKey={`kinder:studentContracts.types.${activeContract.contract_type}`}
            />
          </p>
          <p className="mt-2 font-medium">
            {formatVnd(activeContract.total_amount)}
          </p>
        </div>
      ) : null}

      {contracts.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {contracts.map((contract) => (
            <li
              className="rounded-2xl border border-border bg-muted/20 p-4"
              key={contract.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileSignature className="text-primary size-4 shrink-0" />
                    <p className="font-medium">{contract.title}</p>
                    <StudentContractStatusBadge status={contract.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {contract.contract_number} ·{' '}
                    <Trans
                      i18nKey={`kinder:studentContracts.types.${contract.contract_type}`}
                    />
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {contract.start_date}
                    {contract.end_date ? ` → ${contract.end_date}` : ''}
                  </p>
                  <p className="mt-2 font-medium">
                    {formatVnd(contract.total_amount)}
                  </p>
                  {contract.invoice ? (
                    <Link
                      className="text-primary mt-2 inline-flex items-center gap-1 text-sm hover:underline"
                      href={`${pathsConfig.app.financeInvoice}/${contract.invoice.id}`}
                    >
                      <Trans i18nKey="kinder:studentContracts.viewInvoice" />:{' '}
                      {contract.invoice.invoice_number}
                      <ExternalLink className="size-3" />
                    </Link>
                  ) : null}
                </div>

                {canManage ? (
                  <StudentContractRowActions
                    contract={contract}
                    schoolId={schoolId}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <PanelEmpty messageKey="kinder:studentContracts.studentEmpty" />
        </div>
      )}

      <div className="mt-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={pathsConfig.app.studentContracts}>
            <Trans
              i18nKey="kinder:studentContracts.viewAllForStudent"
              values={{ name: studentName }}
            />
          </Link>
        </Button>
      </div>
    </BentoTile>
  );
}
