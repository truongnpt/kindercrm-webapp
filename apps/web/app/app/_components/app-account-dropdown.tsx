'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const paths = {
  home: pathsConfig.app.home,
  account: pathsConfig.app.account,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function AppAccountDropdown({ user }: { user: JwtPayload }) {
  const signOut = useSignOut();
  const userQuery = useUser(user);
  const userData = userQuery.data ?? user;

  return (
    <PersonalAccountDropdown
      showProfileName={true}
      paths={paths}
      features={features}
      user={userData}
      signOutRequested={() => signOut.mutateAsync()}
    />
  );
}
