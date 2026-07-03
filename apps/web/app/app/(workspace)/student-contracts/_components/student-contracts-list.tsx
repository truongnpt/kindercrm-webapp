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

export function StudentContractsList({
  contracts,
  canManage,
  schoolId,
}: {
  contracts: StudentContractWithInvoice[];
  canManage: boolean;
  schoolId: string;
}) {
  if (contracts.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:studentContracts.emptyDescription"
        icon={FileSignature}
        titleKey="kinder:studentContracts.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:studentContracts.listDescription" />
          }
          title={<Trans i18nKey="kinder:studentContracts.listTitle" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:studentContracts.number" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.student" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.type" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.period" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.amount" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.status" />
                </th>
                <th>
                  <Trans i18nKey="kinder:studentContracts.invoice" />
                </th>
                {canManage ? <th className="w-28" /> : null}
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="font-medium">{contract.contract_number}</td>
                  <td>
                    <Link
                      className="text-primary hover:underline"
                      href={`${pathsConfig.app.studentDetail}/${contract.student.id}`}
                    >
                      {contract.student.full_name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {contract.student.student_code}
                      {contract.student.class_name
                        ? ` · ${contract.student.class_name}`
                        : ''}
                    </p>
                  </td>
                  <td>
                    <Trans
                      i18nKey={`kinder:studentContracts.types.${contract.contract_type}`}
                    />
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {contract.title}
                    </p>
                  </td>
                  <td>
                    {contract.start_date}
                    {contract.end_date ? ` → ${contract.end_date}` : ''}
                  </td>
                  <td>{formatVnd(contract.total_amount)}</td>
                  <td>
                    <StudentContractStatusBadge status={contract.status} />
                  </td>
                  <td>
                    {contract.invoice ? (
                      <Link
                        className="text-primary inline-flex items-center gap-1 hover:underline"
                        href={`${pathsConfig.app.financeInvoice}/${contract.invoice.id}`}
                      >
                        {contract.invoice.invoice_number}
                        <ExternalLink className="size-3" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  {canManage ? (
                    <td>
                      <StudentContractRowActions
                        contract={contract}
                        schoolId={schoolId}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {contracts.map((contract) => (
          <article
            className="kinder-mobile-card flex flex-col gap-3 p-4"
            key={contract.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{contract.contract_number}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {contract.title}
                </p>
              </div>
              <StudentContractStatusBadge status={contract.status} />
            </div>

            <div className="text-sm">
              <Link
                className="text-primary font-medium hover:underline"
                href={`${pathsConfig.app.studentDetail}/${contract.student.id}`}
              >
                {contract.student.full_name}
              </Link>
              <p className="text-muted-foreground mt-1">
                <Trans
                  i18nKey={`kinder:studentContracts.types.${contract.contract_type}`}
                />{' '}
                · {contract.start_date}
                {contract.end_date ? ` → ${contract.end_date}` : ''}
              </p>
              <p className="mt-2 font-medium">
                {formatVnd(contract.total_amount)}
              </p>
            </div>

            {contract.invoice ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`${pathsConfig.app.financeInvoice}/${contract.invoice.id}`}
                >
                  <Trans i18nKey="kinder:studentContracts.viewInvoice" />
                </Link>
              </Button>
            ) : null}

            {canManage ? (
              <StudentContractRowActions
                contract={contract}
                schoolId={schoolId}
              />
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
