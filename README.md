# Trợ Lý Học Tập - Study Assistant

Ứng dụng web trợ lý học tập thông minh giúp tạo lịch ôn thi hợp lý dựa trên số ngày còn lại và thời gian biểu cá nhân.

## Tính Năng Chính

### 1. Quản Lý Môn Học
- Thêm, sửa, xóa môn học
- Thông tin môn học bao gồm:
  - Tên môn
  - Ngày thi
  - Độ khó (1-5)
  - Số chương học
  - Số buổi học/tuần
  - Màu sắc riêng

### 2. Tạo Lịch Học Thông Minh
- Thuật toán phân tích và tạo lịch học tối ưu
- Ưu tiên môn thi sớm và môn khó
- Phân bổ thời gian hợp lý theo số chương
- Tự động tính toán thời gian học dựa trên preferences người dùng

### 3. Giao Diện Lịch (Calendar)
- Xem lịch học theo tháng
- Hiển thị chi tiết buổi học: môn, giờ, chủ đề
- Chỉnh sửa hoặc xóa buổi học
- Đánh dấu buổi học đã hoàn thành
- Thêm ghi chú cho mỗi buổi học

### 4. Hệ Thống Nhắc Nhở
- Nhắc nhở trước 30 phút khi đến giờ học
- Cảnh báo khi còn ít ngày đến kỳ thi (dưới 7 ngày)
- Sử dụng Web Notification API

### 5. Xác Thực & Bảo Mật
- Đăng ký/Đăng nhập với Supabase Auth
- Row Level Security (RLS) bảo vệ dữ liệu
- Mỗi người dùng chỉ truy cập dữ liệu của mình

## Kiến Trúc Kỹ Thuật

### Frontend
- **React 18** với TypeScript
- **Tailwind CSS** cho styling
- **Lucide React** cho icons
- **Vite** làm build tool

### Backend
- **Supabase** cho database và authentication
- **PostgreSQL** database với RLS

## Cấu Trúc Database

### Tables
1. **profiles** - Thông tin người dùng
2. **subjects** - Môn học
3. **study_sessions** - Buổi học
4. **user_preferences** - Cài đặt người dùng
5. **reminders** - Nhắc nhở

## Cài Đặt & Chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn
- Tài khoản Supabase

### Bước 1: Clone và Install
```bash
npm install
```

### Bước 2: Cấu Hình Environment
File `.env` đã được cấu hình sẵn với Supabase credentials.

### Bước 3: Chạy Development Server
```bash
npm run dev
```

### Bước 4: Build cho Production
```bash
npm run build
```

## Cấu Trúc Thư Mục

```
src/
├── components/          # React components
│   ├── Auth.tsx        # Đăng nhập/Đăng ký
│   ├── Dashboard.tsx   # Trang chính
│   ├── Calendar.tsx    # Lịch học
│   ├── SubjectCard.tsx # Card môn học
│   ├── AddSubjectModal.tsx
│   └── EditSessionModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/          # Backend services
│   ├── authService.ts
│   ├── subjectService.ts
│   ├── studySessionService.ts
│   ├── preferencesService.ts
│   ├── profileService.ts
│   └── notificationService.ts
├── hooks/            # Custom hooks
│   └── useNotifications.ts
├── lib/             # Libraries
│   ├── supabase.ts  # Supabase client
│   └── mockScheduleGenerator.ts # Thuật toán tạo lịch
└── App.tsx          # Main app component
```

## Sử Dụng

### 1. Đăng Ký/Đăng Nhập
- Mở ứng dụng và tạo tài khoản mới
- Hoặc đăng nhập nếu đã có tài khoản

### 2. Thêm Môn Học
- Click "Thêm Môn Học"
- Điền thông tin: tên môn, ngày thi, độ khó, số chương, số buổi/tuần
- Chọn màu sắc cho môn học

### 3. Tạo Lịch Học
- Chuyển sang tab "Lịch Học"
- Chọn môn học muốn tạo lịch (có thể chọn nhiều môn cùng lúc)
- Click "Tạo lịch" để tạo lịch học tối ưu cho các môn đã chọn

### 4. Quản Lý Buổi Học
- Click vào buổi học để chỉnh sửa
- Thêm ghi chú, đánh dấu hoàn thành
- Xóa buổi học nếu cần

### 5. Nhận Nhắc Nhở
- Cho phép notification khi được hỏi
- Nhận nhắc nhở trước 30 phút
- Nhận cảnh báo kỳ thi sắp đến

## Tính Năng Đặc Biệt

### Smart Schedule Generation
Thuật toán tạo lịch học xem xét:
- Số ngày còn lại đến kỳ thi
- Số chương cần học
- Thời gian rảnh của người dùng
- Khung giờ ưa thích
- Số buổi học/tuần của môn

### Security Features
- Email/Password authentication
- Row Level Security trên tất cả tables
- Mã hóa dữ liệu trong database

## Công Nghệ Sử Dụng

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Database
- **PostgreSQL** - Database
- **Vite** - Build Tool
- **Lucide React** - Icons

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Notification API requires HTTPS in production.

## License

MIT
