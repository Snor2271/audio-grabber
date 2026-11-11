import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Server, Terminal, ShieldAlert } from 'lucide-react';
import { SystemHealth } from '../utils/youtube';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Kiểm Tra Hệ Thống
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading && !data ? (
          <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Đang kiểm tra các dịch vụ backend...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Lỗi kết nối máy chủ
            </div>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-3 text-xs">
            {/* Status Summary Banner */}
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                data.status === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              {data.status === 'ok' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-bold">
                  {data.status === 'ok' ? 'Hệ thống hoạt động bình thường' : 'Cần kiểm tra lại cấu hình'}
                </div>
                <div className="text-[11px] opacity-90">
                  Backend Node.js, yt-dlp và FFmpeg đã sẵn sàng xử lý file.
                </div>
              </div>
            </div>

            {/* Component Status Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* yt-dlp */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>yt-dlp</span>
                </div>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {data.ytdlpVersion}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Đã cài đặt
                </div>
              </div>

              {/* FFmpeg */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>FFmpeg</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {data.ffmpegInstalled ? 'Khả dụng' : 'Chưa có'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {data.ffmpegVersion ? data.ffmpegVersion.split(' ')[2] || 'OK' : 'Không có'}
                </div>
              </div>

              {/* Node Runtime */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-slate-500 dark:text-slate-400 font-medium">Node.js Runtime</div>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {data.nodeVersion}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  --js-runtimes node
                </div>
              </div>

              {/* Queue Stats */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-slate-500 dark:text-slate-400 font-medium">Hàng đợi hiện tại</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {data.activeJobs} đang tải / {data.waitingJobs} chờ
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Tối đa {data.maxConcurrent} luồng song song
                </div>
              </div>
            </div>

            {/* Cookies & Proxy Details */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Cấu hình chống chặn bot:</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${data.hasCookies ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>Cookies: {data.hasCookies ? 'Đã bật' : 'Chưa cấu hình'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${data.hasProxy ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>Proxy: {data.hasProxy ? 'Đã bật' : 'Chưa cấu hình'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${data.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <span>
                    Gemini AI: {data.geminiConfigured ? `Sẵn sàng (${data.geminiModel || 'gemini-3.8-flash'})` : 'Chưa có API key (tùy chọn)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300 text-[11px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <span>
                Nếu gặp lỗi "YouTube đang chặn IP của máy chủ này", hãy cấu hình thêm <code>YTDLP_COOKIES_FILE</code> hoặc <code>YTDLP_PROXY</code> trên máy chủ.
              </span>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới thông tin</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
