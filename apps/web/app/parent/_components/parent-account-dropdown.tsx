'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const paths = {
  home: pathsConfig.parent.home,
  account: pathsConfig.parent.account,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function ParentAccountDropdown({
  showProfileName = true,
  user,
}: {
  showProfileName?: boolean;
  user: JwtPayload;
}) {
  const signOut = useSignOut();
  const userQuery = useUser(user);
  const userData = userQuery.data ?? user;

  return (
    <PersonalAccountDropdown
      features={features}
      paths={paths}
      showProfileName={showProfileName}
      signOutRequested={() => signOut.mutateAsync()}
      user={userData}
    />
  );
}
