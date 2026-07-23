'use client';

import type { JwtPayload } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

import { cn } from '@kit/ui/utils';
import featuresFlagConfig from '~/config/feature-flags.config';
import { AppAccountDropdown } from '../../app/app/_components/app-account-dropdown';

const ModeToggle = dynamic(
  () => import('@kit/ui/mode-toggle').then((mod) => mod.ModeToggle),
  { ssr: false },
);

export function PlatformHeader({
  user,
  className,
}: {
  user: JwtPayload;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-md lg:flex',
        className,
      )}
    >
      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-2">
        {featuresFlagConfig.enableThemeToggle ? (
          <ModeToggle className="rounded-lg" />
        ) : null}

        <AppAccountDropdown user={user} />
      </div>
    </header>
  );
}
