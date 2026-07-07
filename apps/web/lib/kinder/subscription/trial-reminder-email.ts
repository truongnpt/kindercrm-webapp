import pathsConfig from '~/config/paths.config';
import appConfig from '~/config/app.config';

import type { TrialReminderKind } from './package-features';

const PRIMARY = '#034cf8';

const COPY: Record<
  TrialReminderKind,
  { subject: (schoolName: string) => string; headline: string; body: string; cta: string }
> = {
  t7: {
    subject: (school) => `Còn 7 ngày dùng thử Kinder CRM — ${school}`,
    headline: 'Còn 7 ngày dùng thử',
    body: 'Gói dùng thử của bạn sẽ kết thúc sau 7 ngày. Nâng cấp ngay để tiếp tục sử dụng đầy đủ tính năng sau khi hết hạn.',
    cta: 'Xem gói & nâng cấp',
  },
  t3: {
    subject: (school) => `Còn 3 ngày dùng thử — ${school}`,
    headline: 'Còn 3 ngày dùng thử',
    body: 'Chỉ còn 3 ngày để bạn trải nghiệm đầy đủ mọi module. Hãy chọn gói phù hợp trước khi trial kết thúc.',
    cta: 'Nâng cấp gói',
  },
  t1: {
    subject: (school) => `Ngày mai hết hạn dùng thử — ${school}`,
    headline: 'Trial kết thúc vào ngày mai',
    body: 'Gói dùng thử của trường bạn sẽ hết hạn vào ngày mai. Nâng cấp hôm nay để không bị gián đoạn.',
    cta: 'Nâng cấp ngay',
  },
  expired: {
    subject: (school) => `Hôm nay hết hạn dùng thử — ${school}`,
    headline: 'Hôm nay là ngày cuối dùng thử',
    body: 'Gói dùng thử của trường bạn kết thúc hôm nay. Nâng cấp ngay để tiếp tục sử dụng đầy đủ tính năng sau khi hết hạn.',
    cta: 'Nâng cấp ngay',
  },
};

function formatTrialEndDate(trialEndsAt: string) {
  return new Date(trialEndsAt).toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function buildTrialReminderEmail(input: {
  schoolName: string;
  ownerName: string | null;
  trialEndsAt: string;
  kind: TrialReminderKind;
}) {
  const copy = COPY[input.kind];
  const subscriptionUrl = `${appConfig.url.replace(/\/$/, '')}${pathsConfig.app.settingsSubscription}`;
  const greeting = input.ownerName ? `Xin chào ${input.ownerName},` : 'Xin chào,';
  const trialEndLabel = formatTrialEndDate(input.trialEndsAt);

  const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(3,76,248,0.08);">
        <tr><td style="background:${PRIMARY};padding:28px 32px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Kinder CRM</p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${input.schoolName}</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
          <h1 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;">${copy.headline}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#4a4a68;">${copy.body}</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b6b80;">Ngày kết thúc dùng thử: <strong>${trialEndLabel}</strong></p>
          <a href="${subscriptionUrl}" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">${copy.cta}</a>
          <p style="margin:24px 0 0;font-size:12px;color:#8b8ba3;line-height:1.5;">Nếu nút không hoạt động, mở liên kết: <a href="${subscriptionUrl}" style="color:${PRIMARY};">${subscriptionUrl}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

${copy.headline}

${copy.body}

Ngày kết thúc dùng thử: ${trialEndLabel}

${copy.cta}: ${subscriptionUrl}`;

  return {
    subject: copy.subject(input.schoolName),
    html,
    text,
  };
}
