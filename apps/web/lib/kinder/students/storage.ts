export const STUDENT_PHOTOS_BUCKET = 'student_photos';

export const STUDENT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const STUDENT_PHOTO_OPTIMIZE_THRESHOLD_BYTES = 1024 * 1024;

export const STUDENT_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function buildStudentPhotoStoragePath(
  schoolId: string,
  studentId: string,
  fileName: string,
) {
  return `${schoolId}/${studentId}/${fileName}`;
}

export function validateStudentPhotoFile(file: File) {
  if (
    !STUDENT_PHOTO_MIME_TYPES.includes(
      file.type as (typeof STUDENT_PHOTO_MIME_TYPES)[number],
    )
  ) {
    throw new Error('UNSUPPORTED_IMAGE_TYPE');
  }

  if (file.size > STUDENT_PHOTO_MAX_BYTES) {
    throw new Error('IMAGE_TOO_LARGE');
  }
}
