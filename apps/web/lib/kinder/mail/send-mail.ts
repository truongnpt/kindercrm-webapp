import 'server-only';

import nodemailer from 'nodemailer';

import { getSmtpConfig, isSmtpConfigured } from './smtp-config';

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured');
  }

  const config = getSmtpConfig();
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transport.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: input.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType ?? 'application/octet-stream',
    })),
  });
}
