import 'server-only';

import { isSmtpConfigured } from '~/lib/kinder/mail/smtp-config';
import { sendMail } from '~/lib/kinder/mail/send-mail';

export function getEnterpriseSalesEmail() {
  return process.env.ENTERPRISE_SALES_EMAIL?.trim() ?? null;
}

export async function notifyEnterpriseSalesTeam(input: {
  schoolName: string;
  schoolSlug: string;
  contactName: string;
  phone: string;
  campusCount: number;
  notes: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
}) {
  const salesEmail = getEnterpriseSalesEmail();

  if (!salesEmail || !isSmtpConfigured()) {
    return { sent: false as const };
  }

  const lines = [
    `Trường: ${input.schoolName} (${input.schoolSlug})`,
    `Người liên hệ: ${input.contactName}`,
    `SĐT: ${input.phone}`,
    `Số cơ sở dự kiến: ${input.campusCount}`,
    input.submitterName || input.submitterEmail
      ? `Owner: ${input.submitterName ?? '—'}${input.submitterEmail ? ` <${input.submitterEmail}>` : ''}`
      : null,
    input.notes ? `Ghi chú: ${input.notes}` : null,
  ].filter(Boolean);

  await sendMail({
    to: salesEmail,
    subject: `[Kinder CRM] Yêu cầu Enterprise — ${input.schoolName}`,
    text: lines.join('\n'),
    html: `<pre style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${lines.join('\n')}</pre>`,
  });

  return { sent: true as const };
}
