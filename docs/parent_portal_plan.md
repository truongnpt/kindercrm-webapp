# Parent Portal

Status

Planning

Priority

P1

## Description

Parent Portal là cổng thông tin dành cho phụ huynh, giúp theo dõi tình hình học tập, sinh hoạt và sức khỏe của con, đồng thời hỗ trợ trao đổi với nhà trường và thực hiện các yêu cầu trực tuyến.

## Business Goal

- Tăng sự kết nối giữa nhà trường và phụ huynh.
- Minh bạch thông tin học sinh.
- Giảm các công việc thủ công của giáo viên.
- Nâng cao trải nghiệm của phụ huynh.

---

# PARENT-001 Dashboard

Hiển thị thông tin tổng quan của học sinh.

## Chức năng

- Thông tin học sinh
- Lớp học
- Giáo viên chủ nhiệm
- Điểm danh hôm nay
- Nhật ký hôm nay
- Thông báo mới
- Học phí
- Sự kiện sắp diễn ra

---

# PARENT-002 Student Information

Quản lý và xem thông tin học sinh.

## Chức năng

- Hồ sơ học sinh
- Thông tin phụ huynh
- Thông tin người đón
- Thông tin sức khỏe
- Thông tin dị ứng

---

# PARENT-003 Attendance

Theo dõi điểm danh của học sinh.

## Chức năng

- Check-in
- Check-out
- Lịch sử điểm danh
- Thống kê nghỉ học

---

# PARENT-004 Daily Report

Theo dõi nhật ký hằng ngày của học sinh.

## Chức năng

- Hoạt động trong ngày
- Ăn uống
- Ngủ nghỉ
- Vệ sinh
- Học tập
- Hình ảnh
- Video
- Nhận xét giáo viên

---

# PARENT-005 Meal Menu

Theo dõi thực đơn của trường.

## Chức năng

- Thực đơn hôm nay
- Thực đơn tuần
- Thành phần món ăn
- Ghi chú dị ứng

---

# PARENT-006 Health

Theo dõi sức khỏe của học sinh.

## Chức năng

- Chiều cao
- Cân nặng
- Hồ sơ sức khỏe
- Tiêm chủng
- Dị ứng
- Lịch sử khám sức khỏe

---

# PARENT-007 Tuition

Quản lý học phí.

## Chức năng

- Danh sách hóa đơn
- Công nợ
- Lịch sử thanh toán
- Biên lai
- Thanh toán trực tuyến

---

# PARENT-008 Notifications(skip)

Nhận thông báo từ nhà trường.

## Chức năng

- Thông báo chung
- Thông báo lớp học
- Thông báo học phí
- Thông báo sự kiện
- Đánh dấu đã đọc

---

# PARENT-009 Communication ✅

Trao đổi với nhà trường — `/parent/messages`.

## Chức năng

- Chat với GVCN (`homeroom` channel) ✅
- Chat với văn phòng (`school_office` channel) ✅
- Thông báo in-app khi có tin mới ✅
- Gửi hình ảnh ✅ (tự nén nếu > 5MB)
- Gửi tệp đính kèm — schema sẵn, UI chưa

Staff: `/app/messages`

---

# PARENT-010 Leave Request

Gửi đơn xin nghỉ học.

## Chức năng

- Tạo đơn xin nghỉ
- Chọn thời gian nghỉ
- Ghi chú lý do
- Theo dõi trạng thái xử lý

---

# PARENT-011 Calendar

Theo dõi lịch học và sự kiện.

**Trạng thái:** 🟡 MVP — `/parent/calendar` + widget dashboard; chỉ đọc.

## Chức năng

- Lịch học
- Nghỉ lễ
- Sự kiện
- Họp phụ huynh

---

# PARENT-012 Gallery(skip)

Xem hình ảnh và video.

## Chức năng

- Album theo ngày
- Album theo sự kiện
- Video
- Tải hình ảnh

---

# PARENT-013 Parent Profile

Quản lý tài khoản phụ huynh.

## Chức năng

- Thông tin cá nhân
- Đổi mật khẩu
- Cập nhật số điện thoại
- Cập nhật email
- Cài đặt thông báo

---

# Business Rules

- Một phụ huynh có thể quản lý nhiều học sinh.
- Phụ huynh chỉ được xem dữ liệu của học sinh được liên kết với tài khoản.
- Không được chỉnh sửa dữ liệu học sinh, chỉ được gửi yêu cầu cập nhật nếu cần.
- Mọi giao dịch và thao tác của phụ huynh phải được ghi nhận vào Audit Log.
- Các thông báo chưa đọc phải hiển thị trên Dashboard.
- Phụ huynh có thể thanh toán học phí trực tuyến nếu trường kích hoạt tính năng này.
