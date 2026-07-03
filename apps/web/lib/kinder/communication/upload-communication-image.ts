'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  buildCommunicationMediaStoragePath,
  COMMUNICATION_MEDIA_BUCKET,
} from './storage';

export async function uploadCommunicationImage(
  client: SupabaseClient,
  input: {
    schoolId: string;
    threadId: string;
    file: File;
  },
) {
  const extension =
    input.file.type === 'image/jpeg'
      ? 'jpg'
      : input.file.type === 'image/png'
        ? 'png'
        : input.file.type === 'image/webp'
          ? 'webp'
          : input.file.type === 'image/gif'
            ? 'gif'
            : 'jpg';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const storagePath = buildCommunicationMediaStoragePath(
    input.schoolId,
    input.threadId,
    fileName,
  );

  const { error } = await client.storage
    .from(COMMUNICATION_MEDIA_BUCKET)
    .upload(storagePath, await input.file.arrayBuffer(), {
      contentType: input.file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return {
    storagePath,
    fileName: input.file.name,
    mimeType: input.file.type,
  };
}

export function getCommunicationImagePublicUrl(
  client: SupabaseClient,
  storagePath: string,
) {
  return client.storage
    .from(COMMUNICATION_MEDIA_BUCKET)
    .getPublicUrl(storagePath).data.publicUrl;
}
