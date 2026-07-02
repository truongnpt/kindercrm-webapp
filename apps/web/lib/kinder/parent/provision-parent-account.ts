import 'server-only';

import type { AuthError } from '@supabase/supabase-js';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

function getParentInviteRedirectUrl() {
  const siteUrl = appConfig.url.replace(/\/$/, '');
  const updatePasswordUrl = `${siteUrl}${pathsConfig.auth.passwordUpdate}`;
  const parentHomeUrl = `${siteUrl}${pathsConfig.parent.home}`;

  return `${updatePasswordUrl}?callback=${encodeURIComponent(parentHomeUrl)}`;
}

function isAlreadyRegisteredError(error: AuthError) {
  const message = error.message.toLowerCase();

  return (
    error.status === 422 ||
    message.includes('already') ||
    message.includes('registered') ||
    message.includes('exists')
  );
}

async function findAuthUserIdByEmail(email: string) {
  const admin = getSupabaseServerAdminClient();
  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    throw usersError;
  }

  return (
    usersData.users.find((user) => user.email?.toLowerCase() === email)?.id ??
    null
  );
}

async function sendAuthRecoverEmail(email: string, redirectTo: string) {
  const admin = getSupabaseServerAdminClient();
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}

export type ProvisionParentAccountResult =
  | { outcome: 'invited'; userId: string; method: 'invite' | 'recovery' }
  | { outcome: 'existing'; userId: string }
  | { outcome: 'error'; message: string };

export async function provisionParentAccount(input: {
  email: string;
  fullName: string;
}): Promise<ProvisionParentAccountResult> {
  const admin = getSupabaseServerAdminClient();
  const email = input.email.trim().toLowerCase();
  const redirectTo = getParentInviteRedirectUrl();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name: input.fullName },
    redirectTo,
  });

  if (!error && data.user) {
    return { outcome: 'invited', userId: data.user.id, method: 'invite' };
  }

  if (error && isAlreadyRegisteredError(error)) {
    const userId = await findAuthUserIdByEmail(email);

    if (userId) {
      return { outcome: 'existing', userId };
    }

    return { outcome: 'error', message: error.message };
  }

  return {
    outcome: 'error',
    message: error?.message ?? 'Failed to invite parent account',
  };
}

export async function resendParentInvite(input: {
  email: string;
  fullName: string;
}): Promise<ProvisionParentAccountResult> {
  const email = input.email.trim().toLowerCase();
  const redirectTo = getParentInviteRedirectUrl();
  const existingUserId = await findAuthUserIdByEmail(email);

  if (!existingUserId) {
    return provisionParentAccount(input);
  }

  const sent = await sendAuthRecoverEmail(email, redirectTo);

  if (!sent.ok) {
    return { outcome: 'error', message: sent.message };
  }

  return {
    outcome: 'invited',
    userId: existingUserId,
    method: 'recovery',
  };
}
