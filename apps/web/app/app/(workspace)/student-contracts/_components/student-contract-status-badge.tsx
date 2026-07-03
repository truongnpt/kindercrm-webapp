'use client';

import { Trans } from '@kit/ui/trans';

import { StatusBadge } from '~/components/kinder-ui';
import type { StudentContractStatus } from '~/lib/kinder/student-contracts/types';

const STATUS_TONE: Record<
  StudentContractStatus,
  'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'
> = {
  draft: 'muted',
  active: 'success',
  expired: 'warning',
  terminated: 'danger',
  cancelled: 'muted',
};

export function StudentContractStatusBadge({
  status,
}: {
  status: StudentContractStatus;
}) {
  return (
    <StatusBadge tone={STATUS_TONE[status]}>
      <Trans i18nKey={`kinder:studentContracts.statuses.${status}`} />
    </StatusBadge>
  );
}
