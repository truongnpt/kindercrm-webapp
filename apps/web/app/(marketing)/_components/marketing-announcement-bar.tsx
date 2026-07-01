import Link from 'next/link';

import { Sparkles } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

export function MarketingAnnouncementBar() {
  return (
    <div className="border-b border-[var(--marketing-border)] bg-[var(--marketing-section)]">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm">
        <Sparkles
          className="hidden size-4 shrink-0 text-[var(--marketing-accent)] sm:inline"
          aria-hidden
        />
        <p className="text-[var(--marketing-text-muted)]">
          <Trans i18nKey="marketing:announcement" />
        </p>
        <Link
          href="#request-demo"
          className="font-medium text-[var(--marketing-primary)] underline-offset-4 hover:underline"
        >
          <Trans i18nKey="marketing:announcementCta" />
        </Link>
      </div>
    </div>
  );
}
