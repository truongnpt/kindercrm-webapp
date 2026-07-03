export const COMMUNICATION_MEDIA_BUCKET = 'communication_media';

/** Compress client-side when the original file exceeds this size. */
export const COMMUNICATION_IMAGE_OPTIMIZE_THRESHOLD_BYTES = 5 * 1024 * 1024;

/** Hard limit after optimization (and for files already under the threshold). */
export const COMMUNICATION_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const COMMUNICATION_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const COMMUNICATION_IMAGE_MESSAGE_PREVIEW = '📷';

export function buildCommunicationMediaStoragePath(
  schoolId: string,
  threadId: string,
  fileName: string,
) {
  return `${schoolId}/${threadId}/${fileName}`;
}

export function isCommunicationImageMimeType(mimeType: string | null | undefined) {
  return Boolean(
    mimeType &&
      COMMUNICATION_IMAGE_MIME_TYPES.includes(
        mimeType as (typeof COMMUNICATION_IMAGE_MIME_TYPES)[number],
      ),
  );
}

export function buildCommunicationMessagePreview(input: {
  body: string;
  attachmentMimeType?: string | null;
}) {
  const trimmed = input.body.trim();

  if (trimmed) {
    return trimmed.slice(0, 200);
  }

  if (isCommunicationImageMimeType(input.attachmentMimeType)) {
    return COMMUNICATION_IMAGE_MESSAGE_PREVIEW;
  }

  return trimmed;
}

export function assertCommunicationMediaStoragePath(
  storagePath: string,
  schoolId: string,
  threadId: string,
) {
  const [pathSchoolId, pathThreadId] = storagePath.split('/');

  if (pathSchoolId !== schoolId || pathThreadId !== threadId) {
    throw new Error('Invalid attachment path');
  }
}

export function validateCommunicationImageFile(file: File) {
  if (
    !COMMUNICATION_IMAGE_MIME_TYPES.includes(
      file.type as (typeof COMMUNICATION_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new Error('UNSUPPORTED_IMAGE_TYPE');
  }

  if (file.type === 'image/gif' && file.size > COMMUNICATION_IMAGE_MAX_BYTES) {
    throw new Error('IMAGE_TOO_LARGE');
  }
}
