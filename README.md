# Audio Grabber 🎵

> Ứng dụng web full-stack (React + Node.js/Express) giúp trích xuất và tải âm thanh `.m4a` (AAC) từ video YouTube, tối ưu cho Safari trên iPhone/iPad và trình duyệt máy tính. Hỗ trợ hàng đợi nhiều bài, tự gợi ý tên file theo mẫu `Tên Tác Giả - Tên Bài Hát (Thể loại).m4a`.

**Xây dựng bằng AI:** dự án được tạo trên **Google AI Studio** (chế độ Build) bằng mô hình **Gemini 3.8 Flash**. Các prompt được soạn với sự hỗ trợ của trợ lý AI Claude (Anthropic), sau đó chạy và kiểm thử trên máy cá nhân. Dự án không liên kết với, không được tài trợ hay chứng thực bởi Google hoặc YouTube.

---

## Mục lục

- [Tính năng nổi bật](#tính-năng-nổi-bật)
- [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
- [Hướng 1: Người dùng phổ thông (chạy bằng file .bat)](#hướng-1-người-dùng-phổ-thông-chạy-bằng-file-bat)
- [Hướng 2: Lập trình viên / IT (phát triển trong VS Code)](#hướng-2-lập-trình-viên--it-phát-triển-trong-vs-code)
- [Đặt tên file theo mẫu](#đặt-tên-file-theo-mẫu)
- [Dùng Gemini để đổi tên](#dùng-gemini-để-đổi-tên)
- [Thêm khóa Gemini API](#thêm-khóa-gemini-api)
- [Mở từ iPhone / Android qua Wi-Fi](#mở-từ-iphone--android-qua-wi-fi)
- [Cấu hình Cookie chống chặn bot YouTube](#cấu-hình-cookie-chống-chặn-bot-youtube)
- [Cách lưu file .m4a vào iPhone](#cách-lưu-file-m4a-vào-iphone)
- [Biến môi trường](#biến-môi-trường)
- [Khắc phục sự cố](#khắc-phục-sự-cố)
- [So sánh với EzConv](#so-sánh-với-ezconv)
- [Bảng vinh danh](#bảng-vinh-danh)
- [Giấy phép & miễn trừ trách nhiệm](#giấy-phép--miễn-trừ-trách-nhiệm)

---

## Tính năng nổi bật

- **Tối ưu Safari iPhone**: nút "Tải về" là link trực tiếp (`Content-Disposition: attachment`), không nạp Blob vào RAM nên không bị tràn bộ nhớ hay văng tab trên iOS.
- **Giữ nguyên chất lượng gốc**: ưu tiên luồng `.m4a` (AAC) có sẵn của YouTube, không mã hóa lại. Nếu video không có m4a, FFmpeg tự chuyển sang AAC 128k.
- **Hàng đợi thông minh**: chạy tối đa 2 tác vụ song song, hàng đợi tối đa 20 mục, một bài lỗi không làm dừng các bài khác.
- **Nhận diện nhiều dạng link**: `youtube.com/watch?v=...`, `youtu.be/...`, `m.youtube.com`, `music.youtube.com`, `youtube.com/shorts/...`; tự bỏ tham số danh sách phát `list=...`.
- **Đặt tên file theo mẫu ngay từ đầu**: tự gợi ý Tác giả / Tên bài / Thể loại, cho phép sửa trước khi tải, có xem trước tên file.
- **Gemini đổi tên hàng loạt (tùy chọn)**: một nút xử lý cả danh sách chờ trong một lần; từng bài vẫn có tùy chọn riêng ẩn trong menu mũi tên xuống.
- **Giao diện Sáng / Tối / Theo hệ thống**: chuyển mượt, nhớ lựa chọn của bạn.
- **Câu hỏi thường gặp và bảng vinh danh** ngay trong ứng dụng.
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
5. *(Tùy chọn)* Muốn dùng Gemini đổi tên, nhấp đúp **`them-api-key.bat`** và làm theo menu. Xem mục [Thêm khóa Gemini API](#thêm-khóa-gemini-api).

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
│   ├── components/         # Header, LinkInput, QueueItemCard, SettingsModal, HealthModal, ThemeToggle, FAQ, Credits...
│   ├── data/
│   │   ├── faq.ts          # Nội dung "Câu hỏi thường gặp" (sửa tại đây)
│   │   └── credits.ts      # Nội dung "Bảng vinh danh" (sửa tại đây)
│   └── utils/
│       ├── youtube.ts      # Phân tích link, chuẩn hóa tên file
│       └── youtube.test.ts # Kiểm thử (node:test)
├── bin/                    # (tùy chọn) đặt yt-dlp.exe tại đây nếu không dùng PATH
├── setup.bat / start.bat   # Cài đặt / khởi động nhanh trên Windows
├── them-api-key.bat        # Thêm, kiểm tra, xóa khóa Gemini trong .env (Windows)
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

## Đặt tên file theo mẫu

Mẫu tên file: `Tên Tác Giả - Tên Bài Hát (Thể loại).đuôi`

- Bản gốc **không** có phần trong ngoặc: `Tên Tác Giả - Tên Bài Hát.m4a`
- Có thể loại: `Tên Tác Giả - Tên Bài Hát (Drill).m4a`

Khi bài ở trạng thái **Sẵn sàng**, bạn thấy 3 ô **Tác giả**, **Tên bài**, **Thể loại** đã được điền gợi ý, nút ⇄ để đổi chỗ Tác giả và Tên bài, và dòng xem trước tên file. Hãy kiểm tra và sửa nếu cần trước khi bấm **Tải về**. Trong **Cài đặt** có thể chọn thể loại mặc định, bật/tắt tự đoán thể loại và bật/tắt viết hoa chữ cái đầu mỗi từ.

Gợi ý tự động dựa trên tiêu đề video và tên kênh nên **không phải lúc nào cũng đúng**; tiêu đề YouTube không có chuẩn chung. Khi gặp tiêu đề lộn xộn, hãy dùng Gemini (mục dưới).

---

## Dùng Gemini để đổi tên

Tính năng này là **tùy chọn**. Không có khóa Gemini, ứng dụng vẫn tải nhạc và đặt tên theo luật bình thường.

- **Cả danh sách:** bấm nút **✨ Đổi tên cả danh sách bằng Gemini** bên dưới hàng đợi. Ứng dụng gửi **một yêu cầu duy nhất** cho tất cả bài đang ở trạng thái Sẵn sàng (tối đa 20), rồi áp dụng kết quả theo cấu hình ở Cài đặt (thể loại mặc định, viết hoa chuẩn). Mặc định các bài bạn đã tự sửa **không bị ghi đè**, và có nút **Hoàn tác** nếu kết quả chưa ưng ý.
- **Từng bài:** ở mỗi mục, bấm mũi tên xuống (⌄) để mở **Tùy chọn nâng cao**, rồi chọn **Gợi ý bằng AI cho bài này**.
- Nếu chưa có khóa, nút sẽ mờ và cho biết cách thêm khóa.

**Quyền riêng tư:** chỉ **tiêu đề, tên kênh và đoạn đầu phần mô tả** của video được gửi tới Google (Gemini API). Khóa API được giữ ở máy chủ cục bộ của bạn, không gửi ra trình duyệt. Mô hình mặc định là `gemini-3.8-flash`, có thể đổi bằng biến `GEMINI_MODEL`.

---

## Thêm khóa Gemini API

### Bước 1: Lấy khóa

1. Mở <https://aistudio.google.com/apikey> (hoặc vào aistudio.google.com rồi chọn **Get API key**) và đăng nhập tài khoản Google.
2. Bấm **Create API key**, chọn hoặc tạo dự án Google Cloud nếu được hỏi, rồi sao chép khóa (thường bắt đầu bằng `AIza`).
3. Mỗi khóa gắn với một dự án Google Cloud; hạn mức và chi phí phụ thuộc tài khoản/dự án đó. Nếu Google gợi ý giới hạn khóa chỉ dùng cho Gemini API, nên làm theo.

### Bước 2: Thêm khóa vào ứng dụng

**Cách 1 (Windows, khuyên dùng):** nhấp đúp **`them-api-key.bat`**.

| Lựa chọn | Tác dụng |
|---|---|
| `[1]` Thêm hoặc đổi khóa | Dán khóa, file tự ghi vào `.env` rồi gọi thử Google để xác nhận khóa hợp lệ |
| `[2]` Kiểm tra khóa đang lưu | Gọi thử Google với khóa trong `.env` |
| `[3]` Xóa khóa | Xóa khóa khỏi `.env` |
| `[4]` Mở trang tạo khóa | Mở trang tạo khóa của Google AI Studio |

> Khi bạn dán khóa vào cửa sổ, khóa hiển thị trên màn hình. Đừng chia sẻ màn hình lúc đó. Màn hình trạng thái chỉ hiện 4 ký tự cuối của khóa.

**Cách 2 (mọi hệ điều hành, gồm macOS):** mở file `.env` và đặt:

```env
GEMINI_API_KEY="khóa-của-bạn"
```

### Bước 3: Khởi động lại và kiểm tra

Tắt rồi mở lại `start.bat` (hoặc `npm run dev`). Bấm nút **Hệ thống** để xem Gemini đã được cấu hình chưa; nút **✨ Đổi tên cả danh sách bằng Gemini** sẽ sáng lên khi khóa hợp lệ.

### Lưu ý an toàn

- **Không** đưa `.env` lên GitHub (đã nằm trong `.gitignore`). Nếu lỡ lộ khóa, hãy thu hồi nó trên trang API keys của AI Studio và tạo khóa mới.
- Đừng chia sẻ khóa cho người khác. Khi `HOST=0.0.0.0` (mặc định), người cùng Wi-Fi vào được ứng dụng có thể dùng hạn mức khóa của bạn qua nút AI. Nếu chỉ dùng trên chính máy này, đặt `HOST=127.0.0.1` trong `.env`.
- Mỗi lần gọi dùng ít token nên chi phí nhỏ, nhưng bạn tự chịu hạn mức và chi phí của khóa mình; hãy theo dõi trên AI Studio.

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
| `GEMINI_API_KEY` | (trống) | Khóa Gemini cho tính năng đổi tên bằng AI (tùy chọn); dùng `them-api-key.bat` để thêm |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Mô hình dùng cho tính năng đổi tên bằng AI |

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
| Nút Gemini bị mờ | Chưa có khóa, hoặc chưa khởi động lại sau khi thêm khóa. Chạy `them-api-key.bat`, chọn `[2]` để kiểm tra, rồi mở lại `start.bat` |
| Google từ chối khóa (lỗi 400/403) | Khóa sai, bị thu hồi hoặc bị giới hạn. Tạo khóa mới ở AI Studio rồi dùng `them-api-key.bat` mục `[1]` |
| Gemini báo hết hạn mức (lỗi 429) hoặc lỗi mạng | Chờ một lúc rồi thử lại, hoặc kiểm tra hạn mức trên AI Studio. Ứng dụng vẫn đặt tên theo luật bình thường |

---

## So sánh với EzConv

[EzConv](https://ezconv.org/) là một dịch vụ web miễn phí để chuyển video YouTube sang MP3. Bảng dưới giúp bạn chọn công cụ phù hợp. Đây là hai cách làm khác nhau, không phải bên nào "tốt hơn" ở mọi mặt.

| Tiêu chí | Audio Grabber | EzConv |
|---|---|---|
| Cách dùng | Tải về và chạy trên máy tính của bạn như một máy chủ cục bộ (cần Node.js, yt-dlp, FFmpeg) | Mở trang web là dùng, không cần cài đặt hay đăng ký; chạy được trên điện thoại, máy tính bảng và máy tính |
| Nơi xử lý | Trên máy bạn. Chỉ YouTube (và Google nếu bạn bấm Gemini) nhận yêu cầu | Trên máy chủ đám mây của dịch vụ |
| Định dạng đầu ra | `.m4a` (AAC gốc), video MP4 720p/1080p | MP3 (và video MP4) |
| Chất lượng âm thanh | Giữ nguyên luồng AAC gốc của YouTube (khoảng 128 kbps), không mã hóa lại; **không** chọn được bitrate | Chọn bitrate MP3, trang chủ nêu tới 320 kbps |
| Cắt đoạn (Trim) | Không | Có |
| Nhiều bài cùng lúc | Có: dán nhiều link, hàng đợi tối đa 20 mục, chạy song song 2 tác vụ, bài lỗi không chặn bài khác, tải lại được trong vòng 15 phút kể từ khi sẵn sàng | Trang chủ không nhắc tới |
| Đặt tên file | Theo mẫu `Tác giả - Tên bài (Thể loại)`, sửa ngay trước khi tải, có gợi ý theo luật và Gemini (tùy chọn) | Trang chủ không nhắc tới |
| Quảng cáo / đăng ký | Không có (chạy trên máy bạn) | Tự giới thiệu là không quảng cáo, không cần đăng ký |
| Chi phí | Miễn phí. Gemini là tùy chọn và dùng khóa của chính bạn | Miễn phí, có kêu gọi ủng hộ tự nguyện |
| Bảo trì | Bạn tự cập nhật yt-dlp khi YouTube thay đổi | Nhà cung cấp lo |

**Ưu điểm của Audio Grabber**

- Đa nhiệm: hàng đợi nhiều bài, chạy song song, bài lỗi không làm dừng cả danh sách.
- Đặt và chỉnh tên theo yêu cầu **ngay từ đầu**, không phải đổi tên từng file sau khi tải.
- Chạy trên máy bạn, không phụ thuộc vào một website có thể đổi tên miền hoặc ngừng hoạt động.
- Giữ nguyên luồng âm thanh gốc, không mã hóa lại nên không mất thêm chất lượng.

**Nhược điểm hiện tại**

- Phải tải về và chạy trên máy tính (làm máy chủ cục bộ); **không** dùng như một trang web mở là chạy.
- Chỉ xuất `.m4a` (AAC); chưa có MP3 hay các định dạng khác.
- Chưa chọn được chất lượng như 192 hoặc 320 kbps.
- Chưa có cắt đoạn và chưa hỗ trợ playlist (link có `list=` chỉ lấy bài đang mở).
- Cần cài đặt ban đầu và tự cập nhật yt-dlp khi YouTube thay đổi.

**Lưu ý về chất lượng:** chất lượng âm thanh luôn bị giới hạn bởi nguồn trên YouTube. Chuyển một nguồn khoảng 128 kbps sang MP3 320 kbps làm file lớn hơn nhưng không làm âm thanh tốt hơn nguồn.

> Thông tin về EzConv dựa trên trang chủ và các bài giới thiệu công khai tại thời điểm 11/2026 và có thể thay đổi; hãy tự kiểm tra. EzConv có nhiều tên miền gần giống nhau, hãy xem kỹ địa chỉ trước khi dùng. Dự án này không liên quan tới EzConv.

---

## Bảng vinh danh

Cảm ơn tất cả những người và dự án đã góp phần tạo ra Audio Grabber:

| Vai trò | Ai |
|---|---|
| Chủ dự án, điều phối và kiểm thử | Snor2271 |
| Viết mã nguồn | Gemini 3.8 Flash trong Google AI Studio |
| Soạn prompt và rà soát | Claude (Anthropic) |
| Lấy và tải luồng âm thanh | [yt-dlp](https://github.com/yt-dlp/yt-dlp) và cộng đồng đóng góp |
| Xử lý âm thanh / video | [FFmpeg](https://ffmpeg.org/) |
| Nền tảng | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide](https://lucide.dev/) |

Bảng vinh danh trong ứng dụng đọc từ `src/data/credits.ts`, phần Câu hỏi thường gặp đọc từ `src/data/faq.ts`. Sửa hai file này để đổi tên, thêm người đóng góp hoặc cập nhật nội dung.

---

## Giấy phép & miễn trừ trách nhiệm

- Mã nguồn phát hành theo giấy phép **MIT** (xem file `LICENSE`).
- Dự án phục vụ mục đích học tập, nghiên cứu và sử dụng cá nhân phi thương mại.
- Điều khoản dịch vụ của YouTube hạn chế việc tải nội dung ngoài các tính năng mà YouTube cung cấp. Người dùng **tự chịu trách nhiệm** tuân thủ điều khoản của YouTube và pháp luật về sở hữu trí tuệ; chỉ nên dùng cho nội dung bạn có quyền sử dụng (nhạc do chính bạn tạo, nội dung Creative Commons, v.v.).
- Tác giả không sở hữu và không chịu trách nhiệm về nội dung âm thanh/video mà người dùng trích xuất bằng công cụ này.
- Phần mềm bên thứ ba **không** đi kèm trong kho mã và có giấy phép riêng: [yt-dlp](https://github.com/yt-dlp/yt-dlp), [FFmpeg](https://ffmpeg.org/), [Node.js](https://nodejs.org/).
