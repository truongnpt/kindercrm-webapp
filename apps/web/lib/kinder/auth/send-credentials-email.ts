import 'server-only';

import appConfig from '~/config/app.config';

export type AccountCredentialsType = 'staff' | 'parent';

type SendCredentialsEmailInput = {
  to: string;
  name: string;
  password: string;
  accountType: AccountCredentialsType;
  schoolName?: string;
};

function getEmailSubject(accountType: AccountCredentialsType, schoolName?: string) {
  const product = appConfig.name;

  if (accountType === 'parent') {
    return schoolName ?
        `[${schoolName}] Tài khoản cổng phụ huynh / Parent portal account`
      : `[${product}] Tài khoản cổng phụ huynh / Parent portal account`;
  }

  return schoolName ?
      `[${schoolName}] Tài khoản nhân viên / Staff account`
    : `[${product}] Tài khoản nhân viên / Staff account`;
}

function buildEmailHtml(input: SendCredentialsEmailInput) {
  const loginUrl = `${appConfig.url}/auth/sign-in`;
  const portalHint =
    input.accountType === 'parent' ?
      'Đăng nhập để theo dõi học sinh trên cổng phụ huynh. / Sign in to follow your child on the parent portal.'
    : 'Đăng nhập để truy cập hệ thống quản lý trường. / Sign in to access the school workspace.';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Xin chào ${input.name},</p>
      <p>Hello ${input.name},</p>
      <p>${portalHint}</p>
      ${
        input.schoolName ?
          `<p><strong>Trường / School:</strong> ${input.schoolName}</p>`
        : ''
      }
      <p><strong>Email:</strong> ${input.to}</p>
      <p><strong>Mật khẩu / Password:</strong> ${input.password}</p>
      <p>
        <a href="${loginUrl}" style="display:inline-block;padding:10px 16px;background:#465fff;color:#fff;text-decoration:none;border-radius:8px;">
          Đăng nhập / Sign in
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu. /
        Please change your password after your first sign-in.
      </p>
    </div>
  `;
}

async function sendWithResend(input: SendCredentialsEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_SENDER;

  if (!apiKey || !from) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: getEmailSubject(input.accountType, input.schoolName),
      html: buildEmailHtml(input),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed: ${response.status} ${body}`);
  }

  return true;
}

async function sendWithSmtp(input: SendCredentialsEmailInput) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT ?? 587);
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_SENDER;
  const secure = process.env.EMAIL_TLS === 'true';

  if (!host || !from) {
    return false;
  }

  try {
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && password ?
          {
            user,
            pass: password,
          }
        : undefined,
    });

    await transport.sendMail({
      from,
      to: input.to,
      subject: getEmailSubject(input.accountType, input.schoolName),
      html: buildEmailHtml(input),
    });

    return true;
  } catch {
    return false;
  }
}

export async function sendCredentialsEmail(input: SendCredentialsEmailInput) {
  if (await sendWithResend(input)) {
    return { sent: true as const, transport: 'resend' as const };
  }

  if (await sendWithSmtp(input)) {
    return { sent: true as const, transport: 'smtp' as const };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[kinder] Credentials email (dev fallback)', {
      to: input.to,
      accountType: input.accountType,
      password: input.password,
      loginUrl: `${appConfig.url}/auth/sign-in`,
    });

    return { sent: true as const, transport: 'dev-log' as const };
  }

  throw new Error(
    'Email is not configured. Set RESEND_API_KEY or EMAIL_HOST/EMAIL_SENDER.',
  );
}
