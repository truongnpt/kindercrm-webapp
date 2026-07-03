import type { jsPDF } from 'jspdf';

const NOTO_SANS_URL =
  'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';

const NOTO_SANS_FILE = 'NotoSans-Regular.ttf';
const NOTO_SANS_FAMILY = 'NotoSans';

let fontBase64Promise: Promise<string> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function loadNotoSansBase64() {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(NOTO_SANS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load PDF font');
        }

        return response.arrayBuffer();
      })
      .then(arrayBufferToBase64);
  }

  return fontBase64Promise;
}

export async function applyUnicodePdfFont(doc: jsPDF) {
  const fontList = doc.getFontList() as Record<string, unknown>;

  if (!fontList[NOTO_SANS_FAMILY]) {
    const base64 = await loadNotoSansBase64();
    doc.addFileToVFS(NOTO_SANS_FILE, base64);
    doc.addFont(NOTO_SANS_FILE, NOTO_SANS_FAMILY, 'normal');
  }

  doc.setFont(NOTO_SANS_FAMILY, 'normal');
}

export function downloadPdfBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
