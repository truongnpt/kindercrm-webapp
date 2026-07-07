import { Trans } from '@kit/ui/trans';

import { SectionCard, SubscriptionStatusBadge } from '~/components/kinder-ui';
import type {
  SubscriptionDisplayStatus,
  SubscriptionStatus,
} from '~/lib/kinder/types';

export { SubscriptionHistoryPanel } from './subscription-history-panel';

export function SubscriptionPlanPanel({
  currentPackageName,
  subscriptionStatus,
  displayStatus,
  trialEnds,
  effectivePackageName,
  pastDueGraceDaysRemaining,
  isPastDueGraceExpired,
}: {
  currentPackageName: string;
  subscriptionStatus: SubscriptionStatus | null;
  displayStatus: SubscriptionDisplayStatus | null;
  trialEnds: string | null;
  effectivePackageName?: string | null;
  pastDueGraceDaysRemaining?: number | null;
  isPastDueGraceExpired?: boolean;
}) {
  const showEffectiveNote =
    effectivePackageName &&
    effectivePackageName !== currentPackageName &&
    (subscriptionStatus === 'cancelled' || isPastDueGraceExpired);

  return (
    <SectionCard>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:subscription.currentPlan" />
          </p>
          <p className="text-foreground text-2xl font-semibold tracking-tight">
            {currentPackageName}
          </p>
        </div>
        {displayStatus ? (
          <SubscriptionStatusBadge status={displayStatus} />
        ) : (
          <SubscriptionStatusBadge status="active" />
        )}
      </div>
      {displayStatus === 'trial' && trialEnds ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <Trans
            i18nKey="kinder:subscription.trialFullAccess"
            values={{ date: trialEnds }}
          />
        </p>
      ) : null}
      {displayStatus === 'trial_expired' && trialEnds ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <Trans
            i18nKey="kinder:dashboard.trialExpired"
            values={{ date: trialEnds }}
          />
        </p>
      ) : null}
      {subscriptionStatus === 'past_due' && !isPastDueGraceExpired ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <Trans
            i18nKey="kinder:subscription.pastDueGraceHint"
            values={{ count: pastDueGraceDaysRemaining ?? 0 }}
          />
        </p>
      ) : null}
      {showEffectiveNote ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <Trans
            i18nKey="kinder:subscription.effectivePlanNote"
            values={{ plan: effectivePackageName }}
          />
        </p>
      ) : null}
    </SectionCard>
  );
}
