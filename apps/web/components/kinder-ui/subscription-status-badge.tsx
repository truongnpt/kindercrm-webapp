import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import type { SubscriptionDisplayStatus } from '~/lib/kinder/types';

const STATUS_VARIANT: Record<
  SubscriptionDisplayStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  trial: 'secondary',
  trial_expired: 'outline',
  active: 'default',
  past_due: 'destructive',
  cancelled: 'outline',
};

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionDisplayStatus | string | null | undefined;
}) {
  if (!status) {
    return null;
  }

  const normalized = status as SubscriptionDisplayStatus;
  const variant = STATUS_VARIANT[normalized] ?? 'outline';

  return (
    <Badge className="rounded-full" variant={variant}>
      <Trans i18nKey={`kinder:subscription.status.${normalized}`} />
    </Badge>
  );
}
