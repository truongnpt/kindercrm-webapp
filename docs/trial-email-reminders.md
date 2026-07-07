# Hướng dẫn email nhắc trial (SUB-007)

Gửi email tự động cho **chủ trường (owner)** khi gói dùng thử sắp hết hạn.

## Lịch gửi

Cron chạy **01:30 UTC** hàng ngày (`/api/cron/trial-reminder-emails`), trước job hết hạn trial (02:00 UTC).

Cùng cron cũng tạo **thông báo in-app** (SUB-008) cho owner — hiển thị trên icon chuông, click mở `/app/settings/subscription`.

| Ngày còn lại (lịch VN) | Loại email | Nội dung |
|------------------------|------------|----------|
| 7 | `t7` | Còn 7 ngày dùng thử |
| 3 | `t3` | Còn 3 ngày |
| 1 | `t1` | Hết hạn vào ngày mai |
| 0 | `expired` | Hôm nay là ngày cuối dùng thử |

Mỗi loại chỉ gửi **một lần** cho mỗi trường (bảng `trial_email_reminders`).

Email có nút CTA → `/app/settings/subscription`.

---

## 1. Cấu hình SMTP

Dùng **cùng SMTP** với Supabase Auth (SendGrid, Mailgun, Brevo, …) hoặc provider riêng.

Thêm biến môi trường trên hosting (và `.env.local` khi dev):

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `SMTP_HOST` | Có | Host SMTP |
| `SMTP_PORT` | Khuyến nghị | `587` (STARTTLS) hoặc `465` (SSL) |
| `SMTP_USER` | Tuỳ provider | Username SMTP |
| `SMTP_PASSWORD` | Tuỳ provider | Mật khẩu / API key SMTP |
| `SMTP_FROM_EMAIL` | Có | Email người gửi (domain đã xác minh) |
| `SMTP_FROM_NAME` | Khuyến nghị | Ví dụ `Kinder CRM` |
| `SMTP_SECURE` | Tuỳ chọn | `true` nếu port 465 |
| `CRON_SECRET` | Có | Bảo vệ endpoint cron |

Nếu **không** set `SMTP_HOST`, cron vẫn chạy nhưng bỏ qua gửi mail (`smtpConfigured: false`).

### Local dev (Inbucket)

Khi chạy `pnpm supabase:web:start`, Supabase mở SMTP test tại port **55525**:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=55525
SMTP_FROM_EMAIL=noreply@localhost
SMTP_FROM_NAME=Kinder CRM
CRON_SECRET=dev-cron-secret
```

Xem email tại Mailpit/Inbucket: `http://127.0.0.1:55524`

---

## 2. Migration

```bash
cd apps/web
pnpm supabase db push
```

Migration `20260750000000_kinder_trial_email_reminders.sql` tạo bảng `trial_email_reminders`.

---

## 3. Deploy Vercel

`apps/web/vercel.json` đã đăng ký cron:

```json
{
  "path": "/api/cron/trial-reminder-emails",
  "schedule": "30 1 * * *"
}
```

Đảm bảo `CRON_SECRET` và các biến SMTP có trên **Production**.

---

## 4. Test thủ công

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/trial-reminder-emails
```

Kỳ vọng:

```json
{
  "ok": true,
  "email": {
    "sent": 0,
    "skipped": 5,
    "errors": 0,
    "smtpConfigured": true
  },
  "notifications": {
    "created": 1,
    "skipped": 4,
    "errors": 0
  }
}
```

Để test gửi thật:

1. Tạo trường trial với `trial_ends_at` = hôm nay + 7 ngày (hoặc chỉnh trong DB).
2. Đảm bảo owner có email trong `accounts`.
3. Gọi cron — kiểm tra Inbucket / hộp thư.

---

## 5. Xử lý sự cố

| Vấn đề | Cách xử lý |
|--------|------------|
| `smtpConfigured: false` | Set `SMTP_HOST` trên hosting |
| Owner không nhận mail | Kiểm tra `accounts.email`, spam folder, SPF/DKIM |
| Gửi trùng | Unique `(school_id, reminder_kind)` — không gửi lại |
| Không gửi đúng ngày | Cron dùng lịch **Asia/Ho_Chi_Minh**; kiểm tra `trial_ends_at` |

---

## 6. Tham chiếu mã nguồn

| File | Mô tả |
|------|--------|
| `lib/kinder/subscription/create-trial-in-app-notifications.ts` | Thông báo in-app (SUB-008) |
| `lib/kinder/subscription/trial-reminder-shared.ts` | Shared helpers |
| `lib/kinder/subscription/send-trial-reminder-emails.ts` | Logic gửi email |
| `lib/kinder/subscription/trial-reminder-email.ts` | Template HTML |
| `app/api/cron/trial-reminder-emails/route.ts` | Cron endpoint |

Roadmap tiếp theo: **SUB-009** (enforce storage quota).
