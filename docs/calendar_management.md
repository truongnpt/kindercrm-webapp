# EPIC-022 Calendar Management

Status

In Progress (~85%)

Priority

P1

## Description

Module Calendar Management giúp nhà trường quản lý lịch hoạt động, sự kiện và các ngày quan trọng. Hệ thống cho phép tạo lịch cho toàn trường hoặc từng lớp, đồng thời hiển thị lịch phù hợp theo từng vai trò như Ban Giám Hiệu, Giáo viên và Phụ huynh.

## Business Goal

- Quản lý lịch tập trung.
- Đồng bộ lịch giữa nhà trường, giáo viên và phụ huynh.
- Nhắc nhở các sự kiện quan trọng.
- Giảm bỏ sót các hoạt động của trường.

---

## CAL-001 Calendar Dashboard

Hiển thị lịch theo:

- Tháng
- Tuần
- Ngày

---

## CAL-002 Event Management

Quản lý sự kiện.

### Chức năng

- Tạo sự kiện
- Chỉnh sửa sự kiện
- Xóa sự kiện
- Xem chi tiết sự kiện

---

## CAL-003 Event Category

Quản lý loại sự kiện.

### Loại sự kiện

- Hoạt động học tập
- Sự kiện
- Nghỉ lễ
- Họp phụ huynh
- Khám sức khỏe
- Khác

---

## CAL-004 Event Assignment

Phân bổ sự kiện.

Có thể áp dụng cho:

- Toàn trường
- Chi nhánh
- Lớp học

---

## CAL-005 Reminder

Nhắc nhở sự kiện.

### Chức năng

- Thông báo trên hệ thống
- Gửi Push Notification (nếu có Mobile App)

---

## CAL-006 Calendar Filter

Lọc lịch theo:

- Lớp học
- Loại sự kiện
- Khoảng thời gian

---

## Business Rules

- Giáo viên chỉ được tạo và quản lý lịch của lớp mình (nếu được phân quyền).
- School Admin và Principal có thể quản lý lịch toàn trường.
- Phụ huynh chỉ được xem các sự kiện áp dụng cho lớp hoặc học sinh của mình.
- Khi tạo sự kiện có thể chọn phạm vi áp dụng: Toàn trường, Chi nhánh hoặc Lớp học.
- Các sự kiện sắp diễn ra sẽ hiển thị trên Dashboard của người dùng.
