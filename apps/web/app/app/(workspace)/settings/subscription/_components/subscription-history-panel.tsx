'use client';

import { ExternalLink, History } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { EmptyState, SubscriptionStatusBadge } from '~/components/kinder-ui';
import {
  resolveSubscriptionHistoryActorLabel,
  type SubscriptionHistoryEntry,
} from '~/lib/kinder/subscription/subscription-history';
import type { Package } from '~/lib/kinder/types';

function HistoryActorLabel({
  entry,
}: {
  entry: SubscriptionHistoryEntry;
}) {
  const actorKind = resolveSubscriptionHistoryActorLabel(entry);

  if (actorKind === 'user' && entry.changed_by_name) {
    return (
      <Trans
        i18nKey="kinder:subscription.history.changedBy"
        values={{ name: entry.changed_by_name }}
      />
    );
  }

  if (actorKind === 'stripe') {
    return <Trans i18nKey="kinder:subscription.history.changedByStripe" />;
  }

  return <Trans i18nKey="kinder:subscription.history.changedBySystem" />;
}

export function SubscriptionHistoryPanel({
  history,
  packageMap,
}: {
  history: SubscriptionHistoryEntry[];
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
      {history.map((item) => {
        const packageName =
          packageMap.get(item.package_id)?.name ?? item.package_id;
        const previousPackageName = item.previous_package_id
          ? (packageMap.get(item.previous_package_id)?.name ??
            item.previous_package_id)
          : null;

        return (
          <li className="kinder-mobile-card text-sm" key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground font-medium">
                    {packageName}
                  </span>
                  <SubscriptionStatusBadge status={item.status} />
                </div>

                {previousPackageName ? (
                  <p className="text-muted-foreground">
                    <Trans
                      i18nKey="kinder:subscription.history.planChange"
                      values={{
                        from: previousPackageName,
                        to: packageName,
                      }}
                    />
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    <Trans
                      i18nKey="kinder:subscription.history.initialPlan"
                      values={{ plan: packageName }}
                    />
                  </p>
                )}
              </div>

              <time
                className="text-muted-foreground shrink-0 text-xs sm:text-sm"
                dateTime={item.created_at}
              >
                {new Date(item.created_at).toLocaleString()}
              </time>
            </div>

            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span>
                <HistoryActorLabel entry={item} />
              </span>

              {item.stripe_invoice_url ? (
                <a
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                  href={item.stripe_invoice_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Trans i18nKey="kinder:subscription.history.invoiceLink" />
                  <ExternalLink className="size-3" />
                </a>
              ) : item.stripe_invoice_id ? (
                <span className="text-muted-foreground/80">
                  <Trans
                    i18nKey="kinder:subscription.history.invoiceId"
                    values={{ id: item.stripe_invoice_id }}
                  />
                </span>
              ) : null}
            </div>

            {item.note ? (
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                {item.note}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
