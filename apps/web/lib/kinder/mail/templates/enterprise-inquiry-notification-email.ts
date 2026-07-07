import 'server-only';

export function buildEnterpriseInquiryNotificationEmail(input: {
  schoolName: string;
  schoolSlug: string;
  contactName: string;
  phone: string;
  campusCount: number;
  notes: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
}) {
  const ownerLabel =
    input.submitterName || input.submitterEmail
      ? `${input.submitterName ?? '—'}${input.submitterEmail ? ` <${input.submitterEmail}>` : ''}`
      : '—';

  const notesLabel = input.notes?.trim() || '—';
  const subject = `[Kinder CRM] Yêu cầu Enterprise — ${input.schoolName}`;

  const text = [
    'Yêu cầu Enterprise mới',
    '',
    `Trường: ${input.schoolName} (${input.schoolSlug})`,
    `Người liên hệ: ${input.contactName}`,
    `Số điện thoại: ${input.phone}`,
    `Số cơ sở dự kiến: ${input.campusCount}`,
    `Owner: ${ownerLabel}`,
    `Ghi chú: ${notesLabel}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="vi" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6fb;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
          sans-serif;
        color: #1a1a2e;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
        }
        .email-body {
          padding: 24px 20px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f6fb">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6fb">
      <tr>
        <td align="center" style="padding: 40px 16px">
          <table role="presentation" class="email-container" width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%">
            <tr>
              <td align="center" style="padding-bottom: 24px; font-size: 20px; font-weight: 700; color: #034cf8; letter-spacing: -0.02em;">
                Kinder CRM
              </td>
            </tr>
            <tr>
              <td class="email-body" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e8ecf4; padding: 40px 36px; box-shadow: 0 4px 24px rgba(3, 76, 248, 0.06);">
                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; line-height: 1.3; color: #1a1a2e; letter-spacing: -0.02em;">
                  Yêu cầu Enterprise mới
                </h2>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                  Có một yêu cầu liên hệ Enterprise mới từ website Kinder CRM.
                </p>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6; color: #4a5568;">
                  <tr><td style="padding: 6px 0; width: 42%;">Trường</td><td style="padding: 6px 0;"><strong>${input.schoolName}</strong> (${input.schoolSlug})</td></tr>
                  <tr><td style="padding: 6px 0;">Người liên hệ</td><td style="padding: 6px 0;">${input.contactName}</td></tr>
                  <tr><td style="padding: 6px 0;">Số điện thoại</td><td style="padding: 6px 0;">${input.phone}</td></tr>
                  <tr><td style="padding: 6px 0;">Số cơ sở dự kiến</td><td style="padding: 6px 0;">${input.campusCount}</td></tr>
                  <tr><td style="padding: 6px 0;">Owner</td><td style="padding: 6px 0;">${ownerLabel}</td></tr>
                  <tr><td style="padding: 6px 0; vertical-align: top;">Ghi chú</td><td style="padding: 6px 0; white-space: pre-wrap;">${notesLabel}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
