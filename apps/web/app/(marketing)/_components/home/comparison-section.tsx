'use client';

import { Check, X } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
} from '~/components/marketing';
import appConfig from '@/config/app.config';

const comparisonRows = [
  { key: 'marketing:compareRow1', traditional: false, kinder: true },
  { key: 'marketing:compareRow2', traditional: false, kinder: true },
  { key: 'marketing:compareRow3', traditional: false, kinder: true },
  { key: 'marketing:compareRow4', traditional: false, kinder: true },
  { key: 'marketing:compareRow5', traditional: false, kinder: true },
  { key: 'marketing:compareRow6', traditional: true, kinder: true },
] as const;

function CompareIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto size-5 text-[var(--marketing-secondary)]" />
  ) : (
    <X className="mx-auto size-5 text-[var(--marketing-danger)]" />
  );
}

export function ComparisonSection() {
  return (
    <MarketingSection alt>
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:compareEyebrow" />}
        title={<Trans i18nKey="marketing:compareTitle" />}
        subtitle={<Trans i18nKey="marketing:compareSubtitle" />}
        className="mb-12"
      />

      <FadeIn>
        <div className="marketing-card overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[var(--marketing-border)] bg-[var(--marketing-section)] text-sm font-semibold">
            <div className="p-4 md:p-5" />
            <div className="border-l border-[var(--marketing-border)] p-4 text-center text-[var(--marketing-text-muted)] md:p-5">
              <Trans i18nKey="marketing:compareTraditional" />
            </div>
            <div className="border-l border-[var(--marketing-border)] bg-[var(--marketing-primary)]/5 p-4 text-center text-[var(--marketing-primary)] md:p-5">
              {appConfig.name}
            </div>
          </div>

          {comparisonRows.map(({ key, traditional, kinder }) => (
            <div
              key={key}
              className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[var(--marketing-border)] last:border-b-0"
            >
              <div className="p-4 text-sm text-[var(--marketing-text)] md:p-5">
                <Trans i18nKey={key} />
              </div>
              <div className="flex items-center justify-center border-l border-[var(--marketing-border)] p-4 md:p-5">
                <CompareIcon value={traditional} />
              </div>
              <div className="flex items-center justify-center border-l border-[var(--marketing-border)] bg-[var(--marketing-primary)]/[0.02] p-4 md:p-5">
                <CompareIcon value={kinder} />
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </MarketingSection>
  );
}
