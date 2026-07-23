'use client';

import { useState } from 'react';

import { LogOut, Menu } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';

import { usePlatformConsole } from './platform-context';
import { PlatformNavLinks } from './platform-nav-links';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Separator } from '@kit/ui/separator';

export function PlatformMobileHeader() {
  const [open, setOpen] = useState(false);
  const { platformRole } = usePlatformConsole();
  const signOut = useSignOut();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Button
 aria-label="Open menu"className="size-10 shrink-0"
 onClick={() => setOpen(true)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              <Trans i18nKey="kinder:platform.title" />
            </p>
            <span className="platform-console-role-badge">
              <Trans i18nKey={`kinder:platform.roles.${platformRole}`} />
            </span>
          </div>
        </div>

        <AppLogo className="max-w-[100px]" href={pathsConfig.platform.home} />
      </header>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="flex w-[min(100%,280px)] flex-col gap-0 p-0" side="left">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="text-base">
              <Trans i18nKey="kinder:platform.title" />
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <PlatformNavLinks
              onNavigate={() => setOpen(false)}
              platformRole={platformRole}
            />
          </div>
          <div className="p-4 space-y-4">
            <Separator />
            <Button
              className="w-full gap-2"
              disabled={signOut.isPending}
              onClick={() => signOut.mutateAsync()}
              type="button"
            >
              <LogOut data-icon="inline-start" className="h-4 w-4" />
              <Trans i18nKey="auth:signOut" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
