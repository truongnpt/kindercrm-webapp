# EPIC-019 Tuition Management

**Status:** Planning  
**Priority:** P1

## Description

Module Tuition Management giúp nhà trường quản lý học phí, các khoản thu, hóa đơn, thanh toán và công nợ của học sinh. Hệ thống hỗ trợ nhiều phương thức thanh toán và theo dõi lịch sử thanh toán của từng học sinh.

## Business Goal

- Quản lý học phí tập trung.
- Tự động tạo hóa đơn theo kỳ.
- Theo dõi công nợ.
- Hỗ trợ nhiều phương thức thanh toán(Tiền mặt, Chuyển khoản, Quét QR).
- Quản lý biên lai.
- Đồng bộ với Parent Portal.

---

## TUITION-001 Fee Categories

### Chức năng

- Học phí
- Tiền ăn
- Xe đưa đón
- Đồng phục
- Ngoại khóa
- Câu lạc bộ
- Bảo hiểm
- Phí khác

---

## TUITION-002 Fee Plans

### Chức năng

- Quản lý bảng giá theo lớp
- Theo năm học
- Theo tháng
- Theo học sinh
- Ngày hiệu lực

Ví dụ:

- Học phí: 4.500.000 VNĐ
- Tiền ăn: 1.200.000 VNĐ

---

## TUITION-003 Invoice Management

### Chức năng

- Tạo hóa đơn
- Tạo hàng loạt
- Chỉnh sửa
- Hủy
- Xem chi tiết
- In
- Xuất PDF

---

## TUITION-004 Invoice Items

Các khoản trong hóa đơn:

- Học phí
- Tiền ăn
- Xe đưa đón
- Đồng phục
- Ngoại khóa
- Giảm giá
- Phụ thu

---

## TUITION-005 Payment

### Phương thức thanh toán

- Tiền mặt
- Chuyển khoản
- QR Banking

### Chức năng

- Ghi nhận thanh toán
- Upload biên lai
- Xác nhận thanh toán
- Hủy thanh toán

---

## TUITION-006 Payment Verification

### Chức năng

- Waiting Verification
- Verified
- Rejected
- Ghi chú

**Business Rule**

- Chỉ School Admin hoặc Accountant được xác nhận thanh toán.

---

## TUITION-007 Receipt

### Chức năng

- Sinh biên lai
- In
- Xuất PDF
- Gửi Email
- Hiển thị trên Parent Portal

---

## TUITION-008 Discount

### Chức năng

- Giảm theo %
- Giảm theo số tiền
- Miễn giảm
- Ưu đãi anh chị em
- Khuyến mãi

---

## TUITION-009 Debt Management

### Chức năng

- Danh sách công nợ
- Quá hạn
- Thanh toán một phần
- Theo dõi số tiền còn lại

---

## TUITION-010 Refund

### Chức năng

- Tạo yêu cầu hoàn tiền
- Phê duyệt
- Ghi nhận hoàn tiền

---

## TUITION-011 Parent Portal

### Chức năng

- Xem hóa đơn
- Xem công nợ
- Upload biên lai
- Tải hóa đơn PDF
- Tải biên lai
- Xem lịch sử thanh toán

---

## TUITION-012 Reports

### Chức năng

- Doanh thu
- Công nợ
- Đã thanh toán
- Chưa thanh toán
- Theo lớp
- Theo tháng

---

# Payment Flow

```text
Accountant
    │
Tạo hóa đơn
    │
Parent Portal
    │
Phụ huynh thanh toán
    ├── Tiền mặt
    ├── Chuyển khoản
    └── QR Banking
    │
Upload biên lai (nếu có)
    │
Accountant xác nhận
    │
Sinh biên lai
    │
Thông báo phụ huynh
```

## Invoice Status

- Draft
- Issued
- Pending Payment
- Waiting Verification
- Paid
- Overdue
- Cancelled

## Payment Status

- Pending
- Waiting Verification
- Verified
- Rejected

## Business Rules

1. Một hóa đơn chỉ thuộc một học sinh.
2. Một hóa đơn có nhiều khoản thu.
3. Một hóa đơn có thể thanh toán nhiều lần (Partial Payment).
4. Thanh toán chuyển khoản và QR Banking phải được xác nhận trước khi chuyển sang Paid.
5. Sau khi xác nhận thanh toán, hệ thống tự động sinh biên lai.
6. Phụ huynh chỉ xem được hóa đơn của con mình.
7. Mọi thao tác phải được ghi vào Audit Log.

## MVP Scope

- Fee Categories
- Fee Plans
- Invoice Management
- Invoice Items
- Cash Payment
- Bank Transfer
- QR Banking
- Upload Proof
- Payment Verification
- Receipt PDF
- Debt Management
- Parent Portal
- Basic Reports
