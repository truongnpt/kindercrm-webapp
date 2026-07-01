import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import {
  LEAD_STAGE_I18N_KEYS,
  type LeadStage,
} from '~/lib/kinder/crm/pipeline-stages';

const STAGE_STYLES: Record<LeadStage, string> = {
  new: 'border-primary/20 bg-primary/10 text-primary',
  contacted: 'border-sky-500/20 bg-sky-500/10 text-sky-800 dark:text-sky-200',
  appointment:
    'border-violet-500/20 bg-violet-500/10 text-violet-800 dark:text-violet-200',
  visited:
    'border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  deposit:
    'border-orange-500/20 bg-orange-500/10 text-orange-800 dark:text-orange-200',
  enrolled: 'border-primary/25 bg-primary/15 text-primary font-medium',
  lost: 'border-border/60 bg-muted/50 text-muted-foreground',
};

export function CrmStageBadge({
  stage,
  className,
}: {
  stage: LeadStage;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-none',
        STAGE_STYLES[stage],
        className,
      )}
      variant="outline"
    >
      <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
    </Badge>
  );
}

export function CrmStageDot({ stage }: { stage: LeadStage }) {
  const dotClass: Record<LeadStage, string> = {
    new: 'bg-primary',
    contacted: 'bg-sky-500',
    appointment: 'bg-violet-500',
    visited: 'bg-amber-500',
    deposit: 'bg-orange-500',
    enrolled: 'bg-primary',
    lost: 'bg-muted-foreground/50',
  };

  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', dotClass[stage])}
    />
  );
}
