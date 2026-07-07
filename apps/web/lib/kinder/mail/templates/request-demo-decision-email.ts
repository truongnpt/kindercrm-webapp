import 'server-only';

export function buildRequestDemoDecisionEmail(input: {
  schoolName: string;
  decision: 'approved' | 'rejected';
}) {
  const isApproved = input.decision === 'approved';

  const subject = isApproved
    ? '[Kinder CRM] Cảm ơn bạn đã đặt lịch demo'
    : '[Kinder CRM] Cảm ơn bạn đã quan tâm đến lịch demo';

  const text = isApproved
    ? [
        `Xin chào ${input.schoolName},`,
        '',
        'Cảm ơn bạn đã gửi yêu cầu đặt lịch demo với Kinder CRM.',
        'Chúng tôi sẽ liên hệ với bạn để trao đổi thêm và sắp xếp lịch phù hợp.',
        '',
        'Trân trọng,',
        'Kinder CRM',
      ].join('\n')
    : [
        `Xin chào ${input.schoolName},`,
        '',
        'Cảm ơn bạn đã quan tâm đến Kinder CRM.',
        'Rất tiếc thời điểm này chúng tôi không thể tiến hành demo.',
        'Chúng tôi sẽ liên hệ với bạn khi hệ thống đã sẵn sàng.',
        '',
        'Trân trọng,',
        'Kinder CRM',
      ].join('\n');

  const title = isApproved
    ? 'Yêu cầu demo đã được xác nhận'
    : 'Phản hồi yêu cầu demo';

  const paragraph1 = isApproved
    ? 'Cảm ơn bạn đã gửi yêu cầu đặt lịch demo với Kinder CRM.'
    : 'Cảm ơn bạn đã quan tâm và gửi yêu cầu demo đến Kinder CRM.';

  const paragraph2 = isApproved
    ? 'Đội ngũ của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để trao đổi thêm và sắp xếp lịch phù hợp.'
    : 'Rất tiếc tại thời điểm này chúng tôi chưa thể tiến hành demo. Chúng tôi sẽ chủ động liên hệ lại khi hệ thống đã sẵn sàng hơn cho nhu cầu này.';

  return {
    subject,
    text,
    html: `<!DOCTYPE html>
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
                  ${title}
                </h2>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                  Xin chào ${input.schoolName},
                </p>
                <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                  ${paragraph1}
                </p>
                <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                  ${paragraph2}
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #718096;">
                  Trân trọng,<br />
                  Kinder CRM
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px 16px 0; font-size: 12px; line-height: 1.5; color: #a0aec0;">
                &copy; Kinder CRM — Nền tảng quản lý trường mầm non
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
