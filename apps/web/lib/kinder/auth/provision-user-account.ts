import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import { findAccountByEmail } from './find-account-by-email';
import { generateSecurePassword } from './generate-password';
import {
  sendCredentialsEmail,
  type AccountCredentialsType,
} from './send-credentials-email';

export type ProvisionUserAccountResult = {
  userId: string;
  email: string;
  created: boolean;
  credentialsEmailSent: boolean;
};

export async function provisionUserAccount(input: {
  email: string;
  name: string;
  accountType: AccountCredentialsType;
  schoolName?: string;
}): Promise<ProvisionUserAccountResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new KinderError(
      KINDER_ERROR_CODES.ACCOUNT_PROVISION_FAILED,
      'Email is required to provision an account',
    );
  }

  const existingAccount = await findAccountByEmail(normalizedEmail);

  if (existingAccount) {
    return {
      userId: existingAccount.id,
      email: existingAccount.email ?? normalizedEmail,
      created: false,
      credentialsEmailSent: false,
    };
  }

  const password = generateSecurePassword();
  const admin = getSupabaseServerAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: input.name.trim() || normalizedEmail.split('@')[0],
    },
  });

  if (error || !data.user) {
    throw new KinderError(
      KINDER_ERROR_CODES.ACCOUNT_PROVISION_FAILED,
      error?.message ?? 'Failed to create user account',
    );
  }

  let credentialsEmailSent = false;

  try {
    await sendCredentialsEmail({
      to: normalizedEmail,
      name: input.name.trim() || normalizedEmail.split('@')[0] || 'User',
      password,
      accountType: input.accountType,
      schoolName: input.schoolName,
    });
    credentialsEmailSent = true;
  } catch (emailError) {
    await admin.auth.admin.deleteUser(data.user.id);

    throw new KinderError(
      KINDER_ERROR_CODES.CREDENTIALS_EMAIL_FAILED,
      emailError instanceof Error ?
        emailError.message
      : 'Failed to send credentials email',
    );
  }

  return {
    userId: data.user.id,
    email: normalizedEmail,
    created: true,
    credentialsEmailSent,
  };
}
