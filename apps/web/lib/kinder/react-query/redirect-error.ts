const REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

export function getRedirectUrlFromError(error: unknown): string | null {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('digest' in error) ||
    typeof (error as { digest: unknown }).digest !== 'string'
  ) {
    return null;
  }

  const digest = (error as { digest: string }).digest;

  if (!digest.startsWith(REDIRECT_ERROR_CODE)) {
    return null;
  }

  const [, , url] = digest.split(';');

  return url || null;
}
