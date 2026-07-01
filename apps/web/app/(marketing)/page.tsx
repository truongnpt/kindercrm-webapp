import { BenefitsSection } from '~/(marketing)/_components/home/benefits-section';
import { ComparisonSection } from '~/(marketing)/_components/home/comparison-section';
import {
  FinalCtaSection,
  HowItWorksSection,
} from '~/(marketing)/_components/home/final-cta-section';
import { FaqPreviewSection } from '~/(marketing)/_components/home/faq-preview-section';
import {
  HeroSection,
  TrustedBySection,
} from '~/(marketing)/_components/home/hero-section';
import { ModulesSection } from '~/(marketing)/_components/home/modules-section';
import { PricingPreviewSection } from '~/(marketing)/_components/home/pricing-preview-section';
import { ProductShowcaseSection } from '~/(marketing)/_components/home/product-showcase-section';
import { RolesExperienceSection } from '~/(marketing)/_components/home/roles-experience-section';
import { TestimonialsSection } from '~/(marketing)/_components/home/testimonials-section';
import appConfig from '~/config/app.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: appConfig.title,
    description: t('marketing:heroSubtitle'),
    openGraph: {
      title: appConfig.title,
      description: t('marketing:heroSubtitle'),
      type: 'website',
      url: appConfig.url,
    },
  };
}

async function Home() {
  const { t } = await createI18nServerInstance();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appConfig.name,
    applicationCategory: 'BusinessApplication',
    description: t('marketing:heroSubtitle'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <HeroSection />
      <TrustedBySection />
      <BenefitsSection />
      <ModulesSection />
      <ProductShowcaseSection />
      <ComparisonSection />
      <RolesExperienceSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreviewSection />
      <FaqPreviewSection />
      <FinalCtaSection />
    </>
  );
}

export default withI18n(Home);
