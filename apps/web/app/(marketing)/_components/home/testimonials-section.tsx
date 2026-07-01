'use client';

import { Quote, Star } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
  Stagger,
  StaggerItem,
} from '~/components/marketing';

const testimonials = [
  {
    quoteKey: 'marketing:testimonial1Quote',
    nameKey: 'marketing:testimonial1Name',
    roleKey: 'marketing:testimonial1Role',
    schoolKey: 'marketing:testimonial1School',
  },
  {
    quoteKey: 'marketing:testimonial2Quote',
    nameKey: 'marketing:testimonial2Name',
    roleKey: 'marketing:testimonial2Role',
    schoolKey: 'marketing:testimonial2School',
  },
  {
    quoteKey: 'marketing:testimonial3Quote',
    nameKey: 'marketing:testimonial3Name',
    roleKey: 'marketing:testimonial3Role',
    schoolKey: 'marketing:testimonial3School',
  },
] as const;

export function TestimonialsSection() {
  return (
    <MarketingSection alt>
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:testimonialsEyebrow" />}
        title={<Trans i18nKey="marketing:testimonialsTitle" />}
        subtitle={<Trans i18nKey="marketing:testimonialsSubtitle" />}
        className="mb-14"
      />

      <Stagger className="grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <StaggerItem key={item.quoteKey}>
            <article className="marketing-card flex h-full flex-col rounded-2xl p-6">
              <Quote className="size-8 text-[var(--marketing-primary)]/30" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--marketing-text)]">
                <Trans i18nKey={item.quoteKey} />
              </p>
              <div className="mt-6 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-[var(--marketing-accent)] text-[var(--marketing-accent)]"
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-[var(--marketing-border)] pt-4">
                <p className="font-semibold text-[var(--marketing-text)]">
                  <Trans i18nKey={item.nameKey} />
                </p>
                <p className="text-sm text-[var(--marketing-text-muted)]">
                  <Trans i18nKey={item.roleKey} /> ·{' '}
                  <Trans i18nKey={item.schoolKey} />
                </p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn className="mt-12 text-center">
        <p className="text-sm text-[var(--marketing-text-muted)]">
          <Trans i18nKey="marketing:testimonialsNote" />
        </p>
      </FadeIn>
    </MarketingSection>
  );
}
