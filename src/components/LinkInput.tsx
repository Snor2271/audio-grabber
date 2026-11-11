import React, { useState, useMemo } from 'react';
import { PlusCircle, AlertCircle, CheckCircle2, Clipboard, Sparkles, Sliders } from 'lucide-react';
import { parseMultipleLinks, DownloadFormat } from '../utils/youtube';

interface LinkInputProps {
  onAddLinks: (videoIds: string[]) => void;
  isQueueFull: boolean;
  selectedFormat: DownloadFormat;
  onOpenSettings: () => void;
}

const SAMPLE_LINK = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export const LinkInput: React.FC<LinkInputProps> = ({
  onAddLinks,
  isQueueFull,
  selectedFormat,
  onOpenSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse links live
  const parsedResults = useMemo(() => {
    return parseMultipleLinks(inputText);
  }, [inputText]);

  const validItems = useMemo(() => {
    return parsedResults.filter((r) => r.isValid && r.videoId);
  }, [parsedResults]);

  const invalidItems = useMemo(() => {
    return parsedResults.filter((r) => !r.isValid);
  }, [parsedResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validItems.length === 0 || isQueueFull) return;

    setIsSubmitting(true);
    const ids = validItems.map((item) => item.videoId as string);
    onAddLinks(ids);
    setInputText('');
    setIsSubmitting(false);
  };

  const handlePasteSample = () => {
    setInputText((prev) => (prev ? `${prev.trim()}\n${SAMPLE_LINK}` : SAMPLE_LINK));
  };

  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText((prev) => (prev ? `${prev.trim()}\n${text.trim()}` : text.trim()));
        }
      }
    } catch {
      // Fallback: clipboard access might be blocked by browser permission
    }
  };

  const formatText = {
    audio_m4a: 'Âm thanh .m4a (AAC gốc, 128kbps)',
    video_720p: 'Video .mp4 (720p HD)',
    video_1080p: 'Video .mp4 (1080p Full HD)',
  }[selectedFormat];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top bar of input */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label htmlFor="youtube-links-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Dán link YouTube</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              (mỗi dòng một link)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClipboardPaste}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Dán từ bộ nhớ tạm"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Dán</span>
            </button>
            <button
              type="button"
              onClick={handlePasteSample}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors"
              title="Thử link mẫu"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Link mẫu</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id="youtube-links-input"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`https://www.youtube.com/watch?v=...\nhttps://youtu.be/...\nhttps://youtube.com/shorts/...`}
            className="w-full px-4 py-3 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y min-h-[90px]"
          />
        </div>

        {/* Format Pill & Settings Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Đang chọn:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatText}</span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Chỉnh sửa tải xuống"
            title="Chỉnh sửa tải xuống"
            className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer active:scale-95 motion-reduce:active:scale-100"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Live Validation Badges / Errors per line */}
        {parsedResults.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            {parsedResults.map((result, idx) => (
              <div
                key={idx}
                className={`text-xs px-3 py-2 rounded-lg flex items-start gap-2 ${
                  result.isValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                }`}
              >
                {result.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-mono truncate">{result.raw}</div>
                  {result.isValid ? (
                    <div className="text-[11px] opacity-80">Mã video hợp lệ: {result.videoId}</div>
                  ) : (
                    <div className="text-[11px] font-sans text-rose-600 dark:text-rose-400 font-medium">
                      Lỗi: {result.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={validItems.length === 0 || isQueueFull || isSubmitting}
          className={`w-full h-12 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] ${
            validItems.length === 0 || isQueueFull || isSubmitting
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/25'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>
            {isQueueFull
              ? 'Hàng đợi đã đầy (Tối đa 20)'
              : validItems.length > 0
              ? `Thêm ${validItems.length} video vào hàng đợi`
              : 'Thêm vào hàng đợi'}
          </span>
        </button>
      </form>
    </div>
  );
};
