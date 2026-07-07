import 'server-only';

import { isSmtpConfigured } from '~/lib/kinder/mail/smtp-config';
import { sendMail } from '~/lib/kinder/mail/send-mail';
import { buildRequestDemoDecisionEmail } from '~/lib/kinder/mail/templates/request-demo-decision-email';

export async function sendDemoRequestDecisionEmail(input: {
  to: string;
  schoolName: string;
  decision: 'approved' | 'rejected';
}) {
  if (!isSmtpConfigured()) {
    return { sent: false as const };
  }

  const template = buildRequestDemoDecisionEmail({
    schoolName: input.schoolName,
    decision: input.decision,
  });

  await sendMail({
    to: input.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  return { sent: true as const };
}
