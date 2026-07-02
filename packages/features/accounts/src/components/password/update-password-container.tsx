'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert } from '@kit/ui/alert';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

import { UpdatePasswordForm } from './update-password-form';

const OAUTH_PROVIDERS = new Set([
  'apple',
  'azure',
  'bitbucket',
  'discord',
  'facebook',
  'github',
  'gitlab',
  'google',
  'keycloak',
  'linkedin',
  'slack',
  'spotify',
  'twitch',
  'twitter',
  'workos',
]);

type AuthUserLike = {
  email?: string | null;
  identities?: Array<{ provider: string }> | null;
};

function userCanUpdatePassword(
  jwtUser: JwtPayload & { email?: string },
  authUser: AuthUserLike | null | undefined,
) {
  const email = authUser?.email ?? jwtUser.email;

  if (!email) {
    return false;
  }

  const identities = authUser?.identities ?? [];

  if (identities.some((identity) => identity.provider === 'email')) {
    return true;
  }

  if (
    jwtUser.amr?.some((item: { method: string }) => item.method === 'password')
  ) {
    return true;
  }

  // Invited email accounts may not expose identities in the session payload.
  if (identities.length === 0) {
    return true;
  }

  const isOAuthOnly = identities.every((identity) =>
    OAUTH_PROVIDERS.has(identity.provider),
  );

  return !isOAuthOnly;
}

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const client = useSupabase();
  const { data: user, isPending } = useUser();

  const authUserQuery = useQuery({
    queryKey: ['supabase:auth-user'],
    queryFn: async () => {
      const { data, error } = await client.auth.getUser();

      if (error) {
        throw error;
      }

      return data.user;
    },
    enabled: !!user,
  });

  if (isPending || (user && authUserQuery.isPending)) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user) {
    return null;
  }

  const canUpdatePassword = userCanUpdatePassword(user, authUserQuery.data);

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  const userEmail =
    authUserQuery.data?.email ??
    (typeof user.email === 'string' ? user.email : '');

  if (!userEmail) {
    return <WarnCannotUpdatePasswordAlert />;
  }
  return (
    <UpdatePasswordForm
      callbackPath={props.callbackPath}
      userEmail={userEmail}
    />
  );
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert variant={'warning'}>
      <Trans i18nKey={'account:cannotUpdatePassword'} />
    </Alert>
  );
}
