'use client';

import { Loader2 } from 'lucide-react';

import { Button, type ButtonProps } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

export function KinderSubmitButton({
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps & {
  loading?: boolean;
}) {
  return (
    <Button
      aria-busy={loading || undefined}
      className={cn(loading && 'gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4 shrink-0 animate-spin" />
      ) : null}
      {children}
    </Button>
  );
}
