import { Check } from 'lucide-react';

import { cn } from '@kit/ui/utils';

export function PricingGrid({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PricingCard({
  name,
  description,
  price,
  priceSuffix,
  features,
  badge,
  highlighted = false,
  footer,
  className,
}: {
  name: React.ReactNode;
  description?: React.ReactNode;
  price: React.ReactNode;
  priceSuffix?: React.ReactNode;
  features: React.ReactNode[];
  badge?: React.ReactNode;
  highlighted?: boolean;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'kinder-pricing-card',
        highlighted && 'kinder-pricing-card--highlighted',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-foreground text-lg font-semibold">{name}</h3>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          ) : null}
        </div>
        {badge}
      </div>

      <div className="mt-5">
        <p className="text-foreground text-3xl font-bold tracking-tight">
          {price}
        </p>
        {priceSuffix ? (
          <p className="text-muted-foreground mt-1 text-sm">{priceSuffix}</p>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2.5">
        {features.map((feature, index) => (
          <li
            className="text-muted-foreground flex items-start gap-2 text-sm"
            key={index}
          >
            <Check className="text-primary mt-0.5 size-4 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </article>
  );
}
