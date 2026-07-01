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
    nameKey: 'marketing:pricingStarter',
    price: 'Free',
    descKey: 'marketing:pricingStarterDesc',
    features: [
      'marketing:pricingPage.plans.free.featureCrm',
      'marketing:pricingPage.plans.free.featureAttendance',
      'marketing:pricingPage.plans.free.featureParents',
    ],
    highlighted: false,
  },
  {
    nameKey: 'marketing:pricingProfessional',
    price: '₫990K',
    descKey: 'marketing:pricingProfessionalDesc',
    features: [
      'marketing:pricingPage.plans.pro.featureAllModules',
      'marketing:pricingPage.plans.pro.featureReports',
      'marketing:pricingPage.plans.pro.featureMultiBranch',
    ],
    highlighted: true,
  },
  {
    nameKey: 'marketing:pricingEnterprise',
    price: 'Custom',
    descKey: 'marketing:pricingEnterpriseDesc',
    features: [
      'marketing:pricingPage.plans.enterprise.featureAllModules',
      'marketing:pricingPage.plans.enterprise.featurePriority',
      'marketing:pricingPage.plans.enterprise.featureSupport',
    ],
    highlighted: false,
  },
] as const;

export function PricingPreviewSection() {
  return (
    <MarketingSection id="pricing-preview">
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:pricing" />}
        title={<Trans i18nKey="marketing:pricingPreviewTitle" />}
        subtitle={<Trans i18nKey="marketing:pricingSubtitle" />}
        className="mb-14"
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
                {plan.price !== 'Custom' && plan.price !== 'Free' ? (
                  <span className="text-base font-normal text-[var(--marketing-text-muted)]">
                    /mo
                  </span>
                ) : null}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--marketing-secondary)]" />
                    <Trans i18nKey={key} />
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <MarketingButton
                  href="/pricing"
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full justify-center"
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
          href="/pricing"
          className="text-sm font-medium text-[var(--marketing-primary)] hover:underline"
        >
          <Trans i18nKey="marketing:pricingCompareAll" />
        </Link>
      </FadeIn>
    </MarketingSection>
  );
}
