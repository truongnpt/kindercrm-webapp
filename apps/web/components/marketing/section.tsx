import type { ReactNode } from 'react';

import { cn } from '@kit/ui/utils';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex max-w-3xl flex-col gap-4',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-wide text-[var(--marketing-primary)] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--marketing-text)] md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-lg leading-relaxed text-[var(--marketing-text-muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function MarketingSection({
  id,
  children,
  className,
  alt = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  alt?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-20 md:py-28',
        alt && 'marketing-section-alt',
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}
