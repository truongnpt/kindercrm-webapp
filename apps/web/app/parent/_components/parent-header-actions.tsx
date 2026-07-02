'use client';

import Link from 'next/link';

import { User } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

export function ParentHeaderActions({
  hasStaffAccess,
}: {
  hasStaffAccess: boolean;
}) {
  const signOut = useSignOut();

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={pathsConfig.parent.account}>
          <User className="mr-2 size-4" />
          <Trans i18nKey="common:routes.account" />
        </Link>
      </Button>
      {hasStaffAccess ? (
        <Button asChild size="sm" variant="outline">
          <Link href={pathsConfig.app.home}>
            <Trans i18nKey="kinder:parent.staffPortal" />
          </Link>
        </Button>
      ) : null}
      <Button
        disabled={signOut.isPending}
        onClick={() => signOut.mutateAsync()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Trans i18nKey="common:signOut" />
      </Button>
    </div>
  );
}
