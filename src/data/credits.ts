export interface CreditItem {
  id: string;
  role: string;
  name: string;
  avatarUrl?: string;
  iconName?: 'sparkles' | 'bot' | 'download' | 'film' | 'layers' | 'code';
  url?: string;
  description?: string;
}

export const CREDITS_DATA: CreditItem[] = [
  {
    id: 'snor2271',
    role: 'Chủ dự án, điều phối & kiểm thử',
    name: 'Snor2271',
    avatarUrl: '/assets/aistudio/image_00d9c2c2.png',
    description: 'Ý tưởng, thiết kế tính năng và tối ưu trải nghiệm người dùng',
  },
  {
    id: 'gemini',
    role: 'Viết mã nguồn',
    name: 'Gemini 3.8 Flash trong Google AI Studio',
    iconName: 'sparkles',
    description: 'Lập trình toàn bộ hệ thống full-stack, logic xử lý và thuật toán đặt tên',
  },
  {
    id: 'claude',
    role: 'Soạn prompt & rà soát',
    name: 'Claude (Anthropic)',
    iconName: 'bot',
    description: 'Xây dựng kịch bản hướng dẫn, chuẩn hóa yêu cầu và tối ưu thuật toán',
  },
  {
    id: 'ytdlp',
    role: 'Lấy & tải luồng âm thanh',
    name: 'yt-dlp & cộng đồng đóng góp',
    iconName: 'download',
    url: 'https://github.com/yt-dlp/yt-dlp',
    description: 'Công cụ mã nguồn mở hàng đầu thế giới về trích xuất đa phương tiện',
  },
  {
    id: 'ffmpeg',
    role: 'Xử lý âm thanh & video',
    name: 'FFmpeg',
    iconName: 'film',
    url: 'https://ffmpeg.org/',
    description: 'Thư viện mã nguồn mở chuyên xử lý, chuyển mã và trích xuất luồng media',
  },
  {
    id: 'tech-stack',
    role: 'Nền tảng công nghệ',
    name: 'Node.js, Express, React, Vite, Tailwind CSS, Lucide',
    iconName: 'layers',
    description: 'Hạ tầng ứng dụng hiện đại, hiệu năng cao và gọn nhẹ',
  },
];
