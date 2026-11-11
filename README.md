# Audio Grabber 🎵

> Ứng dụng web full-stack (React + Node.js/Express) giúp trích xuất và tải âm thanh `.m4a` (AAC) từ video YouTube, tối ưu cho Safari trên iPhone/iPad và trình duyệt máy tính. Hỗ trợ hàng đợi nhiều bài, tự gợi ý tên file theo mẫu `Tên Tác Giả - Tên Bài Hát (Thể loại).m4a`.

**Xây dựng bằng AI:** dự án được tạo trên **Google AI Studio** (chế độ Build) bằng mô hình **Gemini 3.8 Flash**. Các prompt được soạn với sự hỗ trợ của trợ lý AI Claude (Anthropic), sau đó chạy và kiểm thử trên máy cá nhân. Dự án không liên kết với, không được tài trợ hay chứng thực bởi Google hoặc YouTube.

---

## Mục lục

- [Tính năng nổi bật](#tính-năng-nổi-bật)
- [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
- [Hướng 1: Người dùng phổ thông (chạy bằng file .bat)](#hướng-1-người-dùng-phổ-thông-chạy-bằng-file-bat)
- [Hướng 2: Lập trình viên / IT (phát triển trong VS Code)](#hướng-2-lập-trình-viên--it-phát-triển-trong-vs-code)
- [Đặt tên file & gợi ý bằng AI](#đặt-tên-file--gợi-ý-bằng-ai)
- [Mở từ iPhone / Android qua Wi-Fi](#mở-từ-iphone--android-qua-wi-fi)
- [Cấu hình Cookie chống chặn bot YouTube](#cấu-hình-cookie-chống-chặn-bot-youtube)
- [Cách lưu file .m4a vào iPhone](#cách-lưu-file-m4a-vào-iphone)
- [Biến môi trường](#biến-môi-trường)
- [Khắc phục sự cố](#khắc-phục-sự-cố)
- [Giấy phép & miễn trừ trách nhiệm](#giấy-phép--miễn-trừ-trách-nhiệm)

---

## Tính năng nổi bật

- **Tối ưu Safari iPhone**: nút "Tải về" là link trực tiếp (`Content-Disposition: attachment`), không nạp Blob vào RAM nên không bị tràn bộ nhớ hay văng tab trên iOS.
- **Giữ nguyên chất lượng gốc**: ưu tiên luồng `.m4a` (AAC) có sẵn của YouTube, không mã hóa lại. Nếu video không có m4a, FFmpeg tự chuyển sang AAC 128k.
- **Hàng đợi thông minh**: chạy tối đa 2 tác vụ song song, hàng đợi tối đa 20 mục, một bài lỗi không làm dừng các bài khác.
- **Nhận diện nhiều dạng link**: `youtube.com/watch?v=...`, `youtu.be/...`, `m.youtube.com`, `music.youtube.com`, `youtube.com/shorts/...`; tự bỏ tham số danh sách phát `list=...`.
- **Đặt tên file theo mẫu**: tự gợi ý Tác giả / Tên bài / Thể loại, cho phép sửa trước khi tải, có xem trước tên file.
- **Tùy chọn video**: có thể chuyển sang tải video `.mp4` (720p / 1080p) trong phần Cài đặt.
- **Kiểm tra hệ thống**: nút "Hệ thống" cho biết yt-dlp, FFmpeg, Node.js đã sẵn sàng chưa.
- **Tự dọn dẹp**: file tạm được xóa sau 15 phút.

---

## Điều kiện tiên quyết

Ứng dụng cần 3 thành phần trên máy:

| Thành phần | Vai trò | Bắt buộc? |
|---|---|---|
| Node.js (bản LTS) | Chạy máy chủ ứng dụng | Có |
| yt-dlp | Lấy và tải luồng âm thanh từ YouTube | Có |
| FFmpeg | Chuyển đổi định dạng, ghép video MP4 | Cần khi tải video MP4 hoặc video không có sẵn m4a; nên cài |

### Windows (khuyên dùng winget)

Mở PowerShell hoặc Command Prompt (thường không cần quyền Administrator) và chạy:

```powershell
winget install OpenJS.NodeJS.LTS
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```

Sau khi cài xong, **đóng và mở lại cửa sổ dòng lệnh** để hệ thống nhận lệnh mới. Kiểm tra:

```powershell
node -v
yt-dlp --version
ffmpeg -version
```

Cài thủ công: tải Node.js từ nodejs.org; tải `yt-dlp.exe` từ trang Releases của yt-dlp trên GitHub rồi đặt vào thư mục có trong `PATH` (hoặc vào thư mục `bin/` của dự án); tải FFmpeg và thêm thư mục `bin` của nó vào `PATH`.

### macOS

```bash
brew install node yt-dlp ffmpeg
```

> File `.bat` chỉ dành cho Windows. Trên macOS/Linux hãy dùng [Hướng 2](#hướng-2-lập-trình-viên--it-phát-triển-trong-vs-code).

---

## Hướng 1: Người dùng phổ thông (chạy bằng file .bat)

*Dành cho Windows. Không cần gõ lệnh.*

### Bước 1: Thiết lập (chỉ làm một lần)

1. Trên trang GitHub của dự án, bấm **Code → Download ZIP**, rồi giải nén vào một thư mục cố định (ví dụ `D:\AudioGrabber`).
2. Cài Node.js, yt-dlp và FFmpeg theo mục [Điều kiện tiên quyết](#điều-kiện-tiên-quyết).
3. Nhấp đúp file **`setup.bat`**. File sẽ tự: tạo file cấu hình `.env`, cài thư viện (`npm install --legacy-peer-deps`) và build giao diện (`npm run build`).
4. Khi thấy dòng **"CAI DAT HOAN TAT THANH CONG!"**, nhấn phím bất kỳ để đóng.

> Nếu Windows hiện cảnh báo vì file tải từ Internet, chọn **More info → Run anyway**. Bạn có thể mở file `.bat` bằng Notepad để xem nội dung trước khi chạy.

### Bước 2: Dùng hằng ngày

1. Nhấp đúp **`start.bat`**. Máy chủ khởi động và trình duyệt tự mở `http://localhost:3000`.
2. Dán link YouTube, bấm **Thêm vào hàng đợi**, chờ trạng thái **Sẵn sàng**, kiểm tra tên file rồi bấm **Tải về**.
3. Dùng xong, đóng cửa sổ đen của `start.bat` để tắt ứng dụng. **Cửa sổ này phải mở suốt lúc dùng.**

> Khi sửa mã nguồn hoặc cập nhật phiên bản mới, xóa thư mục `dist` rồi chạy lại `setup.bat` để build lại.

---

## Hướng 2: Lập trình viên / IT (phát triển trong VS Code)

### Công nghệ

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, `tsx` (chạy TypeScript trực tiếp), `child_process` gọi `yt-dlp` và `ffmpeg`.
- **AI (tùy chọn)**: `@google/genai` cho nút "Gợi ý bằng AI".

### Cấu trúc thư mục

```text
├── server.ts               # Máy chủ Express: hàng đợi, gọi yt-dlp, stream file
├── src/
│   ├── main.tsx            # Điểm khởi tạo React
│   ├── App.tsx             # Giao diện chính, polling trạng thái hàng đợi
│   ├── components/         # Header, LinkInput, QueueItemCard, SettingsModal, HealthModal...
│   └── utils/
│       ├── youtube.ts      # Phân tích link, chuẩn hóa tên file
│       └── youtube.test.ts # Kiểm thử (node:test)
├── bin/                    # (tùy chọn) đặt yt-dlp.exe tại đây nếu không dùng PATH
├── setup.bat / start.bat   # Cài đặt / khởi động nhanh trên Windows
├── .env.example            # Mẫu biến môi trường
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Cài đặt và chạy

```bash
git clone https://github.com/<tai-khoan>/audio-grabber.git
cd audio-grabber
cp .env.example .env        # Windows CMD: copy .env.example .env
npm install
npm run dev
```

Nếu `npm install` báo lỗi xung đột phụ thuộc (`ERESOLVE`), chạy lại với `npm install --legacy-peer-deps`.

Ở chế độ dev, Express tích hợp Vite middleware (có HMR). Khi chạy thành công, terminal in ra:

```text
Audio Grabber server running on:
  - Local:   http://localhost:3000
  - Wi-Fi:   http://192.168.1.15:3000
```

### Các lệnh trong `package.json`

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy máy chủ ở chế độ phát triển (Vite middleware) |
| `npm run build` | Build giao diện vào thư mục `dist/` |
| `npm run start` | Chạy máy chủ; khi đặt `NODE_ENV=production` sẽ phục vụ file tĩnh trong `dist/` |
| `npm test` | Chạy kiểm thử trong `src/utils` |
| `npm run lint` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `npm run clean` | Xóa thư mục `dist/` |

Chạy bản production trên macOS/Linux:

```bash
npm run build
NODE_ENV=production npm run start
```

---

## Đặt tên file & gợi ý bằng AI

Mẫu tên file: `Tên Tác Giả - Tên Bài Hát (Thể loại).đuôi`

- Bản gốc **không** có phần trong ngoặc: `Tên Tác Giả - Tên Bài Hát.m4a`
- Có thể loại: `Tên Tác Giả - Tên Bài Hát (Drill).m4a`

Khi bài ở trạng thái **Sẵn sàng**, bạn thấy 3 ô **Tác giả**, **Tên bài**, **Thể loại** đã được điền gợi ý và dòng xem trước tên file. Hãy kiểm tra và sửa nếu cần trước khi bấm **Tải về**. Trong **Cài đặt** có thể chọn thể loại mặc định, bật/tắt tự đoán thể loại và bật/tắt viết hoa chữ cái đầu mỗi từ. Gợi ý tự động dựa trên tiêu đề video và tên kênh nên **không phải lúc nào cũng đúng**; tiêu đề YouTube không có chuẩn chung.

### Nút "✨ Gợi ý bằng AI" (tùy chọn)

Nút này nhờ Gemini tách tên tác giả, tên bài và thể loại từ tiêu đề lộn xộn. Nút chỉ chạy khi bạn bấm.

1. Tạo khóa API tại Google AI Studio.
2. Thêm vào file `.env`: `GEMINI_API_KEY="khoá-của-bạn"` rồi khởi động lại ứng dụng.
3. Mô hình mặc định là `gemini-3.8-flash`, có thể đổi bằng biến `GEMINI_MODEL`.

Khi bấm nút, **chỉ tiêu đề, tên kênh và đoạn đầu mô tả video** được gửi tới Google. Khóa API nằm ở máy chủ, không gửi ra trình duyệt. Mỗi lần gọi dùng rất ít token nên chi phí nhỏ, nhưng bạn tự chịu hạn mức và chi phí của khóa mình. Không có khóa thì ứng dụng vẫn hoạt động bình thường với gợi ý theo luật.

---

## Mở từ iPhone / Android qua Wi-Fi

1. Đảm bảo điện thoại và máy tính cùng một mạng Wi-Fi (hoặc máy tính phát hotspot cho điện thoại).
2. Lấy địa chỉ IP máy tính:
   - Xem dòng `Wi-Fi: http://<IP>:3000` mà ứng dụng in ra khi khởi động.
   - Hoặc: **Windows** gõ `ipconfig` và tìm `IPv4 Address`; **macOS** gõ `ipconfig getifaddr en0`.
3. Mở **Safari** (iPhone) hoặc **Chrome** (Android) và nhập `http://<IP-máy-tính>:3000`.
4. Nếu điện thoại không kết nối được:
   - **Windows**: Windows Security → Firewall & network protection → Allow an app through firewall → cho phép **Node.js JavaScript Runtime** ở mạng **Private**.
   - **macOS**: System Settings → Network → Firewall → cho phép Node.js nhận kết nối đến.

> ⚠️ **Bảo mật:** mặc định máy chủ lắng nghe trên mọi địa chỉ mạng (`HOST=0.0.0.0`), nên bất kỳ ai cùng Wi-Fi đều dùng được ứng dụng, kể cả tài khoản YouTube (nếu bạn cấu hình cookie) và khóa Gemini của bạn. Đừng dùng ở Wi-Fi công cộng. Nếu chỉ dùng trên chính máy này, đặt `HOST=127.0.0.1` trong `.env`.

---

## Cấu hình Cookie chống chặn bot YouTube

Khi chạy trên máy cá nhân ở nhà, YouTube thường không chặn. Nếu bạn gặp lỗi *"Sign in to confirm you're not a bot"* hoặc video giới hạn độ tuổi, cho yt-dlp đọc cookie từ trình duyệt qua file `.env`:

```env
# Trích cookie trực tiếp từ trình duyệt đã đăng nhập YouTube
# Hỗ trợ: chrome, firefox, edge, brave, opera, vivaldi, safari
YTDLP_COOKIES_FROM_BROWSER="firefox"

# Hoặc dùng file cookies.txt xuất bằng tiện ích mở rộng
# YTDLP_COOKIES_FILE="./cookies.txt"

# Proxy (nếu cần)
# YTDLP_PROXY="http://127.0.0.1:1080"
```

Lưu ý:

- Nên dùng **tài khoản phụ**; tải hàng loạt bằng tài khoản chính có thể khiến tài khoản bị hạn chế.
- Đóng hẳn trình duyệt trước khi chạy. Với trình duyệt nền Chromium (Chrome, Edge, Brave) trên Windows, yt-dlp đôi khi không đọc được cookie; khi đó hãy thử Firefox hoặc xuất `cookies.txt`.
- **Không bao giờ đưa `.env` hoặc `cookies.txt` lên GitHub** (đã nằm trong `.gitignore`).
- Khởi động lại ứng dụng sau khi sửa `.env`.

---

## Cách lưu file .m4a vào iPhone

1. Dán link YouTube và bấm **Thêm vào hàng đợi**.
2. Khi trạng thái là **Sẵn sàng**, kiểm tra tên file rồi bấm nút xanh **Tải về .m4a**.
3. Safari hỏi có muốn tải file không → bấm **Tải về**.
4. Mở ứng dụng **Tệp (Files)** → **Tải về (Downloads)** để nghe hoặc chia sẻ sang ứng dụng khác.

Ứng dụng Nhạc của iPhone thường không nhập trực tiếp file từ Tệp; muốn đưa vào thư viện Nhạc cần đồng bộ qua máy Mac/Finder, hoặc nghe bằng Tệp / ứng dụng như VLC.

---

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng chạy ứng dụng |
| `HOST` | `0.0.0.0` | Địa chỉ lắng nghe; `127.0.0.1` để chỉ máy này truy cập được |
| `YTDLP_COOKIES_FROM_BROWSER` | (trống) | Đọc cookie từ trình duyệt |
| `YTDLP_COOKIES_FILE` | (trống) | Đường dẫn file `cookies.txt` |
| `YTDLP_PROXY` | (trống) | Proxy HTTP/HTTPS/SOCKS5 |
| `GEMINI_API_KEY` | (trống) | Khóa Gemini cho nút "Gợi ý bằng AI" (tùy chọn) |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Mô hình dùng cho nút "Gợi ý bằng AI" |

---

## Khắc phục sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| PowerShell báo *"running scripts is disabled on this system"* | Dùng `setup.bat`/`start.bat` (chạy bằng CMD), hoặc gõ `npm.cmd` thay `npm`, hoặc chạy `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| *"Sign in to confirm you're not a bot"* | Chạy ứng dụng trên máy cá nhân tại nhà; nếu vẫn lỗi, cấu hình cookie như trên |
| yt-dlp báo lỗi lạ hoặc không tải được | YouTube thay đổi thường xuyên; cập nhật yt-dlp: `winget upgrade yt-dlp.yt-dlp` hoặc `yt-dlp -U` |
| Nút "Hệ thống" báo không tìm thấy yt-dlp/FFmpeg | Cài lại, **mở lại cửa sổ dòng lệnh**, kiểm tra bằng `yt-dlp --version` và `ffmpeg -version` |
| Cổng 3000 đang bị chiếm | Đặt `PORT=3001` trong `.env` rồi chạy lại |
| Điện thoại không vào được | Cùng Wi-Fi chưa? Đã cho phép Node.js qua tường lửa (mạng Private) chưa? Xem mục Wi-Fi |
| Mở `start.bat` mà không thấy giao diện | Chưa chạy `setup.bat` hoặc thiếu thư mục `dist`; chạy `setup.bat` trước |

---

## Giấy phép & miễn trừ trách nhiệm

- Mã nguồn phát hành theo giấy phép **MIT** (xem file `LICENSE`).
- Dự án phục vụ mục đích học tập, nghiên cứu và sử dụng cá nhân phi thương mại.
- Điều khoản dịch vụ của YouTube hạn chế việc tải nội dung ngoài các tính năng mà YouTube cung cấp. Người dùng **tự chịu trách nhiệm** tuân thủ điều khoản của YouTube và pháp luật về sở hữu trí tuệ; chỉ nên dùng cho nội dung bạn có quyền sử dụng (nhạc do chính bạn tạo, nội dung Creative Commons, v.v.).
- Tác giả không sở hữu và không chịu trách nhiệm về nội dung âm thanh/video mà người dùng trích xuất bằng công cụ này.
- Phần mềm bên thứ ba **không** đi kèm trong kho mã và có giấy phép riêng: [yt-dlp](https://github.com/yt-dlp/yt-dlp), [FFmpeg](https://ffmpeg.org/), [Node.js](https://nodejs.org/).
