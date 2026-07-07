import Link from 'next/link';

import { Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { InlineAlert } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  getTrialDaysRemaining,
  shouldShowTrialBanner,
} from '~/lib/kinder/subscription/package-features';
import type { Package, SchoolSubscription } from '~/lib/kinder/types';

export function TrialBanner({
  subscription,
  package: pkg,
}: {
  subscription: SchoolSubscription | null;
  package: Package | null;
}) {
  if (!shouldShowTrialBanner(subscription, pkg)) {
    return null;
  }

  const daysRemaining = getTrialDaysRemaining(subscription);
  const trialEnds = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at).toLocaleDateString()
    : null;
  const urgent = daysRemaining !== null && daysRemaining <= 3;

  const messageKey =
    daysRemaining === 0
      ? 'kinder:subscription.trialBanner.messageToday'
      : daysRemaining === 1
        ? 'kinder:subscription.trialBanner.messageOneDay'
        : 'kinder:subscription.trialBanner.message';

  return (
    <div className="mb-6">
      <InlineAlert
        className="rounded-2xl border-primary/20 bg-primary/5"
        icon={Sparkles}
        title={<Trans i18nKey="kinder:subscription.trialBanner.title" />}
        tone={urgent ? 'warning' : 'default'}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {daysRemaining === null ? (
              <Trans i18nKey="kinder:subscription.trialBanner.messageOpenEnded" />
            ) : (
              <Trans
                i18nKey={messageKey}
                values={{
                  count: daysRemaining,
                  date: trialEnds ?? '',
                }}
              />
            )}
          </p>
          <Button asChild className="shrink-0" size="sm">
            <Link href={pathsConfig.app.settingsSubscription}>
              <Trans i18nKey="kinder:subscription.trialBanner.upgradeCta" />
            </Link>
          </Button>
        </div>
      </InlineAlert>
    </div>
  );
}
