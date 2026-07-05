import 'server-only';

import { cache } from 'react';

import { getPaymentDbClient } from './payment-db';
import { ensurePaymentSettingsInitialized } from './initialize-payment-settings';
import type {
  PaymentAccount,
  PaymentAuditLog,
  PaymentInstructions,
  PaymentSettingsBundle,
  SchoolPaymentMethod,
} from './types';

export const loadPaymentSettings = cache(
  async (schoolId: string): Promise<PaymentSettingsBundle> => {
    await ensurePaymentSettingsInitialized(schoolId);

    const client = getPaymentDbClient();

    const [methodsResult, accountsResult, instructionsResult, auditResult] =
      await Promise.all([
        client
          .from('school_payment_methods')
          .select('*')
          .eq('school_id', schoolId)
          .order('method'),
        client
          .from('payment_accounts')
          .select('*')
          .eq('school_id', schoolId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true }),
        client
          .from('payment_instructions')
          .select('*')
          .eq('school_id', schoolId)
          .maybeSingle(),
        client
          .from('payment_audit_logs')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

    if (methodsResult.error) {
      throw methodsResult.error;
    }

    if (accountsResult.error) {
      throw accountsResult.error;
    }

    return {
      methods: (methodsResult.data ?? []) as SchoolPaymentMethod[],
      accounts: (accountsResult.data ?? []) as PaymentAccount[],
      instructions: (instructionsResult.data ?? null) as PaymentInstructions | null,
      auditLogs: (auditResult.error ? [] : (auditResult.data ?? [])) as PaymentAuditLog[],
    };
  },
);

export const loadActivePaymentAccounts = cache(async (schoolId: string) => {
  const settings = await loadPaymentSettings(schoolId);

  return settings.accounts.filter((account) => account.status === 'active');
});

export const loadEnabledPaymentMethods = cache(async (schoolId: string) => {
  const settings = await loadPaymentSettings(schoolId);

  return settings.methods.filter((method) => method.is_enabled);
});
