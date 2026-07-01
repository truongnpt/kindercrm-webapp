import Link from 'next/link';

import { Check } from 'lucide-react';

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
import { Trans } from '@kit/ui/trans';

interface PricingPlansProps {
  isLoggedIn: boolean;
  locale: string;
}

type PlanSlug = 'free' | 'pro' | 'enterprise';

interface StaticPlan {
  slug: PlanSlug;
  name: string;
  priceMonthly: number | null;
  maxStudents: number | null;
}

const STATIC_PLANS: StaticPlan[] = [
  {
    slug: 'free',
    name: 'Free',
    priceMonthly: null,
    maxStudents: 50,
  },
  {
    slug: 'pro',
    name: 'Pro',
    priceMonthly: 990_000,
    maxStudents: 200,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 2_490_000,
    maxStudents: null,
  },
];

const planFeatures: Record<PlanSlug, string[]> = {
  free: [
    'marketing:pricingPage.plans.free.featureCrm',
    'marketing:pricingPage.plans.free.featureAttendance',
    'marketing:pricingPage.plans.free.featureParents',
  ],
  pro: [
    'marketing:pricingPage.plans.pro.featureAllModules',
    'marketing:pricingPage.plans.pro.featureReports',
    'marketing:pricingPage.plans.pro.featureMultiBranch',
  ],
  enterprise: [
    'marketing:pricingPage.plans.enterprise.featureAllModules',
    'marketing:pricingPage.plans.enterprise.featurePriority',
    'marketing:pricingPage.plans.enterprise.featureSupport',
  ],
};

function formatBillingAmountPerMonth(amount: number, locale: string) {
  const formatted = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <>
      {formatted}
      <span className="text-muted-foreground text-base font-normal">
        <Trans i18nKey="marketing:pricingPage.perMonth" />
      </span>
    </>
  );
}

function PlanQuotaItem({
  maxStudents,
}: {
  maxStudents: number | null;
}) {
  const countKey = 'marketing:pricingPage.quotaStudents';
  const unlimitedKey = 'marketing:pricingPage.quotaStudentsUnlimited';

  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="text-primary mt-0.5 size-4 shrink-0" />
      {maxStudents === null ?
        <Trans i18nKey={unlimitedKey} />
      : <Trans
          i18nKey={countKey}
          values={{ count: maxStudents.toLocaleString() }}
        />
      }
    </li>
  );
}

function PlanFeatureItem({ i18nKey }: { i18nKey: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="text-primary mt-0.5 size-4 shrink-0" />
      <Trans i18nKey={i18nKey} />
    </li>
  );
}

function PlanCard({
  plan,
  isLoggedIn,
  popular,
  locale,
}: {
  plan: StaticPlan;
  isLoggedIn: boolean;
  popular?: boolean;
  locale: string;
}) {
  const isFree = plan.slug === 'free';
  const ctaHref = isLoggedIn ? '/' : '/auth/sign-up';

  const descriptionKey = `marketing:pricingPage.plans.${plan.slug}.description`;
  const ctaKey =
    isLoggedIn ?
      'marketing:pricingPage.ctaDashboard'
    : isFree ?
      'marketing:pricingPage.ctaFree'
    : 'marketing:pricingPage.ctaSignUp';

  const features = planFeatures[plan.slug];

  return (
    <Card
      className={
        popular ?
          'border-primary relative flex flex-col shadow-md'
        : 'relative flex flex-col'
      }
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Trans i18nKey="marketing:pricingPage.popular" />
        </Badge>
      )}

      <CardHeader className="gap-2">
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          <Trans i18nKey={descriptionKey} defaults={plan.name} />
        </CardDescription>
        <div className="pt-2">
          {isFree ?
            <p className="text-3xl font-bold tracking-tight">
              <Trans i18nKey="marketing:pricingPage.freePrice" />
            </p>
          : plan.priceMonthly !== null ?
            <p className="text-3xl font-bold tracking-tight">
              {formatBillingAmountPerMonth(plan.priceMonthly, locale)}
            </p>
          : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="flex flex-col gap-3">
          <PlanQuotaItem maxStudents={plan.maxStudents} />
          {features.map((featureKey) => (
            <PlanFeatureItem key={featureKey} i18nKey={featureKey} />
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant={popular ? 'default' : 'outline'}>
          <Link href={ctaHref}>
            <Trans i18nKey={ctaKey} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingPlans({ isLoggedIn, locale }: PricingPlansProps) {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STATIC_PLANS.map((plan) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            isLoggedIn={isLoggedIn}
            locale={locale}
            popular={plan.slug === 'pro'}
          />
        ))}
      </div>

      <div className="bg-muted/30 mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground text-sm leading-relaxed">
          <Trans i18nKey="marketing:pricingPage.paymentNoteContact" />
        </p>
        <p className="text-muted-foreground text-sm">
          <Trans
            i18nKey="marketing:pricingPage.orgNote"
            components={{
              faqLink: (
                <Link
                  href="/faq"
                  className="text-primary underline-offset-4 hover:underline"
                />
              ),
            }}
          />
        </p>
      </div>
    </div>
  );
}
