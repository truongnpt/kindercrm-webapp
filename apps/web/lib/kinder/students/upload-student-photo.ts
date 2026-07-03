'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  buildStudentPhotoStoragePath,
  STUDENT_PHOTOS_BUCKET,
} from './storage';

export async function uploadStudentPhoto(
  client: SupabaseClient,
  input: {
    schoolId: string;
    studentId: string;
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
          : 'jpg';
  const fileName = `avatar-${crypto.randomUUID()}.${extension}`;
  const storagePath = buildStudentPhotoStoragePath(
    input.schoolId,
    input.studentId,
    fileName,
  );

  const { error } = await client.storage
    .from(STUDENT_PHOTOS_BUCKET)
    .upload(storagePath, await input.file.arrayBuffer(), {
      contentType: input.file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return getStudentPhotoPublicUrl(client, storagePath);
}

export function getStudentPhotoPublicUrl(
  client: SupabaseClient,
  storagePath: string,
) {
  return client.storage.from(STUDENT_PHOTOS_BUCKET).getPublicUrl(storagePath)
    .data.publicUrl;
}
