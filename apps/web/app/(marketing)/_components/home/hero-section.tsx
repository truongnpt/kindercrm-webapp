'use client';

import { ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingCtaGroup,
  MarketingSection,
} from '~/components/marketing';

import { DashboardPreview } from './dashboard-preview';

const trustBadges = [
  { icon: ShieldCheck, key: 'marketing:heroTrustSecurity' },
  { icon: Zap, key: 'marketing:heroTrustFast' },
  { icon: Star, key: 'marketing:heroTrustRated' },
] as const;

export function HeroSection() {
  return (
    <section className="marketing-gradient-hero relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div
        aria-hidden
        className="marketing-grid-pattern pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <FadeIn>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--marketing-border)] bg-white/80 px-4 py-1.5 text-sm font-medium text-[var(--marketing-text-muted)] shadow-sm">
              <Sparkles className="size-4 text-[var(--marketing-accent)]" />
              <Trans i18nKey="marketing:heroPillText" />
            </span>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--marketing-text)] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.05]">
              <span className="block">
                <Trans i18nKey="marketing:heroTitle1" />
              </span>
              <span className="marketing-text-gradient mt-1 block">
                <Trans i18nKey="marketing:heroTitle2" />
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--marketing-text-muted)] md:text-xl">
              <Trans i18nKey="marketing:heroSubtitle" />
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <MarketingCtaGroup className="mt-8 justify-center" size="lg" />
          </FadeIn>

          <FadeIn delay={0.2}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--marketing-text-muted)]">
              {trustBadges.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-center gap-2">
                  <Icon className="size-4 text-[var(--marketing-primary)]" />
                  <Trans i18nKey={key} />
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="mt-14 md:mt-20">
          <DashboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}

export function TrustedBySection() {
  const schools = [
    'marketing:trustedSchool1',
    'marketing:trustedSchool2',
    'marketing:trustedSchool3',
    'marketing:trustedSchool4',
    'marketing:trustedSchool5',
  ] as const;

  const stats = [
    { value: 'Cloud SaaS', labelKey: 'marketing:trustedStatSchools' },
    { value: 'Role-based', labelKey: 'marketing:trustedStatStudents' },
    { value: 'Stripe Billing', labelKey: 'marketing:trustedStatUptime' },
    { value: 'Parent Portal', labelKey: 'marketing:trustedStatRating' },
  ] as const;

  return (
    <MarketingSection alt>
      <FadeIn>
        <p className="mb-8 text-center text-sm font-medium tracking-wide text-[var(--marketing-text-muted)] uppercase">
          <Trans i18nKey="marketing:trustedByTitle" />
        </p>
      </FadeIn>

      <div className="mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {schools.map((key) => (
          <FadeIn key={key}>
            <span className="text-lg font-semibold text-[var(--marketing-text)]/70">
              <Trans i18nKey={key} />
            </span>
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ value, labelKey }) => (
          <FadeIn key={labelKey}>
            <div className="marketing-card rounded-2xl p-6 text-center h-full">
              <p className="text-3xl font-bold text-[var(--marketing-primary)]">
                {value}
              </p>
              <p className="mt-1 text-sm text-[var(--marketing-text-muted)]">
                <Trans i18nKey={labelKey} />
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </MarketingSection>
  );
}
