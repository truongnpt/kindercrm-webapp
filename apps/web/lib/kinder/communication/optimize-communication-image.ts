import {
  COMMUNICATION_IMAGE_MAX_BYTES,
  COMMUNICATION_IMAGE_OPTIMIZE_THRESHOLD_BYTES,
  validateCommunicationImageFile,
} from './storage';

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('IMAGE_LOAD_FAILED'));
    };

    image.src = objectUrl;
  });
}

function canvasToJpegBlob(
  image: HTMLImageElement,
  maxDimension: number,
  quality: number,
) {
  const scale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('IMAGE_CANVAS_FAILED');
  }

  context.drawImage(image, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('IMAGE_ENCODE_FAILED'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

async function compressImageUnderLimit(file: File) {
  const image = await loadImage(file);
  let maxDimension = 2048;
  let quality = 0.88;
  let bestBlob: Blob | null = null;

  while (quality >= 0.45) {
    const blob = await canvasToJpegBlob(image, maxDimension, quality);
    bestBlob = blob;

    if (blob.size <= COMMUNICATION_IMAGE_OPTIMIZE_THRESHOLD_BYTES) {
      return blob;
    }

    quality -= 0.08;

    if (quality < 0.55) {
      maxDimension = Math.round(maxDimension * 0.8);
      quality = 0.82;
    }
  }

  if (!bestBlob || bestBlob.size > COMMUNICATION_IMAGE_MAX_BYTES) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  return bestBlob;
}

export async function optimizeCommunicationImage(file: File) {
  validateCommunicationImageFile(file);

  if (file.size <= COMMUNICATION_IMAGE_OPTIMIZE_THRESHOLD_BYTES) {
    if (file.size > COMMUNICATION_IMAGE_MAX_BYTES) {
      throw new Error('IMAGE_TOO_LARGE');
    }

    return { file, optimized: false };
  }

  if (file.type === 'image/gif') {
    if (file.size > COMMUNICATION_IMAGE_MAX_BYTES) {
      throw new Error('IMAGE_TOO_LARGE');
    }

    return { file, optimized: false };
  }

  const blob = await compressImageUnderLimit(file);
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  const optimizedFile = new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  return { file: optimizedFile, optimized: true };
}
