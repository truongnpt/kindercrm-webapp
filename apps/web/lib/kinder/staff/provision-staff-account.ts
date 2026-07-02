import 'server-only';

import type { AuthError } from '@supabase/supabase-js';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

export function getStaffInviteRedirectUrl() {
  const siteUrl = appConfig.url.replace(/\/$/, '');
  const updatePasswordUrl = `${siteUrl}${pathsConfig.auth.passwordUpdate}`;
  const appHomeUrl = `${siteUrl}${pathsConfig.app.home}`;

  return `${updatePasswordUrl}?callback=${encodeURIComponent(appHomeUrl)}`;
}

export type ProvisionStaffAccountResult =
  | { outcome: 'invited'; userId: string; method: 'invite' | 'recovery' }
  | { outcome: 'existing'; userId: string }
  | { outcome: 'error'; message: string };

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

  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (accountError) {
    throw accountError;
  }

  if (account?.id) {
    return account.id;
  }

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

export async function provisionStaffAccount(input: {
  email: string;
  fullName: string;
}): Promise<ProvisionStaffAccountResult> {
  const admin = getSupabaseServerAdminClient();
  const email = input.email.trim().toLowerCase();
  const redirectTo = getStaffInviteRedirectUrl();

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
    message: error?.message ?? 'Failed to invite staff member',
  };
}

/**
 * Resend invite for staff without an account, or when the invite link expired.
 * - No auth user yet → send fresh invite email
 * - Auth user exists → send recovery email to set password (same /update-password flow)
 */
export async function resendStaffInvite(input: {
  email: string;
  fullName: string;
}): Promise<ProvisionStaffAccountResult> {
  const email = input.email.trim().toLowerCase();
  const redirectTo = getStaffInviteRedirectUrl();
  const existingUserId = await findAuthUserIdByEmail(email);

  if (!existingUserId) {
    return provisionStaffAccount(input);
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
