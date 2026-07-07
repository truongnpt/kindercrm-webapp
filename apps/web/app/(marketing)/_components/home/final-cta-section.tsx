'use client';

import { School, Sparkles } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingCtaGroup,
  MarketingSection,
} from '~/components/marketing';

const steps = [
  {
    icon: School,
    titleKey: 'marketing:heroStep1Title',
    descKey: 'marketing:heroStep1Desc',
  },
  {
    icon: Sparkles,
    titleKey: 'marketing:heroStep2Title',
    descKey: 'marketing:heroStep2Desc',
  },
  {
    icon: School,
    titleKey: 'marketing:heroStep3Title',
    descKey: 'marketing:heroStep3Desc',
  },
] as const;

export function HowItWorksSection() {
  return (
    <MarketingSection>
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--marketing-text)] md:text-4xl">
          <Trans i18nKey="marketing:heroHowItWorks" />
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--marketing-text-muted)]">
          <Trans i18nKey="marketing:heroHowItWorksSubtitle" />
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map(({ icon: Icon, titleKey, descKey }, index) => (
          <FadeIn key={titleKey} delay={index * 0.08}>
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--marketing-primary)]/10 text-[var(--marketing-primary)]">
                <Icon className="size-6" />
              </div>
              <span className="text-sm font-semibold text-[var(--marketing-primary)]">
                0{index + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={titleKey} />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                <Trans i18nKey={descKey} />
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </MarketingSection>
  );
}

export function FinalCtaSection() {
  return (
    <section
      id="request-demo-cta"
      className="marketing-gradient-cta relative overflow-hidden py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30"
      />

      <div className="container relative mx-auto px-4 text-center sm:px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            <Trans i18nKey="marketing:heroBottomCtaTitle" />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            <Trans i18nKey="marketing:heroBottomCtaSubtitle" />
          </p>
          <MarketingCtaGroup
            className="mt-10 justify-center [&_a:first-child]:bg-white [&_a:first-child]:text-[var(--marketing-primary)] [&_a:first-child]:hover:bg-white/90 [&_a:last-child]:border-white/40 [&_a:last-child]:bg-white/10 [&_a:last-child]:text-white [&_a:last-child]:hover:bg-white/20"
            size="lg"
          />
        </FadeIn>
      </div>
    </section>
  );
}
