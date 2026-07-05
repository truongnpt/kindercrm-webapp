import 'server-only';

import { getPaymentDbClient } from './payment-db';
import type { SchoolPaymentMethodType } from './types';

const DEFAULT_METHODS: SchoolPaymentMethodType[] = [
  'cash',
  'bank_transfer',
  'qr_banking',
];

export async function ensurePaymentSettingsInitialized(schoolId: string) {
  const client = getPaymentDbClient();

  const { data: existing } = await client
    .from('school_payment_methods')
    .select('id')
    .eq('school_id', schoolId)
    .limit(1);

  if (existing && existing.length > 0) {
    return;
  }

  await client.from('school_payment_methods').insert(
    DEFAULT_METHODS.map((method, index) => ({
      school_id: schoolId,
      method,
      is_enabled: true,
      is_default: index === 1,
    })),
  );

  const { data: instructions } = await client
    .from('payment_instructions')
    .select('id')
    .eq('school_id', schoolId)
    .limit(1);

  if (!instructions || instructions.length === 0) {
    await client.from('payment_instructions').insert({
      school_id: schoolId,
      title: 'Payment instructions',
      description:
        '1. Scan the QR code.\n2. Verify the amount.\n3. Do not change the transfer content.\n4. Complete the transaction.',
    });
  }
}
