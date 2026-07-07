'use client';

import Link from 'next/link';

import { Check } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
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

type PlanSlug = 'free' | 'starter' | 'pro';

interface StaticPlan {
  slug: PlanSlug;
  name: string;
  priceMonthly: number | null;
  maxStudents: number | null;
  maxCampuses: number | null;
}

const STATIC_PLANS: StaticPlan[] = [
  {
    slug: 'free',
    name: 'Free',
    priceMonthly: null,
    maxStudents: 50,
    maxCampuses: 1,
  },
  {
    slug: 'starter',
    name: 'Starter',
    priceMonthly: 990_000,
    maxStudents: 500,
    maxCampuses: 10,
  },
  {
    slug: 'pro',
    name: 'Pro',
    priceMonthly: 2_490_000,
    maxStudents: null,
    maxCampuses: null,
  },
];

const planFeatures: Record<PlanSlug, string[]> = {
  free: [
    'marketing:pricingPage.plans.free.featureCrm',
    'marketing:pricingPage.plans.free.featureAttendance',
    'marketing:pricingPage.plans.free.featureParents',
  ],
  starter: [
    'marketing:pricingPage.plans.starter.featureAllModules',
    'marketing:pricingPage.plans.starter.featureReports',
    'marketing:pricingPage.plans.starter.featureMultiBranch',
  ],
  pro: [
    'marketing:pricingPage.plans.pro.featureAllModules',
    'marketing:pricingPage.plans.pro.featureMultiBranch',
    'marketing:pricingPage.plans.pro.featureHighQuota',
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
  maxCampuses,
}: {
  maxStudents: number | null;
  maxCampuses: number | null;
}) {
  return (
    <>
      <li className="flex items-start gap-2 text-sm">
        <Check className="text-primary mt-0.5 size-4 shrink-0" />
        {maxStudents === null ? (
          <Trans i18nKey="marketing:pricingPage.quotaStudentsUnlimited" />
        ) : (
          <Trans
            i18nKey="marketing:pricingPage.quotaStudents"
            values={{ count: maxStudents.toLocaleString() }}
          />
        )}
      </li>
      {maxCampuses !== null ? (
        <li className="flex items-start gap-2 text-sm">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <Trans
            i18nKey="marketing:pricingPage.quotaCampuses"
            values={{ count: maxCampuses.toLocaleString() }}
          />
        </li>
      ) : null}
    </>
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
    <div
      className={
        popular ?
          'marketing-card relative flex flex-col border-[var(--marketing-primary)] ring-2 ring-[var(--marketing-primary)]/20'
        : 'marketing-card relative flex flex-col'
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
          <PlanQuotaItem
            maxCampuses={plan.maxCampuses}
            maxStudents={plan.maxStudents}
          />
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
    </div>
  );
}

export function PricingPlans({ isLoggedIn, locale }: PricingPlansProps) {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STATIC_PLANS.map((plan) => (
          <PlanCard
            isLoggedIn={isLoggedIn}
            key={plan.slug}
            locale={locale}
            plan={plan}
            popular={plan.slug === 'pro'}
          />
        ))}
      </div>

      <div className="marketing-card mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm leading-relaxed">
          <Trans i18nKey="marketing:pricingPage.paymentNoteContact" />
        </p>
        <p className="text-muted-foreground text-sm">
          <Trans
            components={{
              faqLink: (
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href="/faq"
                />
              ),
            }}
            i18nKey="marketing:pricingPage.orgNote"
          />
        </p>
      </div>
    </div>
  );
}
