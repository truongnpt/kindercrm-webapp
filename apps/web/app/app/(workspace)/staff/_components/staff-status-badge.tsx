import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

const STATUS_VARIANT: Record<
  StaffEmployeeListItem['employment_status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  inactive: 'secondary',
  on_leave: 'outline',
  terminated: 'destructive',
};

export function StaffStatusBadge({
  status,
}: {
  status: StaffEmployeeListItem['employment_status'];
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      <Trans i18nKey={`kinder:staff.statuses.${status}`} />
    </Badge>
  );
}
