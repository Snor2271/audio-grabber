import React, { useState, useEffect, useMemo } from 'react';
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
  User,
  Music,
  Tag,
  FileText,
} from 'lucide-react';
import { JobItem, formatDuration, formatFileSize } from '../utils/youtube';
import {
  GENRE_OPTIONS,
  buildFinalFilename,
  titleCaseVietnamese,
  parseYouTubeMetadata,
} from '../utils/naming';

interface QueueItemCardProps {
  item: JobItem;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateName?: (id: string, artist: string, track: string, genre: string) => void;
  autoCapitalize?: boolean;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  onRetry,
  onDelete,
  onUpdateName,
  autoCapitalize = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isVideo = item.format.startsWith('video');
  const defaultExt = isVideo ? '.mp4' : '.m4a';

  // Initialize editable fields with smart defaults
  const initialParsed = useMemo(() => {
    return parseYouTubeMetadata(
      {
        rawTitle: item.title,
        artist: item.artist,
        track: item.track,
      },
      {
        extension: defaultExt,
        autoCapitalize,
      }
    );
  }, [item.title, item.artist, item.track, defaultExt, autoCapitalize]);

  const [artist, setArtist] = useState(item.artist || initialParsed.artist);
  const [track, setTrack] = useState(item.track || initialParsed.track);
  const [genre, setGenre] = useState(item.genre || initialParsed.genre);
  const [isCustomGenre, setIsCustomGenre] = useState(
    Boolean(item.genre && !GENRE_OPTIONS.includes(item.genre as any))
  );

  // Sync state if item changes from outside
  useEffect(() => {
    if (item.artist) setArtist(item.artist);
    if (item.track) setTrack(item.track);
    if (item.genre) {
      setGenre(item.genre);
      setIsCustomGenre(!GENRE_OPTIONS.includes(item.genre as any));
    }
  }, [item.artist, item.track, item.genre]);

  // Compute final filename live
  const finalFilename = useMemo(() => {
    return buildFinalFilename(artist, track, genre, defaultExt);
  }, [artist, track, genre, defaultExt]);

  // Handle changes and sync to server
  const handleFieldBlur = () => {
    if (onUpdateName) {
      onUpdateName(item.id, artist, track, genre);
    }
  };

  const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomGenre(true);
      setGenre('');
    } else {
      setIsCustomGenre(false);
      setGenre(val);
      if (onUpdateName) {
        onUpdateName(item.id, artist, track, val);
      }
    }
  };

  const handleAutoTitleCase = () => {
    const newArtist = titleCaseVietnamese(artist);
    const newTrack = titleCaseVietnamese(track);
    setArtist(newArtist);
    setTrack(newTrack);
    if (onUpdateName) {
      onUpdateName(item.id, newArtist, newTrack, genre);
    }
  };

  const downloadUrl = `/api/jobs/${item.id}/file?filename=${encodeURIComponent(finalFilename)}`;
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
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
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

          {/* Ready State: 3 editable fields & Live filename preview */}
          {item.status === 'ready' && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Artist */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" />
                    <span>Tác giả / Nghệ sĩ</span>
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="Tên ca sĩ / tác giả"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 2. Track */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Music className="w-3 h-3 text-indigo-500" />
                    <span>Tên bài hát</span>
                  </label>
                  <input
                    type="text"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="Tên bài hát"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 3. Genre */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      <span>Thể loại</span>
                    </label>
                    {isCustomGenre && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomGenre(false);
                          setGenre('Bản gốc');
                        }}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Chọn danh sách
                      </button>
                    )}
                  </div>

                  {!isCustomGenre ? (
                    <select
                      value={GENRE_OPTIONS.includes(genre as any) ? genre : 'CUSTOM'}
                      onChange={handleGenreSelect}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                      <option value="CUSTOM">Khác... (tự nhập)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      onBlur={handleFieldBlur}
                      placeholder="Nhập thể loại tự do..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Filename Live Preview */}
              <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    Xem trước file:
                  </span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-medium truncate">
                    {finalFilename}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTitleCase}
                  title="Viết hoa chữ cái đầu các từ theo chuẩn tiếng Việt"
                  className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Viết hoa chuẩn
                </button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            {/* If ready: Direct Download Button for iPhone Safari (No blob, full filename query) */}
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
