import React from 'react';
import { X, Check, Music2, Film, Info } from 'lucide-react';
import { DownloadFormat } from '../utils/youtube';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: DownloadFormat;
  onChangeFormat: (f: DownloadFormat) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  format,
  onChangeFormat,
}) => {
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Cài Đặt Định Dạng Tải Về
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

        {/* Options list */}
        <div className="space-y-2.5">
          {options.map((opt) => {
            const isSelected = format === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeFormat(opt.id)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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

        {/* System Limits Box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quy định vận hành hệ thống:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
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
