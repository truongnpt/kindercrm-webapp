import { cn } from '@kit/ui/utils';

export function MarketingPageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'marketing-gradient-hero border-b border-[var(--marketing-border)] py-16 md:py-20',
        className,
      )}
    >
      <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--marketing-text)] md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--marketing-text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
