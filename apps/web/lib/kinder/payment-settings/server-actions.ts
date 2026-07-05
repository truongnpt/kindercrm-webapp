'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

import { getPaymentDbClient } from './payment-db';
import {
  DeactivatePaymentAccountSchema,
  SetDefaultPaymentAccountSchema,
  UpdatePaymentInstructionsSchema,
  UpdatePaymentMethodSchema,
  UpsertPaymentAccountSchema,
} from './schemas/payment-settings.schema';

const SETTINGS_PATH = pathsConfig.app.settingsPayment;
const FINANCE_PATH = pathsConfig.app.finance;

function revalidatePaymentPaths() {
  revalidatePath(SETTINGS_PATH);
  revalidatePath(FINANCE_PATH);
}

async function logPaymentAudit(
  schoolId: string,
  input: {
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
  },
  userId?: string,
) {
  const client = getPaymentDbClient();

  await client.from('payment_audit_logs').insert({
    school_id: schoolId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    details: input.details ?? null,
    created_by: userId ?? null,
  });
}

async function clearDefaultAccounts(schoolId: string) {
  const client = getPaymentDbClient();

  await client
    .from('payment_accounts')
    .update({ is_default: false })
    .eq('school_id', schoolId);
}

async function clearDefaultMethods(schoolId: string) {
  const client = getPaymentDbClient();

  await client
    .from('school_payment_methods')
    .update({ is_default: false })
    .eq('school_id', schoolId);
}

export const updatePaymentMethodAction = enhanceAction(
  async (data, user) => {
    const client = getPaymentDbClient();

    const { data: methods, error: loadError } = await client
      .from('school_payment_methods')
      .select('*')
      .eq('school_id', data.schoolId);

    if (loadError) {
      throw loadError;
    }

    const target = (methods ?? []).find((method) => method.id === data.methodId);

    if (!target) {
      throw new Error('Payment method not found');
    }

    if (!data.isEnabled) {
      const enabledCount = (methods ?? []).filter(
        (method) => method.is_enabled && method.id !== data.methodId,
      ).length;

      if (enabledCount === 0) {
        throw new Error('At least one payment method must remain enabled');
      }
    }

    if (data.isDefault) {
      await clearDefaultMethods(data.schoolId);
    }

    const { error } = await client
      .from('school_payment_methods')
      .update({
        is_enabled: data.isEnabled,
        is_default: data.isDefault ?? target.is_default,
      })
      .eq('id', data.methodId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    await logPaymentAudit(
      data.schoolId,
      {
        action: data.isEnabled ? 'method_enabled' : 'method_disabled',
        entityType: 'school_payment_method',
        entityId: data.methodId,
        details: { method: target.method },
      },
      user.id,
    );

    revalidatePaymentPaths();
    return { success: true };
  },
  { schema: UpdatePaymentMethodSchema },
);

export const upsertPaymentAccountAction = enhanceAction(
  async (data, user) => {
    const client = getPaymentDbClient();

    if (data.isDefault) {
      await clearDefaultAccounts(data.schoolId);
    }

    const payload = {
      school_id: data.schoolId,
      campus_id: data.campusId || null,
      bank_name: data.bankName,
      bank_code: data.bankCode,
      account_number: data.accountNumber,
      account_name: data.accountName,
      branch: data.branch || null,
      logo_url: data.logoUrl || null,
      is_default: data.isDefault,
      status: data.status,
    };

    if (data.accountId) {
      const { error } = await client
        .from('payment_accounts')
        .update(payload)
        .eq('id', data.accountId)
        .eq('school_id', data.schoolId);

      if (error) {
        throw error;
      }

      await logPaymentAudit(
        data.schoolId,
        {
          action: 'account_updated',
          entityType: 'payment_account',
          entityId: data.accountId,
        },
        user.id,
      );
    } else {
      const { data: created, error } = await client
        .from('payment_accounts')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      await logPaymentAudit(
        data.schoolId,
        {
          action: 'account_created',
          entityType: 'payment_account',
          entityId: created?.id,
        },
        user.id,
      );
    }

    revalidatePaymentPaths();
    return { success: true };
  },
  { schema: UpsertPaymentAccountSchema },
);

export const setDefaultPaymentAccountAction = enhanceAction(
  async (data, user) => {
    const client = getPaymentDbClient();

    await clearDefaultAccounts(data.schoolId);

    const { error } = await client
      .from('payment_accounts')
      .update({ is_default: true })
      .eq('id', data.accountId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    await logPaymentAudit(
      data.schoolId,
      {
        action: 'account_default_changed',
        entityType: 'payment_account',
        entityId: data.accountId,
      },
      user.id,
    );

    revalidatePaymentPaths();
    return { success: true };
  },
  { schema: SetDefaultPaymentAccountSchema },
);

export const deactivatePaymentAccountAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const paymentClient = getPaymentDbClient();

    const { count, error: usageError } = await client
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', data.schoolId)
      .eq('payment_account_id', data.accountId);

    if (usageError) {
      throw usageError;
    }

    if ((count ?? 0) > 0) {
      const { error } = await paymentClient
        .from('payment_accounts')
        .update({ status: 'inactive', is_default: false })
        .eq('id', data.accountId)
        .eq('school_id', data.schoolId);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await paymentClient
        .from('payment_accounts')
        .delete()
        .eq('id', data.accountId)
        .eq('school_id', data.schoolId);

      if (error) {
        throw error;
      }
    }

    await logPaymentAudit(
      data.schoolId,
      {
        action: 'account_deactivated',
        entityType: 'payment_account',
        entityId: data.accountId,
      },
      user.id,
    );

    revalidatePaymentPaths();
    return { success: true };
  },
  { schema: DeactivatePaymentAccountSchema },
);

export const updatePaymentInstructionsAction = enhanceAction(
  async (data, user) => {
    const client = getPaymentDbClient();

    const { data: existing } = await client
      .from('payment_instructions')
      .select('id')
      .eq('school_id', data.schoolId)
      .maybeSingle();

    const payload = {
      title: data.title,
      description: data.description || null,
      image_url: data.imageUrl || null,
      video_url: data.videoUrl || null,
      notes: data.notes || null,
    };

    if (existing?.id) {
      const { error } = await client
        .from('payment_instructions')
        .update(payload)
        .eq('id', existing.id)
        .eq('school_id', data.schoolId);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await client.from('payment_instructions').insert({
        school_id: data.schoolId,
        ...payload,
      });

      if (error) {
        throw error;
      }
    }

    await logPaymentAudit(
      data.schoolId,
      {
        action: 'instructions_updated',
        entityType: 'payment_instructions',
      },
      user.id,
    );

    revalidatePaymentPaths();
    return { success: true };
  },
  { schema: UpdatePaymentInstructionsSchema },
);
