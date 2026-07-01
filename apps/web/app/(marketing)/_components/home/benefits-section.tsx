'use client';

import {
  Clock,
  HeartHandshake,
  Layers,
  LineChart,
  Shield,
  Sparkles,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
  Stagger,
  StaggerItem,
} from '~/components/marketing';

const benefits = [
  {
    icon: Layers,
    titleKey: 'marketing:benefit1Title',
    descKey: 'marketing:benefit1Desc',
  },
  {
    icon: Clock,
    titleKey: 'marketing:benefit2Title',
    descKey: 'marketing:benefit2Desc',
  },
  {
    icon: HeartHandshake,
    titleKey: 'marketing:benefit3Title',
    descKey: 'marketing:benefit3Desc',
  },
  {
    icon: LineChart,
    titleKey: 'marketing:benefit4Title',
    descKey: 'marketing:benefit4Desc',
  },
  {
    icon: Shield,
    titleKey: 'marketing:benefit5Title',
    descKey: 'marketing:benefit5Desc',
  },
  {
    icon: Sparkles,
    titleKey: 'marketing:benefit6Title',
    descKey: 'marketing:benefit6Desc',
  },
] as const;

export function BenefitsSection() {
  return (
    <MarketingSection id="about">
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:benefitsEyebrow" />}
        title={<Trans i18nKey="marketing:heroValuesTitle" />}
        subtitle={<Trans i18nKey="marketing:heroValuesSubtitle" />}
        className="mb-14"
      />

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, titleKey, descKey }) => (
          <StaggerItem key={titleKey}>
            <article className="marketing-card h-full rounded-2xl p-6">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[var(--marketing-primary)]/10 text-[var(--marketing-primary)]">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={titleKey} />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                <Trans i18nKey={descKey} />
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn className="mt-12">
        <div className="marketing-card rounded-2xl bg-gradient-to-br from-[var(--marketing-section)] to-white p-8 text-center md:p-10">
          <p className="text-sm font-semibold tracking-wide text-[var(--marketing-primary)] uppercase">
            <Trans i18nKey="marketing:heroVisionLabel" />
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-[var(--marketing-text-muted)]">
            <Trans i18nKey="marketing:heroVisionText" />
          </p>
        </div>
      </FadeIn>
    </MarketingSection>
  );
}
