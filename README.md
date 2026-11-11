# Audio Grabber 🎵

> Ứng dụng web Full-stack (React + Node.js/Express) tải âm thanh chất lượng cao `.m4a` (AAC) từ video YouTube, tối ưu hóa đặc biệt cho Safari trên iPhone, iPad và máy tính.

---

## Mục lục
- [Tính năng nổi bật](#tính-năng-nổi-bật)
- [Cài đặt trên Windows](#cài-đặt-trên-windows)
- [Cài đặt trên macOS](#cài-đặt-trên-macos)
- [Cài đặt mã nguồn & Khởi chạy](#cài-đặt-mã-nguồn--khởi-chạy)
- [Cách mở từ iPhone / Android qua Wi-Fi](#cách-mở-từ-iphone--android-qua-wi-fi)
- [Cấu hình Cookie chống chặn bot YouTube](#cấu-hình-cookie-chống-chặn-bot-youtube)
- [Cách lưu file .m4a vào iPhone](#cách-lưu-file-m4a-vào-iphone)

---

## Tính năng nổi bật

- **Tối ưu Safari iPhone**: Nút tải về dùng link trực tiếp tiêu chuẩn (`Content-Disposition: attachment`), không tạo Blob trên trình duyệt giúp tránh tràn RAM hay văng Safari trên iOS.
- **Luồng AAC nguyên bản**: Ưu tiên tải định dạng `.m4a` gốc của YouTube, giữ nguyên chất lượng âm thanh, không tốn thời gian mã hóa lại. Nếu video không có m4a, FFmpeg tự động chuyển đổi sang AAC 128k chuẩn.
- **Hàng đợi thông minh**: Chạy tối đa 2 tác vụ song song, hàng đợi lên đến 20 video. Một bài lỗi không làm dừng các bài khác.
- **Nhận diện đa dạng link**: Tự động nhận diện link `youtube.com/watch?v=...`, `youtu.be/...`, `m.youtube.com`, `music.youtube.com`, `youtube.com/shorts/...`, tự loại bỏ tham số danh sách phát `list=...`.
- **Hỗ trợ tùy chọn video**: Có thể chuyển đổi giữa tải âm thanh `.m4a` hoặc video `.mp4` (720p / 1080p) trong phần Cài đặt.
- **Tự động dọn dẹp**: File tải về trong thư mục tạm `/tmp` được dọn dẹp tự động sau 15 phút để giải phóng bộ nhớ.

---

## Cài đặt trên Windows

Ứng dụng cần **Node.js**, **yt-dlp** và **FFmpeg** được cài đặt trên máy.

### Cách 1: Cài tự động bằng lệnh `winget` (Khuyên dùng)
Mở **PowerShell** (hoặc Command Prompt) với quyền Administrator và chạy các lệnh:

```powershell
# 1. Cài Node.js (LTS)
winget install OpenJS.NodeJS.LTS

# 2. Cài yt-dlp
winget install yt-dlp.yt-dlp

# 3. Cài FFmpeg
winget install Gyan.FFmpeg
```

> **Lưu ý:** Sau khi cài xong, hãy **tắt và mở lại PowerShell** để hệ thống nhận diện các lệnh mới.

### Cách 2: Cài thủ công
1. Tải và cài đặt Node.js từ [nodejs.org](https://nodejs.org/) (chọn bản LTS).
2. Tải `yt-dlp.exe` từ [GitHub yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases) và đặt vào thư mục trong `PATH` (hoặc đặt vào thư mục `bin/` của dự án này).
3. Tải FFmpeg từ [ffmpeg.org](https://ffmpeg.org/download.html) và thêm thư mục `bin` của ffmpeg vào biến môi trường `PATH`.

### Kiểm tra cài đặt thành công:
```powershell
node -v
yt-dlp --version
ffmpeg -version
```

---

## Cài đặt trên macOS

Trên macOS, cách đơn giản nhất là sử dụng [Homebrew](https://brew.sh/):

```bash
# Cài đặt Node.js, yt-dlp và ffmpeg cùng lúc
brew install node yt-dlp ffmpeg
```

### Kiểm tra cài đặt:
```bash
node -v
yt-dlp --version
ffmpeg -version
```

---

## Cài đặt mã nguồn & Khởi chạy

1. Mở thư mục dự án trong Terminal / PowerShell:
```bash
cd audio-grabber
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

3. Khởi chạy máy chủ:
```bash
npm run dev
```

Khi chạy thành công, màn hình terminal sẽ hiển thị các địa chỉ truy cập:
```text
Audio Grabber server running on:
  - Local:   http://localhost:3000
  - Wi-Fi:   http://192.168.1.15:3000
```

---

## Cách mở từ iPhone / Android qua Wi-Fi

1. **Kết nối chung mạng Wi-Fi**: Đảm bảo điện thoại iPhone/Android và máy tính của bạn đang kết nối vào **cùng một mạng Wi-Fi** (hoặc máy tính phát Hotspot cho điện thoại bắt).
2. **Lấy địa chỉ IP máy tính**:
   - Xem ngay trên dòng `Wi-Fi: http://<IP>:3000` mà ứng dụng vừa in ra khi khởi chạy.
   - Hoặc kiểm tra thủ công:
     * **Windows**: Mở PowerShell/CMD, gõ `ipconfig`, tìm dòng `IPv4 Address` (ví dụ `192.168.1.15`).
     * **macOS**: Mở Terminal, gõ `ipconfig getifaddr en0` (hoặc vào *System Settings > Wi-Fi > Details*).
3. **Mở trên điện thoại**:
   - Mở trình duyệt **Safari** (trên iPhone) hoặc **Chrome** (trên Android).
   - Nhập địa chỉ: `http://192.168.1.15:3000` (thay bằng IP thực tế của máy tính bạn).
4. **Nếu điện thoại không kết nối được (quay vô tận):**
   - **Tường lửa Windows (Windows Firewall)**: Mở Windows Security > Firewall & network protection > Allow an app through firewall > tích chọn cho phép **Node.js JavaScript Runtime** ở mạng **Private**.
   - **Tường lửa macOS**: Vào *System Settings > Network > Firewall*, cho phép Node.js nhận kết nối đến.

---

## Cấu hình Cookie chống chặn bot YouTube

Khi chạy trên máy tính cá nhân tại nhà (mạng gia đình Viettel/VNPT/FPT), YouTube rất hiếm khi chặn IP. Tuy nhiên, nếu bạn gặp thông báo *"YouTube đang chặn IP của máy chủ này"*, bạn có thể sử dụng cookie từ trình duyệt cá nhân để xác thực với YouTube.

Tạo hoặc chỉnh sửa file `.env` tại thư mục gốc của dự án:

```env
# Cổng chạy ứng dụng (mặc định 3000)
PORT=3000

# Trích xuất cookie trực tiếp từ trình duyệt bạn đã đăng nhập YouTube
# Giá trị hỗ trợ: chrome, firefox, edge, brave, opera, vivaldi, safari
YTDLP_COOKIES_FROM_BROWSER=chrome

# Hoặc dùng file cookies xuất ra bằng extension (nếu không muốn đọc trực tiếp từ trình duyệt)
# YTDLP_COOKIES_FILE=./cookies.txt

# Cấu hình proxy nếu cần
# YTDLP_PROXY=http://127.0.0.1:1080
```

Khởi động lại ứng dụng (`npm run dev`) để cấu hình có hiệu lực.

---

## Cách lưu file .m4a vào iPhone

1. Dán liên kết YouTube và bấm **"Thêm vào hàng đợi"**.
2. Khi trạng thái chuyển sang **"Sẵn sàng"**, bấm nút màu xanh **"Tải về .m4a"**.
3. Safari sẽ hiện thông báo: *"Bạn có muốn tải về file này không?"* &rarr; Bấm **Tải về**.
4. Biểu tượng mũi tên xanh tải về sẽ xuất hiện trên thanh địa chỉ Safari.
5. Để mở file: Mở ứng dụng **Tệp (Files)** trên iPhone &rarr; vào thư mục **Tải về (Downloads)** để phát nhạc trực tiếp hoặc chia sẻ vào CapCut, GarageBand hay lưu vào ghi chú.

---

## Bản quyền & Giấy phép
Mã nguồn được phát triển phục vụ mục đích học tập và sử dụng cá nhân phi thương mại.
