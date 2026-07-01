export const DAILY_REPORT_MEDIA_BUCKET = 'daily_report_media';

export const DAILY_REPORT_MEDIA_MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const DAILY_REPORT_MEDIA_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const DAILY_REPORT_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const DAILY_REPORT_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export function buildDailyReportStoragePath(
  schoolId: string,
  reportId: string,
  fileName: string,
) {
  return `${schoolId}/${reportId}/${fileName}`;
}

export function getMediaTypeFromMime(mimeType: string): 'photo' | 'video' {
  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return 'photo';
}

export function validateDailyReportMediaFile(file: File) {
  const isPhoto = DAILY_REPORT_PHOTO_MIME_TYPES.includes(
    file.type as (typeof DAILY_REPORT_PHOTO_MIME_TYPES)[number],
  );
  const isVideo = DAILY_REPORT_VIDEO_MIME_TYPES.includes(
    file.type as (typeof DAILY_REPORT_VIDEO_MIME_TYPES)[number],
  );

  if (!isPhoto && !isVideo) {
    throw new Error('Unsupported file type');
  }

  const maxSize = isVideo
    ? DAILY_REPORT_MEDIA_MAX_VIDEO_BYTES
    : DAILY_REPORT_MEDIA_MAX_PHOTO_BYTES;

  if (file.size > maxSize) {
    throw new Error('File is too large');
  }

  return getMediaTypeFromMime(file.type);
}
