# Kinder CRM — Backlog còn lại

Version: 1.5

Status: In Progress

Last audited: 2026-07-03

> Tài liệu này **chỉ liệt kê việc còn lại** (🟡 một phần · ❌ chưa làm). Các tính năng đã hoàn thành (✅) đã được loại bỏ để dễ theo dõi.
>
> Chi tiết nghiệp vụ: `docs/parent_portal_plan.md`, `docs/calendar_management.md`

---

# Chú giải

| Ký hiệu | Ý nghĩa                                          |
| ------- | ------------------------------------------------ |
| 🟡      | Một phần — còn thiếu UI, tích hợp hoặc edge case |
| ❌      | Chưa phát triển                                  |

---

# Tóm tắt tiến độ

| Nhóm           | Còn lại chính                                                    |
| -------------- | ---------------------------------------------------------------- |
| Phase 1 MVP    | SaaS billing, storage enforce, CRM tags/documents, tenant polish |
| Phase 2        | QR điểm danh, notification đa kênh, chat PH, thanh toán online   |
| Phase 3–4      | CMS, Marketing, Reports `/app/reports`                           |
| Module mở rộng | Export báo cáo; lịch phase 2+                                    |
| Platform       | Impersonate, shell polish                                        |
| Future         | Transportation, Events, Communication, BI, native apps           |

---

# Phase 1 — MVP

## EPIC-001 Tenant · P0

Route: `/app/onboarding`, `/app/settings/school`, `/app/settings/campuses`

| ID         | Feature        |     | Ghi chú                               |
| ---------- | -------------- | --- | ------------------------------------- |
| TENANT-003 | Suspend School | 🟡  | Action có; UI chính ở `/platform`     |
| TENANT-004 | Delete School  | 🟡  | Archive action có; UI ở `/platform`   |
| TENANT-006 | Logo           | 🟡  | URL text; chưa upload file            |
| TENANT-007 | Theme          | 🟡  | Lưu màu; chưa áp dụng UI              |
| TENANT-009 | Branch         | 🟡  | `campus_type: branch`; chưa UX riêng  |
| TENANT-010 | Domain         | 🟡  | Lưu `custom_domain`; chưa routing/DNS |

## EPIC-002 Subscription · P0

Route: `/app/settings/subscription` · Platform: `/platform/packages`

| ID          | Feature            |     | Ghi chú                                                        |
| ----------- | ------------------ | --- | -------------------------------------------------------------- |
| PACKAGE-001 | Package Management | 🟡  | School xem/đổi gói ✅; CRUD catalog ở platform ✅ — còn polish |
| PACKAGE-005 | Billing (SaaS)     | ❌  | Stripe thuê phần mềm                                           |
| PACKAGE-007 | Storage Limit      | ❌  | Có `max_storage_mb`; chưa enforce upload                       |

## EPIC-003 CRM · P0

Route: `/app/crm`, `/app/crm/leads/[leadId]`

| ID      | Feature         |     | Ghi chú                               |
| ------- | --------------- | --- | ------------------------------------- |
| CRM-008 | Contact History | 🟡  | Activity log; chưa form liên hệ riêng |
| CRM-009 | Appointment     | 🟡  | Stage có; chưa lịch hẹn               |
| CRM-010 | School Visit    | 🟡  | Stage có; chưa form visit             |
| CRM-011 | Follow Up       | 🟡  | Notes; chưa nhắc việc                 |
| CRM-012 | Deposit         | 🟡  | Stage có; chưa gắn tài chính          |
| CRM-013 | Enrollment      | 🟡  | Stage có; chưa workflow đầy đủ        |
| CRM-017 | Dashboard       | 🟡  | KPI trên `/app`; chưa trang CRM riêng |
| CRM-020 | Tags            | ❌  |                                       |

## EPIC-004 Student · P0

Route: `/app/students`, `/app/students/[studentId]`

| ID          | Feature           |     | Ghi chú                        |
| ----------- | ----------------- | --- | ------------------------------ |
| STUDENT-009 | Graduation        | 🟡  | Status + timeline; chưa wizard |
| STUDENT-012 | Student Documents | ❌  |                                |
| STUDENT-013 | Student Photo     | 🟡  | URL text; chưa upload          |

## EPIC-006 Finance · P0

Route: `/app/finance`, `/app/finance/invoices/[invoiceId]`

| ID      | Feature           |     | Ghi chú                                    |
| ------- | ----------------- | --- | ------------------------------------------ |
| FIN-010 | QR Payment        | 🟡  | VietQR staff + PH; cần env                 |
| FIN-011 | Monthly Report    | 🟡  | Summary trong Overview; chưa báo cáo riêng |
| FIN-012 | Revenue Dashboard | 🟡  | KPI trong Finance; chưa dashboard tổng     |

---

# Phase 2 — Operations

## EPIC-008 Staff / Teacher · P1

Route: `/app/staff`, `/app/staff/[staffId]`

| ID          | Feature     |     | Ghi chú           |
| ----------- | ----------- | --- | ----------------- |
| TEACHER-005 | Schedule    | ❌  | Chỉ timetable lớp |
| TEACHER-007 | Attendance  | ❌  |                   |
| TEACHER-008 | Performance | ❌  |                   |

## EPIC-009 Parent Portal · P1

Route: `/parent`, `/parent/calendar`, `/parent/children/[studentId]`, `/parent/account`

Chi tiết: `docs/parent_portal_plan.md`

| ID         | Feature        |     | Ghi chú                                      |
| ---------- | -------------- | --- | -------------------------------------------- |
| PARENT-007 | Tuition        | 🟡  | VietQR + xem HĐ; chưa cổng thanh toán online |
| PARENT-008 | Notifications  | 🟡  | Bell + sheet; chưa cài đặt loại TB           |
| PARENT-009 | Chat           | ✅  | `/parent/messages` — GVCN + văn phòng; in-app notify |
| PARENT-011 | Calendar       | 🟡  | Xem tháng ✅; chưa nhắc nhở                  |
| PARENT-012 | Gallery        | ❌  | Media chỉ trong nhật ký                      |
| PARENT-013 | Parent Profile | 🟡  | Đổi MK ✅; chưa cài đặt thông báo            |

## EPIC-010 Notification · P1

| ID       | Feature                |     | Ghi chú |
| -------- | ---------------------- | --- | ------- |
| NOTI-001 | Email                  | ❌  |         |
| NOTI-002 | Push Notification      | ❌  |         |
| NOTI-003 | SMS                    | ❌  |         |
| NOTI-005 | Broadcast              | ❌  |         |
| NOTI-006 | Scheduled Notification | ❌  |         |

## EPIC-011 Dashboard · P1

Route: `/app`

| ID       | Feature              |     | Ghi chú                              |
| -------- | -------------------- | --- | ------------------------------------ |
| DASH-001 | Enrollment Dashboard | 🟡  | KPI cơ bản có; chưa trang chuyên sâu |
| DASH-002 | Student Dashboard    | 🟡  |                                      |
| DASH-003 | Revenue Dashboard    | 🟡  |                                      |
| DASH-004 | Attendance Dashboard | 🟡  |                                      |
| DASH-005 | Debt Dashboard       | 🟡  |                                      |
| DASH-006 | Teacher Dashboard    | ❌  |                                      |

---

# Phase 3–4

## EPIC-012 CMS · P2

| ID      | Feature      |     | Ghi chú                           |
| ------- | ------------ | --- | --------------------------------- |
| CMS-001 | Website      | ❌  |                                   |
| CMS-002 | Landing Page | 🟡  | Marketing tĩnh only               |
| CMS-003 | Blog         | ❌  |                                   |
| CMS-004 | Gallery      | ❌  |                                   |
| CMS-005 | News         | ❌  |                                   |
| CMS-006 | Menu         | ❌  |                                   |
| CMS-007 | SEO          | 🟡  | `robots.ts`, `sitemap.xml` cơ bản |
| CMS-008 | Contact Form | ❌  |                                   |
| CMS-009 | Banner       | ❌  |                                   |
| CMS-010 | Popup        | ❌  |                                   |

## EPIC-013 Marketing · P2

| ID                | Feature                                                    |     |
| ----------------- | ---------------------------------------------------------- | --- |
| MKT-001 → MKT-006 | Campaign, Email, SMS, Facebook Lead, Analytics, Conversion | ❌  |

## EPIC-014 Reports · P2

Route: **chưa có** `/app/reports` (feature flag `reports` có)

| ID         | Feature           |     |
| ---------- | ----------------- | --- |
| REPORT-001 | Student Report    | ❌  |
| REPORT-002 | Finance Report    | ❌  |
| REPORT-003 | Enrollment Report | ❌  |
| REPORT-004 | Attendance Report | ❌  |
| REPORT-005 | Teacher Report    | ❌  |
| REPORT-006 | Custom Report     | ❌  |

## EPIC-015 AI Assistant · P3

Route: `/app/ai`

| ID     | Feature         |     | Ghi chú                   |
| ------ | --------------- | --- | ------------------------- |
| AI-002 | AI Report       | 🟡  | Insights panel; chưa PDF  |
| AI-006 | AI Notification | 🟡  | Draft only; chưa gửi thật |

---

# Module mở rộng — phần còn lại

## EPIC-022 Calendar · P1 (phase 2 còn lại)

Chi tiết: `docs/calendar_management.md`

| ID      | Feature          |     | Ghi chú                    |
| ------- | ---------------- | --- | -------------------------- |
| CAL-005 | Reminder         | 🟡  | In-app ✅; push chưa có    |

_Phase 2 đã làm: tuần/ngày, phạm vi lớp/cơ sở, lọc staff, widget `/app`, nhắc in-app._

---

# EPIC-035 Platform Super Admin · P0

Route: `/platform`

| ID           | Feature                  |     | Ghi chú             |
| ------------ | ------------------------ | --- | ------------------- |
| PLATFORM-011 | Impersonate school owner | ❌  | P2 optional         |
| PLATFORM-012 | Platform UI shell        | ❌  | Polish layout riêng |

Code: `apps/web/app/platform/`, `apps/web/lib/kinder/platform/`

---

# Future roadmap — chưa bắt đầu

| EPIC     | Tên                                    | Priority |
| -------- | -------------------------------------- | -------- |
| EPIC-020 | Transportation                         | P2       |
| EPIC-021 | Event Management                       | P2       |
| EPIC-023 | Communication Center (Chat ✅; broadcast ❌) | P1       |
| EPIC-024 | Document Management                    | P2       |
| EPIC-025 | Form Builder                           | P2       |
| EPIC-026 | Workflow Approval                      | P2       |
| EPIC-027 | Purchasing                             | P2       |
| EPIC-028 | Asset Management                       | P2       |
| EPIC-029 | Maintenance                            | P2       |
| EPIC-030 | Survey Management                      | P3       |
| EPIC-031 | Knowledge Base (nội bộ)                | P3       |
| EPIC-032 | Support Center                         | P3       |
| EPIC-033 | Reports & BI                           | P2       |
| EPIC-034 | AI Assistant (mở rộng)                 | P3       |

---

# Ưu tiên Sprint tiếp theo

1. PARENT-008 / PARENT-013 — cài đặt thông báo phụ huynh
2. PARENT-007 — thanh toán học phí online
3. EPIC-014 Reports module (`/app/reports`)
4. EPIC-010 — Email / Push / SMS
5. PACKAGE-005 — SaaS billing (Stripe)
6. PLATFORM-011 / PLATFORM-012 (optional)

---

# Ghi chú kỹ thuật

- Workspace: `apps/web/app/app/`, `apps/web/lib/kinder/`
- Parent portal: `apps/web/app/parent/`, `apps/web/components/parent-portal/`
- Platform: `apps/web/app/platform/`
- Migrations: `apps/web/supabase/migrations/202607*.sql`

## Definition of Done (tham chiếu)

Feature hoàn thành khi: Business Rule · UI · API · DB · Unit Test · QA · UAT · Docs — backlog trên chỉ phản ánh **engineering gap**, chưa qua QA/UAT.
