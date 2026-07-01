# Kinder CRM Product Development Roadmap

Version: 1.2

Status: In Progress

Product: Kinder CRM

Last audited: 2026-07-01

---

# Product Vision

Kinder CRM là nền tảng SaaS quản lý trường mầm non toàn diện (All-in-One Preschool Management Platform), giúp nhà trường quản lý tập trung toàn bộ hoạt động từ tuyển sinh, quản lý học sinh, học phí, điểm danh, giáo viên, phụ huynh đến báo cáo trên một hệ thống duy nhất.

---

# Implementation Status Legend

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ | Hoàn thành — DB + API + UI (MVP shippable) |
| 🟡 | Một phần — backend hoặc UI chưa đủ |
| ❌ | Chưa phát triển |

**Ghi chú:** ✅ theo tiêu chí kỹ thuật (có route `/app` hoặc `/parent`, migration, server actions). Chưa bao gồm Unit Test / QA / UAT đầy đủ theo Definition of Done bên dưới.

---

# Progress Summary

| Nhóm | Tiến độ ước lượng | Ghi chú |
|------|-------------------|---------|
| Phase 1 MVP (EPIC 001–006) | ~80% | Lõi dùng được; thiếu import/export, QR, admin tenant |
| **Platform Super Admin (EPIC-035)** | **~90%** | Sprint B done; optional: impersonate |
| Phase 2 (EPIC 007–011) | ~65% | Attendance/staff/parent khá đủ; dashboard & notification yếu |
| Phase 3–4 (CMS, Marketing, Reports, AI) | ~25% | Chỉ có AI + marketing site tĩnh |
| Module mở rộng (Nhật ký, Thực đơn, Kho, Sức khỏe) | ~90% | MVP + phase 2–3 |
| Future Roadmap (Calendar, Transport, Chat…) | 0% | Chưa bắt đầu |

**Routes workspace hiện có:** `/app`, `/app/crm`, `/app/students`, `/app/classes`, `/app/finance`, `/app/attendance`, `/app/staff`, `/app/daily-reports`, `/app/menu`, `/app/inventory`, `/app/health`, `/app/ai`, `/parent`.

**Routes platform (dự kiến):** `/platform`, `/platform/schools`, `/platform/packages`, `/platform/admins`, `/platform/audit-logs` — chưa triển khai.

---

# Development Strategy

Phát triển theo mô hình:

Epic → Feature → User Story → Task

Mỗi Feature phải có khả năng triển khai độc lập và release theo Sprint.

---

# Phase 1 - MVP

Mục tiêu:

Cho phép trường mầm non sử dụng hệ thống để:

- Quản lý tuyển sinh
- Quản lý học sinh
- Quản lý học phí
- Quản lý nhiều trường (Multi Tenant)

---

# EPIC-001 Tenant Management

Status: **In Progress (~85%)**

Priority: P0

Description: Quản lý trường học trên hệ thống SaaS.

Route: `/app/onboarding`, `/app/settings/school`, `/app/settings/campuses`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| TENANT-001 | Create School | ✅ | Onboarding |
| TENANT-002 | Update School | ✅ | Settings school |
| TENANT-003 | Suspend School | 🟡 | `suspendSchoolAction` có; UI sẽ nằm ở **EPIC-035** Platform |
| TENANT-004 | Delete School | 🟡 | `archiveSchoolAction` có; UI sẽ nằm ở **EPIC-035** Platform |
| TENANT-005 | School Information | ✅ | |
| TENANT-006 | Logo | 🟡 | Nhập URL; chưa upload file |
| TENANT-007 | Theme | 🟡 | Lưu `theme_primary_color`; chưa áp dụng UI |
| TENANT-008 | Campus | ✅ | `/app/settings/campuses` |
| TENANT-009 | Branch | 🟡 | `campus_type: branch`; chưa tách UX riêng |
| TENANT-010 | Domain | 🟡 | Lưu `custom_domain`; chưa routing/DNS |

---

# EPIC-002 Subscription & Package

Status: **In Progress (~75%)**

Priority: P0

Description: Quản lý các gói dịch vụ và Feature Toggle.

Route: `/app/settings/subscription`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| PACKAGE-001 | Package Management | 🟡 | Seed DB + xem gói; chưa admin CRUD |
| PACKAGE-002 | Feature Toggle | ✅ | `features.ts` + gating trang |
| PACKAGE-003 | Subscription | ✅ | Đổi gói |
| PACKAGE-004 | Trial | ✅ | `trial_ends_at` |
| PACKAGE-005 | Billing (SaaS) | ❌ | Chưa Stripe thuê phần mềm |
| PACKAGE-006 | Student Limit | ✅ | `assertStudentQuota` |
| PACKAGE-007 | Storage Limit | ❌ | Có `max_storage_mb`; chưa enforce upload |
| PACKAGE-008 | Campus Limit | ✅ | `assertCampusQuota` |
| PACKAGE-009 | AI Credit | ✅ | Giới hạn + hiển thị |
| PACKAGE-010 | Package History | ✅ | `school_subscription_history` |

**Feature flags hiện có:** `crm`, `students`, `classes`, `finance`, `finance_basic`, `attendance`, `staff`, `parent_portal`, `daily_reports`, `meal_menu`, `inventory`, `health_management`, `reports`, `ai_assistant`

**Chưa làm:** ~~Lọc sidebar theo gói~~ ✅ Đã lọc qua `getKinderNavigationConfig`.

---

# EPIC-003 CRM Enrollment

Status: **In Progress (~80%)**

Priority: P0

Description: Quản lý toàn bộ quy trình tuyển sinh.

Route: `/app/crm`, `/app/crm/leads/[leadId]`

Business Flow: Lead → Contact → Appointment → Visit → Deposit → Enrollment → Student

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| CRM-001 | Create Lead | ✅ | |
| CRM-002 | Update Lead | ✅ | |
| CRM-003 | Delete Lead | ✅ | |
| CRM-004 | Lead Detail | ✅ | |
| CRM-005 | Assign Lead | ✅ | |
| CRM-006 | Lead Pipeline | ✅ | Kanban + bảng |
| CRM-007 | Lead Source | ✅ | |
| CRM-008 | Contact History | 🟡 | Activity log; chưa form liên hệ riêng |
| CRM-009 | Appointment | 🟡 | Stage `appointment`; chưa lịch hẹn |
| CRM-010 | School Visit | 🟡 | Stage `visited`; chưa form visit |
| CRM-011 | Follow Up | 🟡 | Notes/activity; chưa nhắc việc |
| CRM-012 | Deposit | 🟡 | Stage `deposit`; chưa gắn tài chính |
| CRM-013 | Enrollment | 🟡 | Stage `enrolled` |
| CRM-014 | Convert Student | ✅ | `convertLeadToStudentAction` |
| CRM-015 | Import Excel | ✅ | CSV import |
| CRM-016 | Export Excel | ✅ | CSV export |
| CRM-017 | Dashboard | 🟡 | KPI trên `/app`, chưa trang CRM riêng |
| CRM-018 | Activity Timeline | ✅ | |
| CRM-019 | Notes | ✅ | |
| CRM-020 | Tags | ❌ | |

---

# EPIC-004 Student Management

Status: **In Progress (~80%)**

Priority: P0

Description: Quản lý hồ sơ học sinh.

Route: `/app/students`, `/app/students/[studentId]`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| STUDENT-001 | Student List | ✅ | |
| STUDENT-002 | Student Profile | ✅ | |
| STUDENT-003 | Parent Information | ✅ | |
| STUDENT-004 | Emergency Contact | ✅ | |
| STUDENT-005 | Medical Record | ✅ | |
| STUDENT-006 | Allergy | ✅ | |
| STUDENT-007 | Pickup Person | ✅ | |
| STUDENT-008 | Transfer Class | ✅ | Dialog trên chi tiết lớp |
| STUDENT-009 | Graduation | 🟡 | Status `graduated` + timeline; chưa wizard |
| STUDENT-010 | Student Status | ✅ | |
| STUDENT-011 | Student Timeline | ✅ | |
| STUDENT-012 | Student Documents | ❌ | |
| STUDENT-013 | Student Photo | 🟡 | URL text; chưa upload |
| STUDENT-014 | Import Student | ✅ | CSV import |
| STUDENT-015 | Export Student | ✅ | CSV export |

---

# EPIC-005 Class Management

Status: **In Progress (~90%)**

Priority: P0

Route: `/app/classes`, `/app/classes/[classId]`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| CLASS-001 | School Year | ✅ | Tab Setup |
| CLASS-002 | Semester | ✅ | |
| CLASS-003 | Classroom | ✅ | |
| CLASS-004 | Create Class | ✅ | |
| CLASS-005 | Assign Teacher | ✅ | |
| CLASS-006 | Student Assignment | ✅ | Enroll |
| CLASS-007 | Capacity | ✅ | |
| CLASS-008 | Timetable | ✅ | `class_schedules` |
| CLASS-009 | Class Transfer | ✅ | UI chuyển lớp trên roster |
| CLASS-010 | Archive | ✅ | |

---

# EPIC-006 Finance

Status: **In Progress (~85%)**

Priority: P0

Description: Quản lý học phí và công nợ.

Route: `/app/finance`, `/app/finance/invoices/[invoiceId]`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| FIN-001 | Tuition | ✅ | |
| FIN-002 | Invoice | ✅ | |
| FIN-003 | Payment | ✅ | |
| FIN-004 | Debt | ✅ | Tab Debts |
| FIN-005 | Discount | ✅ | Invoice adjustments |
| FIN-006 | Scholarship | ✅ | |
| FIN-007 | Refund | ✅ | |
| FIN-008 | Receipt | ✅ | `receipt_number` |
| FIN-009 | Payment History | ✅ | Invoice detail |
| FIN-010 | QR Payment | 🟡 | VietQR trên invoice (cần env) |
| FIN-011 | Monthly Report | 🟡 | Summary trong Overview; chưa báo cáo riêng |
| FIN-012 | Revenue Dashboard | 🟡 | 4 KPI trong Finance; chưa dashboard tổng |

---

# Phase 2

---

# EPIC-007 Attendance

Status: **In Progress (~85%)**

Priority: P1

Route: `/app/attendance`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| ATT-001 | Check In | ✅ | |
| ATT-002 | Check Out | ✅ | |
| ATT-003 | QR Attendance | ❌ | |
| ATT-004 | Manual Attendance | ✅ | |
| ATT-005 | Leave Request | ✅ | |
| ATT-006 | Late | ✅ | Status `late` |
| ATT-007 | Attendance History | ✅ | |
| ATT-008 | Monthly Report | ✅ | Xem; chưa export |
| ATT-009 | Export Excel | ❌ | |

---

# EPIC-008 Teacher Management

Status: **In Progress (~70%)**

Priority: P1

Route: `/app/staff`, `/app/staff/[staffId]`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| TEACHER-001 | Teacher Profile | ✅ | Staff employee |
| TEACHER-002 | Department | ✅ | |
| TEACHER-003 | Position | ✅ | |
| TEACHER-004 | Contract | ✅ | |
| TEACHER-005 | Schedule | ❌ | Chỉ timetable lớp |
| TEACHER-006 | Classroom Assignment | ✅ | |
| TEACHER-007 | Attendance | ❌ | |
| TEACHER-008 | Performance | ❌ | |

---

# EPIC-009 Parent Portal

Status: **In Progress (~80%)**

Priority: P1

Route: `/parent`, `/parent/children/[studentId]`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| PARENT-001 | Parent Account | ✅ | Link tài khoản |
| PARENT-002 | Student Information | ✅ | |
| PARENT-003 | Daily Report | ✅ | Media + acknowledge |
| PARENT-004 | Attendance | ✅ | |
| PARENT-005 | Tuition | ✅ | |
| PARENT-006 | Notification | ✅ | Bell phụ huynh |
| PARENT-007 | Chat | ❌ | |
| PARENT-008 | Gallery | ❌ | Media chỉ trong nhật ký |

---

# EPIC-010 Notification

Status: **In Progress (~25%)**

Priority: P1

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| NOTI-001 | Email | ❌ | |
| NOTI-002 | Push Notification | ❌ | |
| NOTI-003 | SMS | ❌ | |
| NOTI-004 | In-App Notification | ✅ | Staff bell + phụ huynh |
| NOTI-005 | Broadcast | ❌ | |
| NOTI-006 | Scheduled Notification | ❌ | |

**Đã có:** `user_notifications` — publish nhật ký, sự cố y tế.

---

# EPIC-011 Dashboard

Status: **In Progress (~60%)**

Priority: P1

Route: `/app` (dashboard tổng)

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| DASH-001 | Enrollment Dashboard | 🟡 | Pipeline leads trên `/app` |
| DASH-002 | Student Dashboard | 🟡 | KPI học sinh trên `/app` |
| DASH-003 | Revenue Dashboard | 🟡 | KPI doanh thu trên `/app` |
| DASH-004 | Attendance Dashboard | 🟡 | Điểm danh hôm nay trên `/app` |
| DASH-005 | Debt Dashboard | 🟡 | Công nợ trên `/app` |
| DASH-006 | Teacher Dashboard | ❌ | |

**Hiện tại:** Quota banner + gói dịch vụ + AI credits.

---

# Phase 3

---

# EPIC-012 CMS

Status: **Not Started**

Priority: P2

Ghi chú: Trang marketing tĩnh Next.js (`/(marketing)`) — chưa CMS quản trị.

## Features

| ID | Feature | Status |
|----|---------|--------|
| CMS-001 | Website | ❌ |
| CMS-002 | Landing Page | 🟡 | Static marketing only |
| CMS-003 | Blog | ❌ |
| CMS-004 | Gallery | ❌ |
| CMS-005 | News | ❌ |
| CMS-006 | Menu | ❌ |
| CMS-007 | SEO | 🟡 | `robots.ts`, `sitemap.xml` cơ bản |
| CMS-008 | Contact Form | ❌ |
| CMS-009 | Banner | ❌ |
| CMS-010 | Popup | ❌ |

---

# EPIC-013 Marketing

Status: **Not Started**

Priority: P2

## Features

| ID | Feature | Status |
|----|---------|--------|
| MKT-001 | Campaign | ❌ |
| MKT-002 | Email Marketing | ❌ |
| MKT-003 | SMS Marketing | ❌ |
| MKT-004 | Facebook Lead | ❌ |
| MKT-005 | Landing Page Analytics | ❌ |
| MKT-006 | Conversion Report | ❌ |

---

# EPIC-014 Reports

Status: **Not Started**

Priority: P2

Ghi chú: Feature flag `reports` có; chưa có route `/app/reports`.

## Features

| ID | Feature | Status |
|----|---------|--------|
| REPORT-001 | Student Report | ❌ |
| REPORT-002 | Finance Report | ❌ |
| REPORT-003 | Enrollment Report | ❌ |
| REPORT-004 | Attendance Report | ❌ |
| REPORT-005 | Teacher Report | ❌ |
| REPORT-006 | Custom Report | ❌ |

---

# Phase 4

---

# EPIC-015 AI Assistant

Status: **In Progress (~75%)**

Priority: P3

Route: `/app/ai`

Migration: `20260718000000_kinder_ai_assistant.sql`

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| AI-001 | AI Chat | ✅ | |
| AI-002 | AI Report | 🟡 | Insights panel; chưa PDF |
| AI-003 | AI Daily Comment | ✅ | Nút trong nhật ký |
| AI-004 | AI Enrollment Prediction | ✅ | |
| AI-005 | AI Revenue Forecast | ✅ | |
| AI-006 | AI Notification | 🟡 | Draft only; chưa gửi thật |
| AI-007 | AI Knowledge Base | ✅ | |

---

# Extended Modules (ngoài Plan gốc)

Các module triển khai sau MVP, gắn gói Pro.

---

# EPIC-016 Daily Reports (Nhật ký)

Status: **Done (~95%)**

Priority: P1

Route: `/app/daily-reports`

Migration: `20260710000000` – `20260715000000`

## Features

| Feature | Status | Ghi chú |
|---------|--------|---------|
| Nhật ký theo lớp / học sinh | ✅ | |
| Bữa ăn, ngủ, sức khỏe, hoạt động | ✅ | |
| Timeline + media (ảnh/video) | ✅ | |
| Publish + thông báo phụ huynh | ✅ | |
| Gợi ý AI (Pro+) | ✅ | |
| Export báo cáo | ❌ | |
| Thông báo staff | ❌ | |

---

# EPIC-017 Meal Menu (Thực đơn)

Status: **Done (~90%)**

Priority: P1

Route: `/app/menu`, `/app/menu/[menuId]`

Migration: `20260711000000`, `20260716000000`

## Features

| Feature | Status | Ghi chú |
|---------|--------|---------|
| Thực đơn tuần | ✅ | |
| Món ăn + nguyên liệu | ✅ | |
| Template thực đơn | ✅ | |
| Báo cáo dinh dưỡng | ✅ | |
| Liên kết nguyên liệu ↔ kho (UI) | 🟡 | |

---

# EPIC-018 Inventory (Kho)

Status: **Done (~90%)**

Priority: P1

Route: `/app/inventory`

Migration: `20260712000000` – `20260717000000`

## Features

| Feature | Status | Ghi chú |
|---------|--------|---------|
| Sản phẩm, danh mục, tồn kho | ✅ | |
| Nhà cung cấp, phiếu nhập (PO) | ✅ | |
| Kiểm kê, chuyển kho | ✅ | |
| Cảnh báo hết hạn | ✅ | |
| Cảnh báo tồn thấp → notification | ❌ | |
| Export báo cáo | ❌ | |

---

# EPIC-019 Health Management (Sức khỏe)

Status: **Done (~85%)**

Priority: P1

Route: `/app/health`, tab Sức khỏe cổng phụ huynh

Migration: `20260719000000_kinder_health_management.sql`

## Features

| ID | Feature | Status |
|----|---------|--------|
| HEALTH-001 | Health Profile | ✅ |
| HEALTH-002 | Vaccination | ✅ |
| HEALTH-003 | Height Tracking | ✅ |
| HEALTH-004 | Weight Tracking | ✅ |
| HEALTH-005 | BMI Calculation | ✅ |
| HEALTH-006 | Medical Checkup | ✅ |
| HEALTH-007 | Medication | ✅ |
| HEALTH-008 | Allergy | ✅ | Trên trang học sinh |
| HEALTH-009 | Incident Report | ✅ | + notify parent |
| HEALTH-010 | Medical History | ✅ | Tổng hợp profiles |
| HEALTH-011 | Health Dashboard | ✅ |
| Export báo cáo | ❌ | |

---

# Future Modules Roadmap

Status: Planning — chưa bắt đầu triển khai.

| EPIC | Tên | Priority | Mô tả ngắn |
|------|-----|----------|------------|
| EPIC-020 | Transportation | P2 | Tuyến xe, GPS, check-in bus |
| EPIC-021 | Event Management | P2 | Sự kiện, đăng ký, gallery |
| EPIC-022 | Academic Calendar | P1 | Lịch học, holiday, sinh nhật |
| EPIC-023 | Communication Center | P1 | Chat, broadcast, SMS, email |
| EPIC-024 | Document Management | P2 | Folder, version, permission |
| EPIC-025 | Form Builder | P2 | Biểu mẫu động, chữ ký số |
| EPIC-026 | Workflow Approval | P2 | Quy trình phê duyệt, SLA |
| EPIC-027 | Purchasing | P2 | Yêu cầu mua sắm (khác PO kho) |
| EPIC-028 | Asset Management | P2 | Tài sản, khấu hao |
| EPIC-029 | Maintenance | P2 | Bảo trì thiết bị |
| EPIC-030 | Survey Management | P3 | Khảo sát PH/NV |
| EPIC-031 | Knowledge Base | P3 | KB nội bộ (riêng AI KB) |
| EPIC-032 | Support Center | P3 | Ticket hỗ trợ |
| EPIC-033 | Reports & BI | P2 | Dashboard BI, export PDF/Excel |
| EPIC-034 | AI Assistant (mở rộng) | P3 | Trùng một phần EPIC-015 |
| EPIC-035 | Platform Super Admin | P0 | Console SaaS — schools, packages, audit |

---

# EPIC-035 Platform Super Admin

Status: **In Progress (~90%) — Sprint A + B**

Priority: **P0** — nền tảng SaaS, chặn trước khi scale multi-tenant production

Description: Console quản trị **cấp nền tảng** (khác `school_members.role = admin` — admin **trong một trường**). Super Admin quản lý toàn bộ tenant (schools), gói đăng ký, subscription, audit và vận hành hệ thống.

Route: `/platform` (layout riêng, không dùng sidebar workspace trường)

## Phân biệt vai trò

| Khái niệm | Phạm vi | Hiện trạng |
|-----------|---------|------------|
| **Super Admin** (platform) | Toàn hệ thống — mọi trường | ❌ Chưa có |
| **School Owner** (`owner`) | Một trường — tạo lúc onboarding | ✅ |
| **School Admin** (`admin` trong `school_members`) | Một trường — quản trị nội bộ | ✅ |
| **Staff access admin** (`staff_access_role: admin`) | Login nhân viên → sync `school_members` | ✅ |

## Business Goal

- Vận hành SaaS: suspend/khôi phục trường, xem usage, can thiệp subscription
- Quản lý catalog gói (`packages`) mà không cần seed SQL thủ công
- Audit mọi thao tác nhạy cảm cấp platform
- Tách biệt hoàn toàn RLS tenant vs quyền cross-tenant

## User Stories (tóm tắt)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| PA-001 | Là Super Admin, tôi đăng nhập và vào `/platform` | Chỉ user trong `platform_admins` truy cập được; user thường → 403/redirect |
| PA-002 | Là Super Admin, tôi xem danh sách tất cả trường | Bảng: tên, slug, status, gói, số HS/cơ sở, ngày tạo; search + filter status |
| PA-003 | Là Super Admin, tôi suspend/archive trường | Gọi logic TENANT-003/004; ghi audit log; member trường bị chặn workspace |
| PA-004 | Là Super Admin, tôi CRUD gói `packages` | PACKAGE-001 admin; không ảnh hưởng school tự đổi gói trong app |
| PA-005 | Là Super Admin, tôi gán subscription thủ công | Override trial/gói cho trường cụ thể (support) |
| PA-006 | Là Super Admin, tôi quản lý admin platform khác | Thêm/thu hồi `platform_admins`; không tự xóa chính mình |
| PA-007 | Là Super Admin, tôi xem audit log | Mọi action platform có bản ghi actor + target + metadata |

## Features

| ID | Feature | Status | Ghi chú |
|----|---------|--------|---------|
| PLATFORM-001 | Platform admin identity | ✅ | Migration `20260720000000` |
| PLATFORM-002 | Auth guard `/platform` | ✅ | Middleware + `requirePlatformAdminPage` |
| PLATFORM-003 | Platform dashboard | ✅ | KPI schools |
| PLATFORM-004 | School list & detail | ✅ | `/platform/schools` |
| PLATFORM-005 | Suspend / restore school | ✅ | + audit log |
| PLATFORM-006 | Archive school | ✅ | super_admin only |
| PLATFORM-007 | Package CRUD | ✅ | `/platform/packages` |
| PLATFORM-008 | Manual subscription override | ✅ | School detail panel |
| PLATFORM-009 | Platform admin management | ✅ | `/platform/admins` |
| PLATFORM-010 | Platform audit log | ✅ | `/platform/audit-logs` |
| PLATFORM-011 | Impersonate school owner | ❌ | P2 — optional; session có flag audit |
| PLATFORM-012 | Platform UI shell | ❌ | Layout riêng, design system Kinder |

## Database Design

Migration đề xuất: `20260720000000_kinder_platform_admin.sql`

```sql
-- Enums
create type public.platform_admin_role as enum (
  'super_admin',  -- full platform
  'support',      -- schools read + suspend; no package delete
  'billing'       -- packages + subscriptions only
);

-- Platform administrators (NOT school_members)
create table public.platform_admins (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.platform_admin_role not null default 'super_admin',
  is_active boolean not null default true,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  constraint platform_admins_user_unique unique (user_id)
);

create index idx_platform_admins_user_active
  on public.platform_admins (user_id)
  where is_active = true and revoked_at is null;

-- Audit trail (platform-level only)
create table public.platform_audit_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  action varchar(100) not null,
  target_type varchar(50) not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_platform_audit_logs_created
  on public.platform_audit_logs (created_at desc);

create index idx_platform_audit_logs_target
  on public.platform_audit_logs (target_type, target_id);

-- Helpers (security definer)
create or replace function public.is_platform_admin(
  allowed_roles public.platform_admin_role[] default array['super_admin']::public.platform_admin_role[]
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.is_active = true
      and pa.revoked_at is null
      and pa.role = any (allowed_roles)
  );
$$;

grant execute on function public.is_platform_admin(public.platform_admin_role[])
  to authenticated, service_role;

-- RLS: platform_admins
alter table public.platform_admins enable row level security;

create policy platform_admins_select on public.platform_admins
  for select to authenticated
  using (public.is_platform_admin());

create policy platform_admins_insert on public.platform_admins
  for insert to authenticated
  with check (public.is_platform_admin(array['super_admin']::public.platform_admin_role[]));

create policy platform_admins_update on public.platform_admins
  for update to authenticated
  using (public.is_platform_admin(array['super_admin']::public.platform_admin_role[]));

-- RLS: platform_audit_logs
alter table public.platform_audit_logs enable row level security;

create policy platform_audit_logs_select on public.platform_audit_logs
  for select to authenticated
  using (public.is_platform_admin());
```

**Khuyến nghị:** Cross-tenant **write** (suspend, đổi gói) đi qua `getSupabaseServerAdminClient()` + `requirePlatformAdmin()` — tránh mở RLS tenant quá rộng.

**Seed dev:** Insert `platform_admins` cho email dev sau khi user đăng ký — không hardcode trong migration production.

## API / Code Structure

```
apps/web/app/platform/
  layout.tsx              # requirePlatformAdmin + PlatformShell
  page.tsx                # Dashboard
  schools/page.tsx
  schools/[schoolId]/page.tsx
  packages/page.tsx
  admins/page.tsx
  audit-logs/page.tsx

apps/web/lib/kinder/platform/
  require-platform-admin.ts
  load-platform-schools.ts
  load-platform-dashboard.ts
  server-actions.ts
  audit.ts
```

## Permission Matrix (Platform)

| Action | super_admin | support | billing |
|--------|:-----------:|:-------:|:-------:|
| Xem dashboard platform | ✅ | ✅ | ✅ |
| List schools | ✅ | ✅ | ❌ |
| Suspend / restore school | ✅ | ✅ | ❌ |
| Archive school | ✅ | ❌ | ❌ |
| CRUD packages | ✅ | ❌ | ✅ |
| Override subscription | ✅ | ✅ | ✅ |
| Grant platform admin | ✅ | ❌ | ❌ |
| Xem audit logs | ✅ | ✅ | ✅ |

## Auth & Routing Flow

```
Đăng nhập
  ├─ Chỉ platform_admins → /platform
  ├─ Platform + school member → /app (link Platform trong menu)
  ├─ Chỉ school member → /app
  └─ School suspended → chặn /app, hiển thị trang tạm ngưng
```

## Tái sử dụng code hiện có

| Thành phần | File |
|------------|------|
| Suspend / archive | `lib/kinder/tenant/server-actions.ts` |
| Package data | `supabase/seed.sql` + CRUD mới |
| Subscription | `lib/kinder/subscription/*` |

## Sprint Breakdown

**Sprint A — Foundation:** migration, guard, layout, schools list, suspend/archive + audit

**Sprint B — Operations:** package CRUD, subscription override, admin management, audit viewer, chặn workspace khi suspended

## Liên kết EPIC

- **EPIC-001** TENANT-003/004 — UI chuyển sang platform
- **EPIC-002** PACKAGE-001 — CRUD gói qua platform
- **EPIC-032** Support Center — ticket sau

## Future Mobile Applications

| App | Status | Tính năng dự kiến |
|-----|--------|-------------------|
| Parent App | ❌ | Nhật ký, điểm danh, học phí, chat, thông báo, gallery |
| Teacher App | ❌ | Điểm danh, nhật ký, giáo án, hồ sơ HS, thông báo |
| Principal App | ❌ | Dashboard, báo cáo, tài chính, phê duyệt, KPI |

---

# Product Release Plan

## Version 1.0 — MVP (đang hoàn thiện ~80%)

- ✅ Tenant (thiếu suspend/delete UI → **EPIC-035**)
- ✅ Package (thiếu SaaS billing, storage enforce)
- ✅ CRM (thiếu import/export, dashboard, tags)
- ✅ Student (thiếu import/export, documents, transfer UI)
- ✅ Class (thiếu transfer UI)
- ✅ Finance (thiếu QR payment)

## Version 1.1 — Operations (đang hoàn thiện ~65%)

- ✅ Attendance (thiếu QR, export)
- 🟡 Teacher/Staff (thiếu schedule cá nhân, attendance, performance)
- 🟡 Parent Portal (thiếu chat, gallery)
- 🟡 Notification (chỉ in-app phụ huynh)
- ✅ Daily Reports
- ✅ Meal Menu
- ✅ Inventory
- ✅ Health Management

## Version 1.2 — Analytics (chưa bắt đầu)

- ❌ Dashboard tổng hợp
- ❌ Reports module (`/app/reports`)

## Version 2.0 — Growth (chưa bắt đầu)

- ❌ CMS
- ❌ Marketing
- 🟡 AI Assistant (~75%)

## Version 2.1+ — Future Roadmap

- Academic Calendar, Communication Center, Transportation, Events, Documents, Form Builder, Workflow, BI, Mobile Apps

---

# Recommended Next Sprint

Ưu tiên đóng gap MVP/v1.1:

1. ~~Import/Export Excel — CRM + Học sinh~~ ✅ CSV import/export
2. ~~Dashboard tổng `/app`~~ ✅ KPI enrollment, học sinh, doanh thu, điểm danh
3. ~~UI chuyển lớp học sinh~~ ✅ `transferStudentAction` + dialog
4. ~~Notification bell cho staff workspace~~ ✅ Sidebar + mobile
5. ~~QR thanh toán học phí (VietQR)~~ ✅ Invoice detail (cần env)
6. ~~Lọc navigation theo gói đăng ký~~ ✅ `getKinderNavigationConfig`

Ưu tiên P1 roadmap (tiếp theo):

7. **EPIC-035 Platform Super Admin** (P0 — nên làm trước scale production)
8. EPIC-022 Academic Calendar
9. EPIC-023 Communication Center

---

# Development Rule

Mỗi Feature phải có:

- Business Goal
- User Story
- Acceptance Criteria
- UI Design
- API Specification
- Database Design
- Permission
- Test Case

Không được phát triển Feature khi chưa hoàn thành tài liệu nghiệp vụ.

---

# Definition of Done

Một Feature chỉ được xem là hoàn thành khi:

- Business Rule hoàn chỉnh
- UI hoàn chỉnh
- API hoàn chỉnh
- Database hoàn chỉnh
- Unit Test Passed
- QA Passed
- UAT Passed
- Documentation Updated

**Lưu ý:** Các mục đánh dấu ✅ trong tài liệu này phản ánh mức **engineering-complete (MVP shippable)** trừ khi đã qua QA/UAT.

---

# Technical Notes

- Workspace Kinder: `apps/web/app/app/`, `apps/web/lib/kinder/`
- Parent portal: `apps/web/app/parent/`
- Migrations: `apps/web/supabase/migrations/202607*.sql`
- Code LMS template cũ (`/home`, `/exam`) vẫn tồn tại — **không thuộc phạm vi Kinder CRM**
