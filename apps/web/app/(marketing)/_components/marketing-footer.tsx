import Link from 'next/link';

import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

const footerSections = [
  {
    headingKey: 'marketing:footerCompany',
    links: [
      { href: '/#about', labelKey: 'marketing:about' },
      { href: '/faq', labelKey: 'marketing:contact' },
      { href: '/pricing', labelKey: 'marketing:pricing' },
    ],
  },
  {
    headingKey: 'marketing:product',
    links: [
      { href: '/#features', labelKey: 'marketing:navFeatures' },
      { href: '/#solutions', labelKey: 'marketing:navSolutions' },
      { href: '/#modules', labelKey: 'marketing:footerModules' },
    ],
  },
  {
    headingKey: 'marketing:footerResources',
    links: [
      { href: '/faq', labelKey: 'marketing:faq' },
      { href: '/pricing', labelKey: 'marketing:pricing' },
    ],
  },
  {
    headingKey: 'marketing:legal',
    links: [
      { href: '/terms-of-service', labelKey: 'marketing:termsOfService' },
      { href: '/privacy-policy', labelKey: 'marketing:privacyPolicy' },
      { href: '/cookie-policy', labelKey: 'marketing:cookiePolicy' },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--marketing-border)] bg-[var(--marketing-section)]">
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="flex max-w-sm flex-col gap-4">
            <AppLogo className="h-10 w-auto" />
            <p className="text-sm leading-relaxed text-[var(--marketing-text-muted)]">
              <Trans i18nKey="marketing:footerDescription" />
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={pathsConfig.auth.signUp}
                className="text-sm font-medium text-[var(--marketing-primary)] hover:underline"
              >
                <Trans i18nKey="marketing:ctaStartTrial" />
              </Link>
              <Link
                href="#request-demo"
                className="text-sm font-medium text-[var(--marketing-text-muted)] hover:text-[var(--marketing-primary)]"
              >
                <Trans i18nKey="marketing:ctaRequestDemo" />
              </Link>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.headingKey} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={section.headingKey} />
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--marketing-text-muted)] transition-colors hover:text-[var(--marketing-primary)]"
                    >
                      <Trans i18nKey={link.labelKey} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--marketing-border)] pt-8 text-sm text-[var(--marketing-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Trans
              i18nKey="marketing:copyright"
              values={{
                product: appConfig.name,
                year: new Date().getFullYear(),
              }}
            />
          </p>
          <p>
            <Trans i18nKey="marketing:footerTagline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
