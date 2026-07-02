import Link from 'next/link';

import { User } from 'lucide-react';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

import { PlatformNav } from './platform-nav';

export function PlatformShell({
  children,
  showWorkspaceLink = false,
  platformRole,
}: React.PropsWithChildren<{
  showWorkspaceLink?: boolean;
  platformRole: PlatformAdminRole;
}>) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <AppLogo href={pathsConfig.platform.home} />
            <PlatformNav platformRole={platformRole} />
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={pathsConfig.platform.account}>
                <User className="mr-2 size-4" />
                <Trans i18nKey="common:routes.account" />
              </Link>
            </Button>

            {showWorkspaceLink ? (
              <Button asChild size="sm" variant="outline">
                <Link href={pathsConfig.app.home}>
                  <Trans i18nKey="kinder:platform.backToWorkspace" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
