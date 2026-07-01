'use client';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function SignOutButton() {
  const signOut = useSignOut();

  return (
    <Button
      onClick={() => signOut.mutateAsync()}
      type="button"
      variant="outline"
    >
      <Trans i18nKey="common:signOut" />
    </Button>
  );
}
