import Link from 'next/link';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { InlineAlert } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { QuotaKind } from '~/lib/kinder/subscription/quota-suggestions';

export function QuotaLimitBanner({
  kind,
  used,
  max,
  currentPackageName,
  suggestedPackageName,
  atLimit,
  nearLimit,
}: {
  kind: QuotaKind;
  used: number;
  max: number;
  currentPackageName: string;
  suggestedPackageName: string | null;
  atLimit: boolean;
  nearLimit: boolean;
}) {
  if (!atLimit && !nearLimit) {
    return null;
  }

  const titleKey =
    kind === 'students'
      ? atLimit
        ? 'kinder:subscription.quotaLimit.studentsTitle'
        : 'kinder:subscription.quotaLimit.studentsNearTitle'
      : atLimit
        ? 'kinder:subscription.quotaLimit.campusesTitle'
        : 'kinder:subscription.quotaLimit.campusesNearTitle';

  const messageKey =
    kind === 'students'
      ? atLimit
        ? 'kinder:subscription.quotaLimit.studentsMessage'
        : 'kinder:subscription.quotaLimit.studentsNearMessage'
      : atLimit
        ? 'kinder:subscription.quotaLimit.campusesMessage'
        : 'kinder:subscription.quotaLimit.campusesNearMessage';

  const suggestedKey =
    kind === 'students'
      ? 'kinder:subscription.quotaLimit.studentsSuggested'
      : 'kinder:subscription.quotaLimit.campusesSuggested';

  return (
    <InlineAlert
      className="mb-4"
      icon={AlertTriangle}
      title={<Trans i18nKey={titleKey} />}
      tone={atLimit ? 'warning' : 'default'}
    >
      <div className="flex flex-col gap-3">
        <p>
          <Trans
            i18nKey={messageKey}
            values={{
              used,
              max,
              plan: currentPackageName,
            }}
          />
        </p>
        {atLimit && suggestedPackageName ? (
          <p className="text-muted-foreground text-sm">
            <Trans
              i18nKey={suggestedKey}
              values={{ suggested: suggestedPackageName }}
            />
          </p>
        ) : null}
        {atLimit ? (
          <div>
            <Button asChild size="sm" variant="outline">
              <Link href={pathsConfig.app.settingsSubscription}>
                <Trans i18nKey="kinder:subscription.quotaLimit.upgradeCta" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </InlineAlert>
  );
}
