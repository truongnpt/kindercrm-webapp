'use client';

import { useTranslation } from 'react-i18next';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import {
  kinderQueryKeys,
  KinderSubmitButton,
  PricingCard,
  PricingGrid,
  useKinderMutation,
} from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { hasPackageFeature } from '~/lib/kinder/subscription/package-features';
import { changePackageAction } from '~/lib/kinder/subscription/server-actions';
import type { Package } from '~/lib/kinder/types';

export function SubscriptionPlans({
  packages,
  currentPackageId,
  schoolId,
  isOwner,
}: {
  packages: Package[];
  currentPackageId: string | null;
  schoolId: string;
  isOwner: boolean;
}) {
  return (
    <PricingGrid>
      {packages.map((pkg) => (
        <PlanCard
          currentPackageId={currentPackageId}
          isOwner={isOwner}
          key={pkg.id}
          pkg={pkg}
          schoolId={schoolId}
        />
      ))}
    </PricingGrid>
  );
}

function PlanCard({
  pkg,
  currentPackageId,
  schoolId,
  isOwner,
}: {
  pkg: Package;
  currentPackageId: string | null;
  schoolId: string;
  isOwner: boolean;
}) {
  const { t } = useTranslation('kinder');
  const isCurrent = pkg.id === currentPackageId;
  const isEnterprise = pkg.code === 'enterprise';
  const isRecommended = pkg.code === 'pro';

  const changePackage = useKinderMutation({
    mutationFn: changePackageAction,
    invalidateKeys: [
      kinderQueryKeys.subscription(schoolId),
      kinderQueryKeys.school(schoolId),
    ],
    toast: {
      loading: t('subscription.changing'),
      success: t('subscription.changed'),
      error: t('ui.toast.error'),
    },
  });

  const onSelect = () => {
    changePackage.mutate({ schoolId, packageId: pkg.id });
  };

  const features = [
    <Trans
      i18nKey="kinder:subscription.maxStudents"
      key="students"
      values={{ count: pkg.max_students }}
    />,
    <Trans
      i18nKey="kinder:subscription.maxCampuses"
      key="campuses"
      values={{ count: pkg.max_campuses }}
    />,
    ...(hasPackageFeature(pkg, 'crm') ? ['CRM'] : []),
    ...(hasPackageFeature(pkg, 'classes') ? ['Classes'] : []),
  ];

  return (
    <PricingCard
      badge={
        isCurrent ? (
          <Badge className="rounded-md">
            <Trans i18nKey="kinder:subscription.current" />
          </Badge>
        ) : isRecommended ? (
          <Badge className="bg-primary/10 text-primary rounded-md border-primary/20">
            <Trans i18nKey="kinder:subscription.recommended" />
          </Badge>
        ) : undefined
      }
      description={pkg.description}
      features={features}
      footer={
        isCurrent ? (
          <Button className="w-full rounded-lg" disabled variant="secondary">
            <Trans i18nKey="kinder:subscription.current" />
          </Button>
        ) : isEnterprise ? (
          <Button className="w-full rounded-lg" disabled variant="outline">
            <Trans i18nKey="kinder:subscription.enterpriseContact" />
          </Button>
        ) : (
          <KinderSubmitButton
            className="w-full rounded-lg"
            disabled={!isOwner}
            loading={changePackage.isPending}
            onClick={onSelect}
            variant="default"
          >
            <Trans i18nKey="kinder:subscription.selectPlan" />
          </KinderSubmitButton>
        )
      }
      highlighted={isCurrent || isRecommended}
      name={pkg.name}
      price={formatVnd(pkg.price_monthly)}
      priceSuffix={
        pkg.price_monthly > 0 ? (
          <Trans i18nKey="kinder:subscription.perMonth" />
        ) : (
          <Trans i18nKey="kinder:subscription.freeForever" />
        )
      }
    />
  );
}
