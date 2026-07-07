'use client';

import Link from 'next/link';

import { Check } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingButton,
  MarketingSection,
  RequestDemoButton,
  SectionHeader,
  Stagger,
  StaggerItem,
} from '~/components/marketing';

const plans = [
  {
    nameKey: 'marketing:pricingFree',
    price: 'Free',
    descKey: 'marketing:pricingFreeDesc',
    features: [
      'marketing:pricingPage.plans.free.featureCrm',
      'marketing:pricingPage.plans.free.featureAttendance',
      'marketing:pricingPage.plans.free.featureParents',
    ],
    highlighted: false,
  },
  {
    nameKey: 'marketing:pricingStarter',
    price: '₫990.000',
    descKey: 'marketing:pricingStarterDesc',
    features: [
      'marketing:pricingPage.plans.starter.featureAllModules',
      'marketing:pricingPage.plans.starter.featureReports',
      'marketing:pricingPage.plans.starter.featureMultiBranch',
    ],
    highlighted: false,
  },
  {
    nameKey: 'marketing:pricingPro',
    price: '₫2.490.000',
    descKey: 'marketing:pricingProDesc',
    features: [
      'marketing:pricingPage.plans.pro.featureAllModules',
      'marketing:pricingPage.plans.pro.featureMultiBranch',
      'marketing:pricingPage.plans.pro.featureHighQuota',
    ],
    highlighted: true,
  },
] as const;

export function PricingPreviewSection() {
  return (
    <MarketingSection id="pricing-preview">
      <SectionHeader
        className="mb-14"
        eyebrow={<Trans i18nKey="marketing:pricing" />}
        subtitle={<Trans i18nKey="marketing:pricingSubtitle" />}
        title={<Trans i18nKey="marketing:pricingPreviewTitle" />}
      />

      <Stagger className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <StaggerItem key={plan.nameKey}>
            <article
              className={`marketing-card relative flex h-full flex-col rounded-2xl p-6 ${
                plan.highlighted
                  ? 'border-[var(--marketing-primary)] ring-2 ring-[var(--marketing-primary)]/20'
                  : ''
              }`}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--marketing-primary)] px-3 py-1 text-xs font-medium text-white">
                  <Trans i18nKey="marketing:pricingPopular" />
                </span>
              ) : null}

              <h3 className="text-lg font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={plan.nameKey} />
              </h3>
              <p className="mt-1 text-sm text-[var(--marketing-text-muted)]">
                <Trans i18nKey={plan.descKey} />
              </p>
              <p className="mt-4 text-4xl font-bold text-[var(--marketing-text)]">
                {plan.price}
                {plan.price !== 'Free' ? (
                  <span className="text-base font-normal text-[var(--marketing-text-muted)]">
                    <Trans i18nKey="marketing:pricingPage.perMonth" />
                  </span>
                ) : null}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((key) => (
                  <li className="flex items-start gap-2 text-sm" key={key}>
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--marketing-secondary)]" />
                    <Trans i18nKey={key} />
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <MarketingButton
                  className="w-full justify-center"
                  href="/pricing"
                  variant={plan.highlighted ? 'primary' : 'outline'}
                >
                  <Trans i18nKey="marketing:pricingViewPlan" />
                </MarketingButton>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <RequestDemoButton />
        <Link
          className="text-sm font-medium text-[var(--marketing-primary)] hover:underline"
          href="/pricing"
        >
          <Trans i18nKey="marketing:pricingCompareAll" />
        </Link>
      </FadeIn>
    </MarketingSection>
  );
}
