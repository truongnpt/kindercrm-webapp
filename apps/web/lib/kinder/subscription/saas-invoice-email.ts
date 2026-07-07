import pathsConfig from '~/config/paths.config';
import appConfig from '~/config/app.config';

import { formatVnd } from '~/lib/kinder/billing/format-currency';

import type { SaasInvoicePdfData } from './generate-saas-invoice-pdf';

const PRIMARY = '#034cf8';

function formatDateLabel(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function buildSaasInvoiceEmail(input: {
  schoolName: string;
  ownerName: string | null;
  invoice: SaasInvoicePdfData;
}) {
  const subscriptionUrl = `${appConfig.url.replace(/\/$/, '')}${pathsConfig.app.settingsSubscription}?tab=history`;
  const greeting = input.ownerName ? `Xin chào ${input.ownerName},` : 'Xin chào,';
  const periodLabel =
    input.invoice.billingPeriodStart || input.invoice.billingPeriodEnd
      ? `${formatDateLabel(input.invoice.billingPeriodStart)} – ${formatDateLabel(input.invoice.billingPeriodEnd)}`
      : '—';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(3,76,248,0.08);">
        <tr><td style="background:${PRIMARY};padding:28px 32px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Kinder CRM</p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Hóa đơn phí phần mềm</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
          <h1 style="margin:0 0 12px;font-size:22px;color:#1a1a2e;">Hóa đơn ${input.invoice.invoiceNumber}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#4a4a68;">Cảm ơn bạn đã thanh toán gói <strong>${input.invoice.packageName}</strong> cho <strong>${input.schoolName}</strong>. Hóa đơn GTGT đính kèm trong email này.</p>
          <table role="presentation" width="100%" style="margin:0 0 24px;font-size:14px;color:#4a4a68;border-collapse:collapse;">
            <tr><td style="padding:6px 0;">Kỳ thanh toán</td><td style="padding:6px 0;text-align:right;"><strong>${periodLabel}</strong></td></tr>
            <tr><td style="padding:6px 0;">Tạm tính</td><td style="padding:6px 0;text-align:right;">${formatVnd(input.invoice.subtotal)}</td></tr>
            <tr><td style="padding:6px 0;">Thuế GTGT (${input.invoice.vatRate}%)</td><td style="padding:6px 0;text-align:right;">${formatVnd(input.invoice.vatAmount)}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Tổng thanh toán</td><td style="padding:6px 0;text-align:right;font-weight:600;">${formatVnd(input.invoice.totalAmount)}</td></tr>
          </table>
          <a href="${subscriptionUrl}" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Xem lịch sử gói</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

Hóa đơn ${input.invoice.invoiceNumber} — gói ${input.invoice.packageName} cho ${input.schoolName}.

Kỳ thanh toán: ${periodLabel}
Tổng thanh toán: ${formatVnd(input.invoice.totalAmount)}

Xem lịch sử: ${subscriptionUrl}`;

  return {
    subject: `Hóa đơn Kinder CRM ${input.invoice.invoiceNumber} — ${input.schoolName}`,
    html,
    text,
  };
}
