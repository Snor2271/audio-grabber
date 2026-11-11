export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    q: 'Audio Grabber là gì, có miễn phí không?',
    a: 'Audio Grabber là ứng dụng chạy trực tiếp trên máy tính của bạn để trích xuất và tải âm thanh định dạng .m4a chất lượng cao từ YouTube. Ứng dụng hoàn toàn miễn phí. Tính năng gợi ý bằng Gemini AI là tùy chọn thêm và sử dụng khóa API riêng của bạn.',
  },
  {
    id: 'faq-2',
    q: 'Vì sao phải chạy trên máy tính, không dùng trực tiếp trên web?',
    a: 'Ứng dụng cần công cụ yt-dlp và FFmpeg chạy trực tiếp trên máy của bạn để xử lý file. Các dịch vụ web hay máy chủ đám mây công cộng rất hay bị YouTube chặn địa chỉ IP, trong khi chạy trên máy cá nhân tại nhà ổn định và mượt mà hơn nhiều. Điện thoại iPhone/Android cùng mạng Wi-Fi có thể truy cập và tải file tiện lợi.',
  },
  {
    id: 'faq-3',
    q: 'Tải file về iPhone/iPad như thế nào?',
    a: 'Trên máy tính khi khởi động ứng dụng sẽ hiển thị địa chỉ Wi-Fi (ví dụ http://192.168.x.x:3000). Bạn chỉ cần mở Safari trên iPhone/iPad, nhập địa chỉ đó và bấm nút "Tải về". File âm thanh sẽ được lưu an toàn trực tiếp vào ứng dụng Tệp (Files) → mục Tải về (Downloads).',
  },
  {
    id: 'faq-4',
    q: 'Vì sao chỉ có định dạng .m4a, không có MP3 hay 320 kbps?',
    a: 'YouTube lưu trữ âm thanh nguồn ở chuẩn AAC gốc (khoảng 128 kbps). Việc nén lại sang MP3 sẽ làm suy hao chất lượng gốc và tốn tài nguyên chuyển đổi, đồng thời nâng bitrate lên 320 kbps cũng không thể làm âm thanh hay hơn file nguồn. Định dạng MP3 hiện chưa được hỗ trợ.',
  },
  {
    id: 'faq-5',
    q: 'Tên file được đặt theo quy tắc nào?',
    a: 'Tên file được tự động đặt theo mẫu "Tác giả - Tên bài hát (Thể loại).m4a" (với bản gốc thông thường sẽ không có phần đóng mở ngoặc thể loại). Bạn có thể dễ dàng kiểm tra, đổi chỗ hoặc chỉnh sửa từng ô trước khi tải. Thuật toán gợi ý tự động đôi khi có thể cần bạn chỉnh lại một chút.',
  },
  {
    id: 'faq-6',
    q: 'Nút Gemini AI dùng khi nào, cần điều kiện gì và gửi dữ liệu gì?',
    a: 'Tính năng Gemini AI hữu ích khi tiêu đề video YouTube quá rối rắm hoặc nhiều thông tin nhiễu. Để sử dụng, bạn cần cấu hình khóa GEMINI_API_KEY trong file .env. Hệ thống chỉ gửi tiêu đề, tên kênh và đoạn đầu mô tả khi bạn chủ động bấm nút. Nếu không có khóa API, bạn vẫn sử dụng ứng dụng hoàn toàn bình thường.',
  },
  {
    id: 'faq-7',
    q: 'Báo lỗi "Sign in to confirm you\'re not a bot" thì xử lý thế nào?',
    a: 'Lỗi này xuất hiện khi YouTube nghi ngờ lưu lượng truy cập là bot tự động. Hãy đảm bảo bạn đang chạy ứng dụng trên máy tính cá nhân tại nhà, hoặc cấu hình thêm cookie từ trình duyệt vào file .env (khuyến khích dùng tài khoản Google phụ để bảo đảm an toàn).',
  },
  {
    id: 'faq-8',
    q: 'Ứng dụng có hỗ trợ tải toàn bộ danh sách phát (playlist) không?',
    a: 'Hiện tại phiên bản này chưa hỗ trợ tải toàn bộ playlist. Nếu bạn dán đường link có chứa tham số list=, hệ thống sẽ tự động bỏ qua danh sách phát và chỉ tải đúng bài hát bạn đang mở.',
  },
  {
    id: 'faq-9',
    q: 'File âm thanh đã tải về lưu trên máy chủ trong bao lâu?',
    a: 'Các file âm thanh tạm thời trên máy chủ sẽ tự động được xóa sau 15 phút kể từ lúc sẵn sàng để giải phóng bộ nhớ ổ cứng. Bạn hãy bấm tải về thiết bị ngay khi hệ thống thông báo "Sẵn sàng".',
  },
  {
    id: 'faq-10',
    q: 'Sử dụng Audio Grabber có hợp pháp không?',
    a: 'Tính hợp pháp phụ thuộc vào nội dung bạn tải và quy định pháp luật sở tại. YouTube có điều khoản giới hạn việc tải nội dung xuống. Bạn chỉ nên tải các video hoặc âm thanh mà bạn có quyền sở hữu hoặc được sự cho phép hợp pháp. Người dùng tự chịu trách nhiệm về mục đích sử dụng.',
  },
];
