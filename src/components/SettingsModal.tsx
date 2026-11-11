import React, { useState, useEffect } from 'react';
import { X, Check, Music2, Film, Info, Type, Tag, Brain, Trash2 } from 'lucide-react';
import { DownloadFormat } from '../utils/youtube';
import { GENRE_OPTIONS, getLearnedData, clearLearnedData } from '../utils/naming';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: DownloadFormat;
  onChangeFormat: (f: DownloadFormat) => void;
  defaultGenre: string;
  onChangeDefaultGenre: (g: string) => void;
  autoDetectGenre: boolean;
  onToggleAutoDetectGenre: (val: boolean) => void;
  autoCapitalize: boolean;
  onToggleAutoCapitalize: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  format,
  onChangeFormat,
  defaultGenre,
  onChangeDefaultGenre,
  autoDetectGenre,
  onToggleAutoDetectGenre,
  autoCapitalize,
  onToggleAutoCapitalize,
}) => {
  const [learnedCount, setLearnedCount] = useState({ authors: 0, channels: 0 });
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const data = getLearnedData();
      setLearnedCount({
        authors: data.knownAuthors.length,
        channels: Object.keys(data.channelOrder).length,
      });
      setClearMessage(null);
    }
  }, [isOpen]);

  const handleClearLearnedData = () => {
    clearLearnedData();
    setLearnedCount({ authors: 0, channels: 0 });
    setClearMessage('Đã xóa toàn bộ dữ liệu tác giả và kênh đã ghi nhớ!');
    setTimeout(() => {
      setClearMessage(null);
    }, 3000);
  };

  if (!isOpen) return null;

  const options: {
    id: DownloadFormat;
    title: string;
    desc: string;
    tag: string;
    icon: typeof Music2;
  }[] = [
    {
      id: 'audio_m4a',
      title: 'Âm thanh .m4a (AAC gốc 128k)',
      desc: 'Ưu tiên luồng AAC nguyên gốc, không mã hóa lại. Rất nhẹ và lưu ngay vào Files trên iPhone.',
      tag: 'Khuyến nghị',
      icon: Music2,
    },
    {
      id: 'video_720p',
      title: 'Video MP4 (720p HD)',
      desc: 'Tải video kèm tiếng ở chuẩn độ phân giải 720p, dung lượng cân đối cho điện thoại.',
      tag: 'HD',
      icon: Film,
    },
    {
      id: 'video_1080p',
      title: 'Video MP4 (1080p Full HD)',
      desc: 'Tải video độ phân giải cao 1080p sắc nét, thời gian ghép kênh lâu hơn một chút.',
      tag: 'Full HD',
      icon: Film,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Cài Đặt Hệ Thống & Đặt Tên
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Format */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Định dạng file xuất ra
          </h3>
          <div className="space-y-2">
            {options.map((opt) => {
              const isSelected = format === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeFormat(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {opt.title}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {opt.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>

                  <div className="shrink-0 mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: File Naming Options */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quy chuẩn đặt tên file theo mẫu
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Mẫu: <code className="text-indigo-600 dark:text-indigo-400">Tác Giả - Tên Bài (Thể Loại).đuôi</code>. Bản gốc không có phần ngoặc.
          </p>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Default Genre */}
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="default-genre-select" className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>Thể loại mặc định:</span>
              </label>
              <select
                id="default-genre-select"
                value={defaultGenre}
                onChange={(e) => onChangeDefaultGenre(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Detect Genre Toggle */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  Tự động đoán thể loại từ tiêu đề
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhận diện Drill, Remix, Lofi, Acoustic, Cover, Live, Slowed...
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetectGenre}
                  onChange={(e) => onToggleAutoDetectGenre(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700"></div>
              </label>
            </div>

            {/* Auto Capitalize Toggle */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Viết hoa chữ cái đầu mỗi từ</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chuẩn hóa tiếng Việt, giữ nguyên từ viết tắt (DJ, MV, OST, EDM, VIP...)
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCapitalize}
                  onChange={(e) => onToggleAutoCapitalize(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Learned Data & Rules */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dữ liệu nhận diện đã học</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {learnedCount.authors} tác giả &bull; {learnedCount.channels} quy tắc kênh
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống tự động học tên tác giả khi bạn bấm tải hoặc đổi chỗ, giúp phân tích chính xác các bài hát sau này của cùng kênh.
          </p>

          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              {clearMessage ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {clearMessage}
                </span>
              ) : (
                <span>Xóa lịch sử để reset quy luật nhận diện về mặc định.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearLearnedData}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shrink-0"
              title="Xóa dữ liệu đã học"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa dữ liệu đã học</span>
            </button>
          </div>
        </div>

        {/* Section 4: System Limits Box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quy định vận hành hệ thống:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed">
            <li>Thời lượng video: Tối đa 30 phút.</li>
            <li>Hàng đợi: Tối đa 20 mục cùng lúc (chạy 2 luồng song song).</li>
            <li>Lưu trữ tạm: File sẵn sàng tải về và tự động xóa sau 15 phút.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};
