'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export const PAYMENT_PROOFS_BUCKET = 'payment_proofs';

export function buildPaymentProofStoragePath(
  schoolId: string,
  invoiceId: string,
  fileName: string,
) {
  return `${schoolId}/${invoiceId}/${fileName}`;
}

export async function uploadPaymentProof(
  client: SupabaseClient,
  input: {
    schoolId: string;
    invoiceId: string;
    file: File;
  },
) {
  const extension = input.file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = `proof-${crypto.randomUUID()}.${extension}`;
  const storagePath = buildPaymentProofStoragePath(
    input.schoolId,
    input.invoiceId,
    safeName,
  );

  const { error } = await client.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(storagePath, await input.file.arrayBuffer(), {
      contentType: input.file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = client.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .getPublicUrl(storagePath);

  return {
    proofUrl: data.publicUrl,
    storagePath,
  };
}
