import 'server-only';

import { isSmtpConfigured } from '~/lib/kinder/mail/smtp-config';
import { sendMail } from '~/lib/kinder/mail/send-mail';
import { buildEnterpriseInquiryNotificationEmail } from '~/lib/kinder/mail/templates/enterprise-inquiry-notification-email';

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

  const template = buildEnterpriseInquiryNotificationEmail({
    schoolName: input.schoolName,
    schoolSlug: input.schoolSlug,
    contactName: input.contactName,
    phone: input.phone,
    campusCount: input.campusCount,
    notes: input.notes,
    submitterName: input.submitterName,
    submitterEmail: input.submitterEmail,
  });

  await sendMail({
    to: salesEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { sent: true as const };
}
