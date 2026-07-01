'use client';

import Link from 'next/link';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
} from '~/components/marketing';

const faqItems = [
  { q: 'marketing:homeFaq1Q', a: 'marketing:homeFaq1A' },
  { q: 'marketing:homeFaq2Q', a: 'marketing:homeFaq2A' },
  { q: 'marketing:homeFaq3Q', a: 'marketing:homeFaq3A' },
  { q: 'marketing:homeFaq4Q', a: 'marketing:homeFaq4A' },
  { q: 'marketing:homeFaq5Q', a: 'marketing:homeFaq5A' },
] as const;

export function FaqPreviewSection() {
  return (
    <MarketingSection alt>
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:faq" />}
        title={<Trans i18nKey="marketing:homeFaqTitle" />}
        subtitle={<Trans i18nKey="marketing:faqSubtitle" />}
        className="mb-10"
      />

      <FadeIn>
        <Accordion type="single" collapsible className="marketing-card rounded-2xl px-6">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-[var(--marketing-text)] hover:no-underline">
                <Trans i18nKey={item.q} />
              </AccordionTrigger>
              <AccordionContent className="text-[var(--marketing-text-muted)]">
                <Trans i18nKey={item.a} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-6 text-center text-sm text-[var(--marketing-text-muted)]">
          <Trans i18nKey="marketing:contactFaq" />{' '}
          <Link href="/faq" className="font-medium text-[var(--marketing-primary)] hover:underline">
            <Trans i18nKey="marketing:faq" />
          </Link>
        </p>
      </FadeIn>
    </MarketingSection>
  );
}
