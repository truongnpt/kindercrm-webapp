import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';

const TONE_CLASS = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  muted: 'bg-muted text-muted-foreground border-border',
} as const;

export function StatusBadge({
  children,
  tone = 'default',
  className,
}: React.PropsWithChildren<{
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}>) {
  return (
    <Badge
      className={cn(
        'rounded-md border px-2 py-0.5 text-xs font-medium shadow-none',
        TONE_CLASS[tone],
        className,
      )}
      variant="outline"
    >
      {children}
    </Badge>
  );
}
