import appConfig from '@/config/app.config';
import 'server-only';

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();

  if (!host) {
    throw new Error('SMTP_HOST is not configured');
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL?.trim() ?? 'noreply@kindercrm.local';
  const fromName = process.env.SMTP_FROM_NAME?.trim() ?? appConfig.name;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    from: `${fromName} <${fromEmail}>`,
    fromEmail,
    fromName,
  };
}
