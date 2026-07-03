'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export const STAFF_DOCUMENTS_BUCKET = 'staff_documents';

export function buildStaffDocumentStoragePath(
  schoolId: string,
  employeeId: string,
  fileName: string,
) {
  return `${schoolId}/${employeeId}/${fileName}`;
}

export async function uploadStaffDocument(
  client: SupabaseClient,
  input: {
    schoolId: string;
    employeeId: string;
    file: File;
  },
) {
  const extension = input.file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = `doc-${crypto.randomUUID()}.${extension}`;
  const storagePath = buildStaffDocumentStoragePath(
    input.schoolId,
    input.employeeId,
    safeName,
  );

  const { error } = await client.storage
    .from(STAFF_DOCUMENTS_BUCKET)
    .upload(storagePath, await input.file.arrayBuffer(), {
      contentType: input.file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = client.storage
    .from(STAFF_DOCUMENTS_BUCKET)
    .getPublicUrl(storagePath);

  return {
    fileUrl: data.publicUrl,
    storagePath,
    fileName: input.file.name,
  };
}

export async function getStaffDocumentSignedUrl(
  client: SupabaseClient,
  storagePath: string,
) {
  const { data, error } = await client.storage
    .from(STAFF_DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
