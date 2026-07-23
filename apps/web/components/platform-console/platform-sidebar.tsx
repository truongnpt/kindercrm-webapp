'use client';

import Link from 'next/link';

import { ArrowLeft, LogOut } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';

import { usePlatformConsole } from './platform-context';
import { PlatformNavLinks } from './platform-nav-links';

export function PlatformSidebar() {
  const { platformRole, showWorkspaceLink } = usePlatformConsole();
  const signOut = useSignOut();

  return (
    <aside className="platform-console-sidebar">
      <div className="flex flex-col gap-6 p-4">
        <div className="px-1">
          <AppLogo href={pathsConfig.platform.home} />
          <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Trans i18nKey="kinder:platform.title" />
          </p>
          <span className="platform-console-role-badge mt-2">
            <Trans i18nKey={`kinder:platform.roles.${platformRole}`} />
          </span>
        </div>

        <PlatformNavLinks platformRole={platformRole} />
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
        {showWorkspaceLink ? (
          <Button asChild className="min-h-10 justify-start" variant="outline">
            <Link href={pathsConfig.app.home}>
              <ArrowLeft data-icon="inline-start" />
              <Trans i18nKey="kinder:platform.backToWorkspace" />
            </Link>
          </Button>
        ) : null}

        <Button
          className="min-h-10 gap-2"
          disabled={signOut.isPending}
          onClick={() => signOut.mutateAsync()}
          type="button"
        >
          <LogOut className="size-4" />
          <Trans i18nKey="auth:signOut" />
        </Button>
      </div>
    </aside>
  );
}
