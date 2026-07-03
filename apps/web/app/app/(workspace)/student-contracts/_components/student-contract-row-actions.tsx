'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { kinderQueryKeys, useKinderMutation } from '~/components/kinder-ui';
import { updateStudentContractStatusAction } from '~/lib/kinder/student-contracts/server-actions';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

export function StudentContractRowActions({
  contract,
  schoolId,
}: {
  contract: StudentContractWithInvoice;
  schoolId: string;
}) {
  const router = useRouter();

  const updateStatus = useKinderMutation({
    mutationFn: updateStudentContractStatusAction,
    invalidateKeys: [
      kinderQueryKeys.students.contracts(schoolId),
      kinderQueryKeys.students.detail(schoolId, contract.student_id),
    ],
    onSuccess: () => {
      toast.success('Contract updated');
      router.refresh();
    },
  });

  const actions: Array<{
    status: 'active' | 'terminated' | 'cancelled' | 'expired';
    labelKey: string;
    show: boolean;
  }> = [
    {
      status: 'active',
      labelKey: 'kinder:studentContracts.actions.activate',
      show: contract.status === 'draft',
    },
    {
      status: 'cancelled',
      labelKey: 'kinder:studentContracts.actions.cancel',
      show: contract.status === 'draft',
    },
    {
      status: 'terminated',
      labelKey: 'kinder:studentContracts.actions.terminate',
      show: contract.status === 'active' || contract.status === 'expired',
    },
    {
      status: 'expired',
      labelKey: 'kinder:studentContracts.actions.markExpired',
      show: contract.status === 'active',
    },
  ];

  const visibleActions = actions.filter((action) => action.show);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Trans i18nKey="kinder:ui.actions" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action) => (
          <DropdownMenuItem
            key={action.status}
            onClick={() =>
              updateStatus.mutate({
                schoolId,
                contractId: contract.id,
                status: action.status,
              })
            }
          >
            <Trans i18nKey={action.labelKey} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
