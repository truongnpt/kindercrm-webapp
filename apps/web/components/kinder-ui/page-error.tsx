'use client';

import Link from 'next/link';

import { AlertCircle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

export function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="kinder-surface kinder-empty-glow flex flex-col items-center px-6 py-20 text-center">
      <div className="bg-destructive/10 text-destructive mb-5 flex size-16 items-center justify-center rounded-2xl">
        <AlertCircle className="size-8" />
      </div>

      <h2 className="text-foreground text-lg font-semibold tracking-tight">
        <Trans i18nKey="kinder:ui.errorTitle" />
      </h2>

      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        <Trans i18nKey="kinder:ui.errorDescription" />
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} type="button">
          <RefreshCw className="size-4" data-icon="inline-start" />
          <Trans i18nKey="kinder:ui.retry" />
        </Button>

        <Button asChild variant="outline">
          <Link href={pathsConfig.app.home}>
            <Home className="size-4" data-icon="inline-start" />
            <Trans i18nKey="kinder:ui.goHome" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
