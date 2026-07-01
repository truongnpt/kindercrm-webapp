'use client';

import type { ReactNode } from 'react';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

type MarketingButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

const variantClasses: Record<MarketingButtonVariant, string> = {
  primary:
    'bg-[var(--marketing-primary)] text-white shadow-lg shadow-[#3fae40]/20 hover:bg-[var(--marketing-primary-hover)] hover:shadow-[#3fae40]/30',
  secondary:
    'bg-[var(--marketing-secondary)] text-white shadow-lg shadow-green-500/20 hover:bg-[#16a34a]',
  outline:
    'border border-[var(--marketing-border)] bg-white text-[var(--marketing-text)] hover:border-[var(--marketing-primary)] hover:text-[var(--marketing-primary)]',
  ghost:
    'text-[var(--marketing-text-muted)] hover:text-[var(--marketing-primary)] hover:bg-[var(--marketing-section)]',
};

export function MarketingButton({
  href,
  children,
  variant = 'primary',
  className,
  showArrow = false,
  size = 'default',
}: {
  href: string;
  children: ReactNode;
  variant?: MarketingButtonVariant;
  className?: string;
  showArrow?: boolean;
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--marketing-primary)] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]',
        size === 'lg' && 'gap-2 rounded-xl px-7 py-3.5 text-base',
        size === 'default' && 'rounded-xl px-5 py-2.5 text-sm',
        size === 'sm' && 'px-3.5 py-2 text-sm',
        variantClasses[variant],
        className,
      )}
    >
      {children}
      {showArrow ? <ArrowRight className="size-4" aria-hidden /> : null}
    </Link>
  );
}

export function RequestDemoButton({
  className,
  size,
  showArrow = true,
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showArrow?: boolean;
}) {
  return (
    <MarketingButton
      href="#request-demo"
      variant="primary"
      showArrow={showArrow}
      size={size}
      className={className}
    >
      <Trans i18nKey="marketing:ctaRequestDemo" />
    </MarketingButton>
  );
}

export function StartTrialButton({
  className,
  size,
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <MarketingButton
      href={pathsConfig.auth.signUp}
      variant="outline"
      size={size}
      className={className}
    >
      <Trans i18nKey="marketing:ctaStartTrial" />
    </MarketingButton>
  );
}

export function MarketingCtaGroup({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'lg' | 'sm';
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <RequestDemoButton size={size} />
      <StartTrialButton size={size} />
    </div>
  );
}
