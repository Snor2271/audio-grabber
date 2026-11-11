import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowLeftRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { JobItem, formatDuration, formatFileSize } from '../utils/youtube';
import {
  GENRE_OPTIONS,
  buildFinalFilename,
  titleCaseVietnamese,
  parseYouTubeMetadata,
  saveLearnedAuthor,
  saveChannelOrder,
} from '../utils/naming';

interface QueueItemCardProps {
  item: JobItem;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateName?: (
    id: string,
    artist: string,
    track: string,
    genre: string,
    isUserEdited?: boolean
  ) => void;
  autoCapitalize?: boolean;
  geminiConfigured?: boolean;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  onRetry,
  onDelete,
  onUpdateName,
  autoCapitalize = true,
  geminiConfigured = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isUserEdited, setIsUserEdited] = useState(Boolean(item.isUserEdited));
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const isVideo = item.format.startsWith('video');
  const defaultExt = isVideo ? '.mp4' : '.m4a';

  // Check if title is temporary placeholder
  const isTempTitle =
    !item.title || /^YouTube\s+[a-zA-Z0-9_-]{11}$/i.test(item.title.trim());

  // Parse metadata ONLY when title is real (not temporary)
  const initialParsed = useMemo(() => {
    if (isTempTitle) {
      return {
        artist: '',
        track: '',
        genre: 'Bản gốc',
        isLowConfidence: false,
        suggestedFilename: '',
      };
    }
    return parseYouTubeMetadata(
      {
        rawTitle: item.title,
        artist: item.artist,
        track: item.track,
        channel: item.channel,
        uploader: item.uploader,
      },
      {
        extension: defaultExt,
        autoCapitalize,
      }
    );
  }, [
    item.title,
    item.artist,
    item.track,
    item.channel,
    item.uploader,
    isTempTitle,
    defaultExt,
    autoCapitalize,
  ]);

  const [artist, setArtist] = useState(item.artist || initialParsed.artist);
  const [track, setTrack] = useState(item.track || initialParsed.track);
  const [genre, setGenre] = useState(item.genre || initialParsed.genre);
  const [isLowConfidence, setIsLowConfidence] = useState(
    item.isLowConfidence ?? initialParsed.isLowConfidence
  );
  const [isCustomGenre, setIsCustomGenre] = useState(
    Boolean(item.genre && !GENRE_OPTIONS.includes(item.genre as any))
  );

  // Sync state if item changes from outside, BUT ONLY IF USER HAS NOT EDITED
  useEffect(() => {
    if (isUserEdited) return;

    // When real title arrives or metadata updates from server
    if (!isTempTitle) {
      const parsed = parseYouTubeMetadata(
        {
          rawTitle: item.title,
          artist: item.artist,
          track: item.track,
          channel: item.channel,
          uploader: item.uploader,
        },
        {
          extension: defaultExt,
          autoCapitalize,
        }
      );

      setArtist(item.artist || parsed.artist);
      setTrack(item.track || parsed.track);
      setGenre(item.genre || parsed.genre);
      setIsLowConfidence(item.isLowConfidence ?? parsed.isLowConfidence);
      setIsCustomGenre(
        Boolean(
          (item.genre || parsed.genre) &&
            !GENRE_OPTIONS.includes((item.genre || parsed.genre) as any)
        )
      );
    }
  }, [
    item.title,
    item.artist,
    item.track,
    item.genre,
    item.isLowConfidence,
    item.channel,
    item.uploader,
    isUserEdited,
    isTempTitle,
    defaultExt,
    autoCapitalize,
  ]);

  // Compute final filename live
  const finalFilename = useMemo(() => {
    return buildFinalFilename(artist, track, genre, defaultExt);
  }, [artist, track, genre, defaultExt]);

  // Handle changes and sync to server
  const handleFieldBlur = () => {
    if (onUpdateName) {
      onUpdateName(item.id, artist, track, genre, true);
    }
  };

  const handleArtistChange = (val: string) => {
    setArtist(val);
    setIsUserEdited(true);
    setIsLowConfidence(false);
  };

  const handleTrackChange = (val: string) => {
    setTrack(val);
    setIsUserEdited(true);
    setIsLowConfidence(false);
  };

  // ⇄ Swap Artist and Track
  const handleSwapArtistTrack = () => {
    const newArtist = track;
    const newTrack = artist;
    setArtist(newArtist);
    setTrack(newTrack);
    setIsUserEdited(true);
    setIsLowConfidence(false);

    // If channel is present, remember user preference for this channel
    const channel = item.channel || item.uploader;
    if (channel) {
      // Swapping implies the original title order was track first!
      saveChannelOrder(channel, 'track_first');
    }

    if (onUpdateName) {
      onUpdateName(item.id, newArtist, newTrack, genre, true);
    }
  };

  const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIsUserEdited(true);
    if (val === 'CUSTOM') {
      setIsCustomGenre(true);
      setGenre('');
    } else {
      setIsCustomGenre(false);
      setGenre(val);
      if (onUpdateName) {
        onUpdateName(item.id, artist, track, val, true);
      }
    }
  };

  const handleCustomGenreChange = (val: string) => {
    setGenre(val);
    setIsUserEdited(true);
  };

  const handleAutoTitleCase = () => {
    const newArtist = titleCaseVietnamese(artist);
    const newTrack = titleCaseVietnamese(track);
    setArtist(newArtist);
    setTrack(newTrack);
    setIsUserEdited(true);
    setIsLowConfidence(false);
    if (onUpdateName) {
      onUpdateName(item.id, newArtist, newTrack, genre, true);
    }
  };

  // ✨ Call Gemini AI to suggest artist, song title, and genres
  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/suggest-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          channel: item.channel || item.uploader || '',
          description: item.description || '',
          genreOptions: GENRE_OPTIONS,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lấy gợi ý từ AI.');
      }

      // If AI returns a non-empty field, use it; otherwise preserve existing value
      const newArtist = data.artist?.trim() ? data.artist.trim() : artist;
      const newTrack = data.song?.trim() ? data.song.trim() : track;
      const newGenre = data.primaryGenre?.trim() ? data.primaryGenre.trim() : genre;

      setArtist(newArtist);
      setTrack(newTrack);
      setGenre(newGenre);
      setIsCustomGenre(!GENRE_OPTIONS.includes(newGenre as any));
      setIsUserEdited(true);
      setIsLowConfidence(false);

      if (onUpdateName) {
        onUpdateName(item.id, newArtist, newTrack, newGenre, true);
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi gọi gợi ý AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // When clicking download: learn author & channel order
  const handleDownloadClick = () => {
    if (artist && artist.trim()) {
      saveLearnedAuthor(artist.trim());
    }
    const channel = item.channel || item.uploader;
    if (channel) {
      saveChannelOrder(channel, isUserEdited ? 'track_first' : 'artist_first');
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

            {/* Low Confidence Warning Badge */}
            {item.status === 'ready' && isLowConfidence && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-semibold text-[11px]"
                title="Độ tin cậy thấp: Hãy kiểm tra thứ tự Tác giả và Tên bài hát, hoặc bấm 'Đổi chỗ' nếu bị ngược."
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Kiểm tra lại</span>
              </span>
            )}

            {/* Video ID tag */}
            <span className="text-slate-400 font-mono text-[11px]">
              ID: {item.videoId}
            </span>

            {/* Channel name tag if present */}
            {item.channel && (
              <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
                Kênh: {item.channel}
              </span>
            )}
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

          {/* Ready State: 3 editable fields, Swap button & Live filename preview */}
          {item.status === 'ready' && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                {/* 1. Artist (span 5) */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" />
                    <span>Tác giả / Nghệ sĩ</span>
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => handleArtistChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="Tên ca sĩ / tác giả"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* Swap button (span 1 on desktop) */}
                <div className="sm:col-span-1 flex items-center justify-center pb-0.5">
                  <button
                    type="button"
                    onClick={handleSwapArtistTrack}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex items-center justify-center gap-1 w-full sm:w-auto text-xs"
                    title="Đổi chỗ Tác giả và Tên bài hát"
                    aria-label="Đổi chỗ Tác giả và Tên bài hát"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="sm:hidden font-medium text-[11px]">Đổi chỗ</span>
                  </button>
                </div>

                {/* 2. Track (span 4) */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Music className="w-3 h-3 text-indigo-500" />
                    <span>Tên bài hát</span>
                  </label>
                  <input
                    type="text"
                    value={track}
                    onChange={(e) => handleTrackChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="Tên bài hát"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 3. Genre (span 3) */}
                <div className="sm:col-span-3 space-y-1">
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
                          setIsUserEdited(true);
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
                      onChange={(e) => handleCustomGenreChange(e.target.value)}
                      onBlur={handleFieldBlur}
                      placeholder="Nhập thể loại..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* AI Error message banner if any */}
              {aiError && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiError(null)}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 font-bold px-1.5 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs transition-colors shrink-0"
                    title="Đóng thông báo"
                    aria-label="Đóng thông báo"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Filename Live Preview */}
              <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    Xem trước file:
                  </span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-medium truncate">
                    {finalFilename}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleAutoTitleCase}
                    title="Viết hoa chữ cái đầu các từ theo chuẩn tiếng Việt"
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors shadow-2xs cursor-pointer"
                  >
                    Viết hoa chuẩn
                  </button>

                  {/* Nút nhỏ, mờ mở menu tùy chọn nâng cao */}
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      aria-label="Tùy chọn nâng cao"
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen}
                      title="Tùy chọn nâng cao"
                      className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors opacity-75 hover:opacity-100 flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                          isMenuOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </button>

                    {isMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 p-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          disabled={!geminiConfigured || isAiLoading}
                          onClick={() => {
                            if (!geminiConfigured) return;
                            setIsMenuOpen(false);
                            handleAiSuggest();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex flex-col gap-0.5 transition-colors ${
                            !geminiConfigured
                              ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500'
                              : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isAiLoading ? 'animate-spin' : ''}`} />
                            <span>{isAiLoading ? 'Đang phân tích...' : '✨ Gợi ý bằng AI cho bài này'}</span>
                          </div>
                          {!geminiConfigured ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal leading-tight">
                              Chưa có khóa Gemini. Chạy them-api-key.bat rồi khởi động lại.
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                              Tách tác giả & tên bài hát bằng Gemini
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                onClick={handleDownloadClick}
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
