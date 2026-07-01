'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {packages.map((pkg) => (
        <PlanCard
          currentPackageId={currentPackageId}
          isOwner={isOwner}
          key={pkg.id}
          pkg={pkg}
          schoolId={schoolId}
        />
      ))}
    </div>
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

  const onSelect = async () => {
    const promise = changePackageAction({
      schoolId,
      packageId: pkg.id,
    });

    toast.promise(promise, {
      loading: t('subscription.changing'),
      success: t('subscription.changed'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
  };

  return (
    <Card className={isCurrent ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{pkg.name}</CardTitle>
          <If condition={isCurrent}>
            <Badge>
              <Trans i18nKey="kinder:subscription.current" />
            </Badge>
          </If>
        </div>
        <CardDescription>{pkg.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p className="text-2xl font-semibold">
          {formatVnd(pkg.price_monthly)}
          {pkg.price_monthly > 0 ? (
            <span className="text-muted-foreground text-sm font-normal">
              {' '}
              <Trans i18nKey="kinder:subscription.perMonth" />
            </span>
          ) : null}
        </p>
        <ul className="text-muted-foreground space-y-1">
          <li>
            <Trans
              i18nKey="kinder:subscription.maxStudents"
              values={{ count: pkg.max_students }}
            />
          </li>
          <li>
            <Trans
              i18nKey="kinder:subscription.maxCampuses"
              values={{ count: pkg.max_campuses }}
            />
          </li>
          <If condition={hasPackageFeature(pkg, 'crm')}>
            <li>CRM</li>
          </If>
          <If condition={hasPackageFeature(pkg, 'classes')}>
            <li>Classes</li>
          </If>
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrent ? (
          <Button className="w-full" disabled variant="secondary">
            <Trans i18nKey="kinder:subscription.current" />
          </Button>
        ) : isEnterprise ? (
          <Button className="w-full" disabled variant="outline">
            <Trans i18nKey="kinder:subscription.enterpriseContact" />
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={!isOwner}
            onClick={() => void onSelect()}
            variant="default"
          >
            <Trans i18nKey="kinder:subscription.selectPlan" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
