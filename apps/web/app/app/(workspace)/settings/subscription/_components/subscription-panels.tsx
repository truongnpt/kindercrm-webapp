import { History } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { EmptyState, SectionCard } from '~/components/kinder-ui';
import type { Package } from '~/lib/kinder/types';

type HistoryItem = {
  id: string;
  package_id: string;
  previous_package_id: string | null;
  created_at: string;
  note: string | null;
};

export function SubscriptionHistoryPanel({
  history,
  packageMap,
}: {
  history: HistoryItem[];
  packageMap: Map<string, Package>;
}) {
  if (history.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={History}
        titleKey="kinder:subscription.historyEmpty"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {history.map((item) => (
        <li className="kinder-mobile-card text-sm" key={item.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              {packageMap.get(item.package_id)?.name ?? item.package_id}
            </span>
            <span className="text-muted-foreground">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>
          {item.previous_package_id ? (
            <p className="text-muted-foreground mt-1">
              {packageMap.get(item.previous_package_id)?.name ??
                item.previous_package_id}{' '}
              → {packageMap.get(item.package_id)?.name}
            </p>
          ) : null}
          {item.note ? (
            <p className="text-muted-foreground mt-1">{item.note}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function SubscriptionPlanPanel({
  currentPackageName,
  isTrial,
  trialEnds,
}: {
  currentPackageName: string;
  isTrial: boolean;
  trialEnds: string | null;
}) {
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
        {isTrial ? (
          <Badge variant="secondary">
            <Trans i18nKey="kinder:subscription.trialBadge" />
          </Badge>
        ) : (
          <Badge>
            <Trans i18nKey="kinder:subscription.activeBadge" />
          </Badge>
        )}
      </div>
      {isTrial && trialEnds ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <Trans
            i18nKey="kinder:subscription.trialFullAccess"
            values={{ date: trialEnds }}
          />
        </p>
      ) : null}
    </SectionCard>
  );
}
