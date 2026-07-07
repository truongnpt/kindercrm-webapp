# Kinder CRM — Roadmap Gói đăng ký & Billing

Version: 1.0  
Status: Đề xuất  
Cập nhật: 2026-07-07

> Tài liệu mô tả **hiện trạng** hệ thống subscription/trial và **danh sách tính năng cần phát triển thêm**, ưu tiên theo P0 → P2.  
> Bổ sung cho [Plan.md](./Plan.md) (EPIC-002) và [PRODUCTION.md](./PRODUCTION.md).

---

## 1. Hiện trạng (as-is)

### 1.1 Luồng chính

| Bước | Hành vi hiện tại |
|------|------------------|
| Onboarding | Tạo trường → RPC `create_school_for_owner` gán gói `free` + `status = trial` (14 ngày) |
| Trial | Mở **toàn bộ** module (`hasPackageFeature` → `true` khi trial còn hạn) |
| Quota | Học sinh / cơ sở vẫn theo hạn mức gói `free` (50 HS, 1 cơ sở) |
| AI credits | Trial được boost **500 credits/tháng** (`TRIAL_AI_CREDITS_MONTHLY`) |
| Đổi gói | Owner chọn gói tại `/app/settings/subscription` → `changePackageAction` (MVP, **không thanh toán**) |
| Enterprise | Nút disabled — “Liên hệ sales” |
| Platform admin | Override subscription tại `/platform/schools/[schoolId]` |

### 1.2 Dữ liệu gói (catalog)

| Code | Giá/tháng | HS | Cơ sở | Tính năng chính |
|------|-----------|-----|-------|-----------------|
| `free` | 0đ | 50 | 1 | CRM, học sinh, finance_basic |
| `starter` | 990.000đ | 500 | 10 | Đầy đủ Phase 1 (kho, sức khỏe, lịch, AI, báo cáo…) |
| `pro` | 2.490.000đ | 999.999 | 999 | `all: true` — mọi tính năng, quota cao |

Catalog cố định 3 gói (`free`, `starter`, `pro`). Gói `enterprise` đã gộp vào Pro.

Nguồn: `apps/web/supabase/seed.sql`, migration `20260747000000_kinder_packages_seed.sql`.

### 1.3 File / module liên quan

| Thành phần | Đường dẫn |
|------------|-----------|
| RPC tạo trường + trial | `apps/web/supabase/migrations/*_kinder_create_school_rpc.sql` |
| Feature gating | `apps/web/lib/kinder/subscription/package-features.ts` |
| Quota | `apps/web/lib/kinder/subscription/quotas.ts` |
| Đổi gói (MVP) | `apps/web/lib/kinder/subscription/server-actions.ts` |
| UI gói | `apps/web/app/app/(workspace)/settings/subscription/` |
| Map module ↔ feature | `apps/web/lib/kinder/permissions/module-registry.ts` |
| Platform override | `apps/web/lib/kinder/platform/platform-ops-actions.ts` |

---

## 2. Khoảng trống (gaps)

| # | Vấn đề | Tác động |
|---|--------|----------|
| G1 | Không có cổng thanh toán (Stripe/VNPay) | Đổi gói chỉ cập nhật DB — không thu tiền thật |
| G2 | Trial hết hạn **không tự xử lý** | `status` vẫn `trial`; chỉ tính năng bị thu hẹp theo `trial_ends_at` |
| G3 | Không email / thông báo trial | User không biết sắp hết hạn |
| G4 | `past_due` / `cancelled` chưa có logic | Enum có nhưng không dùng |
| G5 | `max_storage_mb` chưa enforce | Upload file không bị giới hạn theo gói |
| G6 | Production từng thiếu `packages` seed | Trường tạo được nhưng không có subscription (đã có migration fix) |
| G7 | UX sau trial mờ | Không banner cảnh báo, không flow nâng cấp bắt buộc |
| G8 | Enterprise không có pipeline sales | Chỉ disabled button |

---

## 3. Danh sách tính năng cần phát triển

### Chú giải ưu tiên

| Mức | Ý nghĩa |
|-----|---------|
| **P0** | Bắt buộc để SaaS production-ready (thu phí, trial đúng nghĩa) |
| **P1** | Cải thiện trải nghiệm & vận hành |
| **P2** | Mở rộng, tối ưu, báo cáo |

---

### P0 — Billing & vòng đời subscription

#### SUB-001 · Tích hợp thanh toán SaaS (Stripe)

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — [docs/stripe-integration.md](./stripe-integration.md) |
| **Mô tả** | Thu phí gói Starter/Pro qua Stripe Checkout + webhook đồng bộ `school_subscriptions`. |
| **Phạm vi** | Checkout session, `stripe_customer_id` / `stripe_subscription_id` trên school hoặc bảng billing riêng, webhook `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. |
| **Thay thế** | `changePackageAction` chỉ đổi gói sau khi thanh toán thành công (hoặc tách `previewChange` / `confirmChange`). |
| **Tham chiếu** | Biến môi trường trong [PRODUCTION.md](./PRODUCTION.md) §3.1 Stripe |
| **Tiêu chí hoàn thành** | Owner chọn Starter/Pro → redirect Stripe → webhook cập nhật `active`, ghi history; hủy gói trên Stripe → `cancelled` hoặc downgrade `free`. |

#### SUB-002 · Liên kết Price ID ↔ Package

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — `price_monthly` / `price_yearly` trên DB; checkout `price_data` (override Price ID tuỳ chọn) |
| **Mô tả** | Cột `stripe_price_id` (hoặc bảng `package_prices`) trên `packages` để map `starter`/`pro` với Stripe Price. |
| **Tiêu chí hoàn thành** | Platform admin cấu hình price ID; checkout dùng đúng price theo `package.code`. |

#### SUB-003 · Job xử lý hết hạn trial

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — RPC `expire_expired_trial_subscriptions` + Vercel Cron |
| **Mô tả** | Cron (Supabase Edge Function / pg_cron / Vercel Cron) chạy hàng ngày: trường `status = trial` và `trial_ends_at < now()` → chuyển `active` (gói free) hoặc `past_due` / nhắc nâng cấp. |
| **Tiêu chí hoàn thành** | Sau 14 ngày, `isActiveTrialSubscription()` = false **và** `status` DB phản ánh đúng trạng thái kinh doanh; ghi `school_subscription_history`. |

#### SUB-004 · Đảm bảo seed packages trên mọi môi trường

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành (migration `20260747000000` + checklist [PRODUCTION.md](./PRODUCTION.md)) |
| **Mô tả** | Migration idempotent seed `packages` (đã có `20260747000000`); thêm checklist deploy trong PRODUCTION. |
| **Tiêu chí hoàn thành** | `db push` production luôn có 4 gói; onboarding không bao giờ tạo trường không subscription. |

#### SUB-005 · Backfill & sửa trường thiếu subscription

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành |
| **Mô tả** | Migration backfill + công cụ platform **Repair subscription** tại `/platform/schools/[id]`. |
| **Tiêu chí hoàn thành** | Admin platform thấy school không có `school_subscriptions` và có nút tạo trial free 14 ngày. |

---

### P0 — Trial UX & thông báo

#### SUB-006 · Banner trial trên dashboard

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — `TrialBanner` trên workspace layout (`/app/*`) |
| **Mô tả** | Banner trên `/app` khi `isActiveTrialSubscription`: số ngày còn lại + CTA “Nâng cấp gói”. |
| **Tiêu chí hoàn thành** | Hiển thị khi còn ≤ 14 ngày; ẩn khi đã `active` trả phí. |

#### SUB-007 · Email nhắc trial (Supabase / SMTP)

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — [docs/trial-email-reminders.md](./trial-email-reminders.md) |
| **Mô tả** | Email T-7, T-3, T-1 ngày trước `trial_ends_at`; email ngày hết hạn + hướng dẫn nâng cấp. |
| **Phạm vi** | Edge function + queue hoặc cron gửi qua SMTP đã cấu hình Supabase. |
| **Tiêu chí hoàn thành** | Owner nhận email; link dẫn tới `/app/settings/subscription`. |

#### SUB-008 · In-app notification trial

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — cron cùng SUB-007, category `subscription` |
| **Mô tả** | Tạo notification trong bảng `notifications` khi sắp hết trial (tận dụng module notification có sẵn). |
| **Tiêu chí hoàn thành** | Bell icon hiển thị; click mở trang subscription. |

---

### P1 — Enforce hạn mức & trạng thái

#### SUB-009 · Enforce storage quota (`PACKAGE-007`)

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — RPC `get_school_storage_usage_bytes` + assert trước upload |
| **Mô tả** | Trước khi upload (ảnh HS, media báo cáo ngày, logo): tính tổng dung lượng school vs `max_storage_mb`. |
| **Tiêu chí hoàn thành** | Vượt quota → lỗi rõ ràng + CTA nâng cấp; dashboard subscription tab “Sử dụng” hiển thị % storage. |

#### SUB-010 · Logic `past_due` & `cancelled`

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — webhook `invoice.payment_failed`, grace period, banner, feature gating Free |
| **Mô tả** | Webhook Stripe `invoice.payment_failed` → `past_due`; grace period X ngày → read-only hoặc banner; `cancelled` → giới hạn tính năng theo `free`. |
| **Tiêu chí hoàn thành** | Trạng thái hiển thị trên UI subscription + platform; không mâu thuẫn với feature gating. |

#### SUB-011 · Chặn thao tác khi vượt quota (polish)

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — banner form, toast i18n, gợi ý gói nâng cấp |
| **Mô tả** | Đã có `assertStudentQuota` / `assertCampusQuota`; bổ sung message i18n, link nâng cấp, hiển thị trên form tạo HS/cơ sở. |
| **Tiêu chí hoàn thành** | Toast/modal giải thích hạn mức gói hiện tại và gói đề xuất. |

#### SUB-012 · Trial quota nâng cao (tuỳ chọn product)

| | |
|---|---|
| **Mô tả** | Quyết định product: trial có nâng hạn mức tạm (vd. Pro limits) hay giữ free limits. Hiện tại: **chỉ mở feature, không nâng quota**. |
| **Tiêu chí hoàn thành** | Document + code thống nhất; nếu đổi → cập nhật `getPackageLimits()` khi trial. |

#### SUB-013 · Stripe Customer Portal

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — portal action, owner-only, deep-link cập nhật thẻ khi `past_due` |
| **Mô tả** | Nút “Quản lý thanh toán” mở Stripe Customer Portal (đổi thẻ, hóa đơn, hủy). |
| **Tiêu chí hoàn thành** | Chỉ owner; cần `stripe_customer_id`. |

---

### P1 — Onboarding & Enterprise

#### SUB-014 · Chọn gói khi onboarding (tuỳ chọn)

| | |
|---|---|
| **Mô tả** | Sau tạo trường: bước 2 chọn Starter/Pro (trial vẫn 14 ngày full feature) hoặc bỏ qua (giữ free). |
| **Tiêu chí hoàn thành** | Không bắt buộc thanh toán ngay; có thể “Bắt đầu dùng thử” mặc định. |

#### SUB-015 · Enterprise — form liên hệ sales

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — form modal, lưu DB, email ops, platform admin list |
| **Mô tả** | Thay nút disabled bằng modal/form (tên, SĐT, số cơ sở) → gửi email ops hoặc tạo lead CRM nội bộ platform. |
| **Tiêu chí hoàn thành** | Submission lưu DB hoặc gửi email; platform admin xem danh sách inquiry. |

#### SUB-016 · Platform: gán Enterprise thủ công

| | |
|---|---|
| **Mô tả** | Polish panel override: chọn enterprise, custom `trial_ends_at`, ghi chú hợp đồng. |
| **Tiêu chí hoàn thành** | Đã có cơ bản; bổ sung validation + audit log đầy đủ. |

---

### P1 — UI & i18n subscription

#### SUB-017 · Hiển thị đầy đủ tính năng từng gói

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — card gói + bảng so sánh đồng bộ `PACKAGE_FEATURE_KEYS` |
| **Mô tả** | `SubscriptionPlans` hiện chỉ liệt kê vài feature; đồng bộ với `PACKAGE_FEATURE_KEYS` và marketing pricing. |
| **Tiêu chí hoàn thành** | Bảng so sánh gói giống landing page `/pricing`. |

#### SUB-018 · Trạng thái subscription nhất quán trên UI

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — `getSubscriptionDisplayStatus()`, badge dashboard + settings |
| **Mô tả** | Khi trial hết hạn nhưng `status` vẫn `trial`: badge hiển thị “Hết hạn dùng thử” thay vì “Dùng thử”. |
| **Tiêu chí hoàn thành** | Hàm `getSubscriptionDisplayStatus(subscription)` dùng chung dashboard + settings. |

#### SUB-019 · Lịch sử gói chi tiết

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — status, người thực hiện, link hóa đơn Stripe |
| **Mô tả** | History panel hiển thị `status`, `changed_by`, invoice link (khi có Stripe). |
| **Tiêu chí hoàn thành** | Mỗi dòng history đủ context cho support. |

---

### P2 — Thanh toán VN & báo cáo

#### SUB-020 · VNPay / chuyển khoản cho SaaS billing

| | |
|---|---|
| **Mô tả** | Thay hoặc bổ sung Stripe cho thị trường VN; webhook xác nhận thanh toán thủ công + auto. |
| **Tiêu chí hoàn thành** | Owner thanh toán VNĐ qua QR; subscription `active` sau xác nhận. |

#### SUB-021 · Hóa đơn VAT SaaS

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — bảng `saas_billing_invoices`, PDF/email sau Stripe payment |
| **Mô tả** | Xuất hóa đơn điện tử cho phí phần mềm (tách với module finance học phí trường). |
| **Tiêu chí hoàn thành** | PDF/email hóa đơn sau mỗi kỳ thanh toán. |

#### SUB-022 · Platform analytics — MRR, churn, trial conversion

| | |
|---|---|
| **Trạng thái** | ✅ Hoàn thành — dashboard `/platform`, biểu đồ 12 tháng, export CSV |
| **Mô tả** | Dashboard `/platform`: số trường trial/active, conversion trial→paid, MRR ước tính. |
| **Tiêu chí hoàn thành** | Biểu đồ theo tháng; export CSV. |

#### SUB-023 · Coupon / mã giảm giá

| | |
|---|---|
| **Mô tả** | Stripe Promotion Codes hoặc bảng `coupons` nội bộ; áp dụng khi checkout. |
| **Trạng thái** | ✅ Hoàn thành — bảng `subscription_coupons`, platform `/platform/coupons`, áp dụng checkout Stripe |
| **Tiêu chí hoàn thành** | Giảm % hoặc số tháng miễn phí. |

#### SUB-024 · Annual billing (thanh toán năm)

| | |
|---|---|
| **Mô tả** | Gói năm giảm giá; `current_period_end` +12 tháng. |
| **Trạng thái** | ✅ Hoàn thành — toggle monthly/yearly, `stripe_price_yearly_id`, checkout Stripe |
| **Tiêu chí hoàn thành** | UI chọn monthly/yearly; price ID tương ứng. |

---

## 4. Thứ tự triển khai đề xuất

```text
Sprint 1 (P0 core)
  SUB-004 → SUB-005 → SUB-001 → SUB-002 → SUB-003

Sprint 2 (P0 UX)
  SUB-006 → SUB-007 → SUB-008 → SUB-018

Sprint 3 (P1 enforce)
  SUB-009 → SUB-010 → SUB-011 → SUB-013

Sprint 4 (P1 growth)
  SUB-015 → SUB-017 → SUB-014 → SUB-016

Sprint 5+ (P2)
  SUB-020 → SUB-022 → SUB-021 → SUB-023 → SUB-024
```

---

## 5. Quyết định product cần chốt

| # | Câu hỏi | Gợi ý |
|---|---------|-------|
| Q1 | Sau trial, trường ở gói `free` vĩnh viễn hay bắt buộc trả phí? | Free thu hẹp tính năng (hiện tại) — giữ để có funnel nâng cấp |
| Q2 | Trial có nâng quota HS/cơ sở không? | Giữ quota `free`; chỉ mở feature |
| Q3 | Stripe hay VNPay làm cổng chính? | Stripe trước (đã có hướng dẫn PRODUCTION); VNPay P2 |
| Q4 | Hết trial có khóa app hay chỉ ẩn module? | Chỉ ẩn module (hiện tại); cân nhắc read-only sau `past_due` |
| Q5 | Ai được đổi gói? | Chỉ `owner` (hiện tại) — có thêm role `billing_admin`? |

---

## 6. Liên kết backlog hiện có

| ID Plan.md | Tài liệu này |
|------------|--------------|
| PACKAGE-001 | SUB-017, SUB-019 (polish) |
| PACKAGE-005 | SUB-001, SUB-002, SUB-013 |
| PACKAGE-007 | SUB-009 |

Cập nhật [Plan.md](./Plan.md) khi bắt đầu từng hạng mục SUB-xxx.

---

## 7. Ghi chú kỹ thuật

### Trial — logic hiện tại (không đổi cho đến khi implement SUB-003)

```ts
// isActiveTrialSubscription: status === 'trial' AND trial_ends_at > now()
// hasPackageFeature: trial active → true cho MỌI feature
// getPackageLimits: trial → aiCredits = 500; maxStudents/maxCampuses vẫn theo pkg
```

### Điểm cần cẩn thận khi thêm Stripe

- Webhook phải **idempotent** (xử lý trùng event).
- Không gọi `changePackageAction` trực tiếp từ client sau checkout — chỉ webhook / server verify session.
- `school_id` metadata trên Checkout Session để map đúng trường.

### Migration production đã có

- `20260747000000_kinder_packages_seed.sql` — seed packages + backfill subscription + RPC fail nếu thiếu gói `free`.

---

*Tài liệu được tạo từ phân tích codebase subscription/trial (tháng 7/2026).*
