import React, { useState } from 'react';
import {
  Download,
  RotateCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileAudio,
  Film,
} from 'lucide-react';
import { JobItem, formatDuration, formatFileSize } from '../utils/youtube';

interface QueueItemCardProps {
  item: JobItem;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  onRetry,
  onDelete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isVideo = item.format.startsWith('video');
  const defaultExt = isVideo ? '.mp4' : '.m4a';
  const downloadUrl = `/api/jobs/${item.id}/file`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Thumbnail Preview */}
        <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800">
          {!imgError ? (
            <img
              src={thumbnailUrl}
              alt={item.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              {isVideo ? <Film className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
            </div>
          )}

          {/* Format badge overlay */}
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
            {defaultExt.replace('.', '')}
          </div>

          {/* Duration overlay if available */}
          {item.duration && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white backdrop-blur-xs">
              {formatDuration(item.duration)}
            </div>
          )}
        </div>

        {/* Content & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
              {item.title}
            </h3>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Xóa ${item.title}`}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Xóa khỏi hàng đợi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Status info bar */}
          <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs">
            {/* Status pill */}
            {item.status === 'waiting' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-medium">
                <Clock className="w-3 h-3" />
                Chờ lượt
              </span>
            )}

            {item.status === 'downloading' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Đang tải {item.progress}%
              </span>
            )}

            {item.status === 'ready' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Sẵn sàng {item.fileSize ? `(${formatFileSize(item.fileSize)})` : ''}
              </span>
            )}

            {item.status === 'error' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 font-medium">
                <AlertCircle className="w-3 h-3" />
                Lỗi
              </span>
            )}

            {/* Video ID tag */}
            <span className="text-slate-400 font-mono text-[11px]">
              ID: {item.videoId}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                item.status === 'ready'
                  ? 'bg-emerald-500'
                  : item.status === 'error'
                  ? 'bg-rose-500'
                  : item.status === 'downloading'
                  ? 'bg-indigo-600'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{
                width: `${
                  item.status === 'ready'
                    ? 100
                    : item.status === 'downloading'
                    ? Math.max(5, item.progress)
                    : item.status === 'error'
                    ? 100
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            {/* If ready: Direct Download Button for iPhone Safari */}
            {item.status === 'ready' && (
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] w-full sm:w-auto min-h-[42px]"
              >
                <Download className="w-4 h-4" />
                <span>Tải về {defaultExt}</span>
              </a>
            )}

            {/* If error: Retry and view details button */}
            {item.status === 'error' && (
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => onRetry(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  <span>{showDetails ? 'Ẩn log' : 'Xem log lỗi'}</span>
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Waiting or downloading indicator */}
            {(item.status === 'waiting' || item.status === 'downloading') && (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                {item.status === 'waiting' ? 'Đang trong hàng đợi xử lý...' : 'Đang xử lý & trích xuất m4a...'}
              </div>
            )}
          </div>

          {/* Expandable Error Details */}
          {item.status === 'error' && (
            <div className="mt-2.5 space-y-2">
              <div className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                {item.error || 'Đã xảy ra lỗi không xác định.'}
              </div>

              {showDetails && item.errorDetails && (
                <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold mb-1">Chi tiết kỹ thuật từ yt-dlp:</div>
                  <pre className="whitespace-pre-wrap">{item.errorDetails}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
