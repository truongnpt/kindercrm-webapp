import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

import { buildVietQrImageUrl } from '../finance/vietqr';
import { getPaymentDbClient } from './payment-db';
import { buildTransferContent } from './transfer-content';
import type { PaymentAccount } from './types';

export async function resolveDefaultPaymentAccount(schoolId: string) {
  const client = getPaymentDbClient();

  const { data, error } = await client
    .from('payment_accounts')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data ?? null) as PaymentAccount | null;
}

export function buildInvoiceQrUrl(
  account: PaymentAccount,
  amount: number,
  transferContent: string,
) {
  return buildVietQrImageUrl({
    config: {
      bankBin: account.bank_code,
      accountNo: account.account_number,
      accountName: account.account_name,
    },
    amount,
    description: transferContent,
  });
}

export async function attachPaymentDetailsToInvoice(
  client: SupabaseClient<Database>,
  input: {
    schoolId: string;
    invoiceId: string;
    invoiceNumber: string;
    totalAmount: number;
  },
) {
  const account = await resolveDefaultPaymentAccount(input.schoolId);

  if (!account) {
    return;
  }

  const transferContent = buildTransferContent(input.invoiceNumber);
  const qrCodeUrl =
    input.totalAmount > 0 ?
      buildInvoiceQrUrl(account, input.totalAmount, transferContent)
    : null;

  await client
    .from('invoices')
    .update({
      payment_account_id: account.id,
      transfer_content: transferContent,
      qr_code_url: qrCodeUrl,
    })
    .eq('id', input.invoiceId)
    .eq('school_id', input.schoolId);
}
