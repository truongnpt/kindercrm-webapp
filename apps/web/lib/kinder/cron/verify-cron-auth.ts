import 'server-only';

export function verifyCronAuth(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const authorization = request.headers.get('authorization');

  return authorization === `Bearer ${secret}`;
}
