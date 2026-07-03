# EPIC-027 Payment Settings

Status

Planning

Priority

P1

## Description

Payment Settings cho phép mỗi trường (Tenant) cấu hình các phương thức thanh toán và tài khoản nhận tiền. Thông tin này được sử dụng xuyên suốt hệ thống Billing để hiển thị cho phụ huynh khi thanh toán học phí.

Mỗi trường có thể cấu hình nhiều tài khoản ngân hàng, lựa chọn tài khoản mặc định, bật/tắt các phương thức thanh toán và thiết lập hướng dẫn thanh toán.

---

# PAYMENT-001 Payment Methods

Quản lý phương thức thanh toán.

## Chức năng

- Tiền mặt (Cash)
- Chuyển khoản ngân hàng (Bank Transfer)
- QR Banking (VietQR)
- Bật/Tắt từng phương thức thanh toán
- Thiết lập phương thức mặc định

## Business Rules

- Một trường có thể bật nhiều phương thức thanh toán.
- Ít nhất phải có một phương thức được kích hoạt.
- Chỉ School Admin được phép thay đổi cấu hình.

---

# PAYMENT-002 Bank Accounts

Quản lý tài khoản ngân hàng.

## Chức năng

- Thêm tài khoản ngân hàng
- Chỉnh sửa
- Xóa
- Khóa/Kích hoạt
- Chọn tài khoản mặc định
- Gán theo chi nhánh (Optional)

## Thông tin

- Ngân hàng
- Mã ngân hàng (Bank Code)
- Số tài khoản
- Tên chủ tài khoản
- Chi nhánh
- Logo ngân hàng
- Trạng thái
- Mặc định

## Business Rules

- Một trường có thể có nhiều tài khoản ngân hàng.
- Chỉ có một tài khoản mặc định.
- Không được xóa tài khoản đã từng phát sinh giao dịch.
- Nếu tài khoản đã sử dụng trong hóa đơn thì chỉ được chuyển sang Inactive.

---

# PAYMENT-003 QR Banking

Quản lý QR Banking.

## Chức năng

- Bật/Tắt QR Banking
- Sinh QR động theo hóa đơn
- Hiển thị QR trên Parent Portal
- Hiển thị QR trên PDF Invoice

## Thông tin QR

- Bank Code
- Account Number
- Account Name
- Amount
- Transfer Content

## Business Rules

- QR được sinh tự động từ thông tin hóa đơn.
- QR luôn chứa số tiền cần thanh toán.
- QR luôn chứa nội dung chuyển khoản duy nhất.

---

# PAYMENT-004 Transfer Content

Quản lý nội dung chuyển khoản.

## Chức năng

- Thiết lập mẫu nội dung chuyển khoản
- Sinh tự động
- Không cho phép chỉnh sửa thủ công

## Ví dụ

INV-202608-000001

hoặc

HP-000123

## Business Rules

- Nội dung chuyển khoản phải là duy nhất.
- Mỗi hóa đơn có một mã riêng.
- Không được trùng lặp.

---

# PAYMENT-005 Payment Instructions

Hướng dẫn thanh toán.

## Chức năng

- Nội dung hướng dẫn
- Hình ảnh hướng dẫn
- Video hướng dẫn (Optional)
- Ghi chú

Ví dụ

1. Quét mã QR.
2. Kiểm tra số tiền.
3. Không thay đổi nội dung chuyển khoản.
4. Hoàn tất giao dịch.

---

# PAYMENT-006 Invoice Integration

Liên kết với hóa đơn.

## Chức năng

Khi tạo hóa đơn, hệ thống sẽ tự động:

- Chọn tài khoản mặc định
- Sinh QR Banking
- Sinh nội dung chuyển khoản
- Hiển thị trên Invoice
- Hiển thị trên Parent Portal

---

# PAYMENT-007 Parent Portal

Phụ huynh.

## Chức năng

Hiển thị

- Số tiền cần thanh toán
- Ngân hàng
- Số tài khoản
- Chủ tài khoản
- QR Banking
- Nội dung chuyển khoản
- Nút "Đã thanh toán"
- Upload biên lai (Optional)

---

# PAYMENT-008 Payment Verification

Xác nhận thanh toán.

## Chức năng

- Danh sách thanh toán chờ xác nhận
- Xem biên lai
- Xác nhận
- Từ chối
- Ghi chú

## Business Rules

- Chỉ School Admin hoặc Accountant được xác nhận.
- Sau khi xác nhận sẽ cập nhật Invoice thành Paid.
- Tự động tạo Receipt.

---

# PAYMENT-009 Audit Log

Theo dõi thay đổi.

## Ghi nhận

- Thêm tài khoản ngân hàng
- Chỉnh sửa
- Đổi tài khoản mặc định
- Thay đổi phương thức thanh toán
- Xóa/Khóa tài khoản

---

# Database Design

## payment_methods

- id
- tenant_id
- method
- is_enabled
- is_default
- created_at
- updated_at

---

## payment_accounts

- id
- tenant_id
- campus_id (Nullable)
- bank_name
- bank_code
- account_number
- account_name
- branch
- is_default
- status
- created_at
- updated_at

---

## payment_instructions

- id
- tenant_id
- title
- description
- image_url
- created_at

---

## invoices

- payment_account_id
- payment_method
- transfer_content
- qr_code_url

---

# Payment Flow

School Admin

↓

Settings

↓

Payment Settings

↓

Thêm tài khoản ngân hàng

↓

Đặt mặc định

↓

Tạo Invoice

↓

Hệ thống tự động

- Chọn tài khoản ngân hàng
- Sinh QR Banking
- Sinh nội dung chuyển khoản

↓

Parent Portal

↓

Phụ huynh

- Quét QR
- Chuyển khoản
- Nhấn "Đã thanh toán"
- Upload biên lai (Optional)

↓

Accountant

↓

Payment Verification

↓

Approved

↓

Invoice = Paid

↓

Receipt

↓

Notification

---

# MVP Scope

## Bao gồm

- Quản lý phương thức thanh toán
- Quản lý nhiều tài khoản ngân hàng
- Chọn tài khoản mặc định
- Sinh QR Banking (VietQR)
- Sinh nội dung chuyển khoản tự động
- Hiển thị trên Invoice
- Hiển thị trên Parent Portal
- Upload biên lai
- Xác nhận thanh toán thủ công
- Audit Log
