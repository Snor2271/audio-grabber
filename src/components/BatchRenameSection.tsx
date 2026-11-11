import React, { useState } from 'react';
import { Sparkles, RotateCcw, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { JobItem } from '../utils/youtube';
import { GENRE_OPTIONS, titleCaseVietnamese, buildFinalFilename } from '../utils/naming';

interface BatchRenameSectionProps {
  jobs: JobItem[];
  geminiConfigured: boolean;
  defaultGenre: string;
  autoCapitalize: boolean;
  onBatchUpdate: (
    updates: Array<{
      id: string;
      artist: string;
      track: string;
      genre: string;
      cleanFilename: string;
      isUserEdited: boolean;
    }>
  ) => Promise<void>;
  onBatchUndo: (
    previousItems: Array<{
      id: string;
      artist: string;
      track: string;
      genre: string;
      cleanFilename?: string;
      isUserEdited?: boolean;
    }>
  ) => Promise<void>;
}

export const BatchRenameSection: React.FC<BatchRenameSectionProps> = ({
  jobs,
  geminiConfigured,
  defaultGenre,
  autoCapitalize,
  onBatchUpdate,
  onBatchUndo,
}) => {
  const [overwriteUserEdited, setOverwriteUserEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ updatedCount: number; totalCount: number } | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<
    Array<{
      id: string;
      artist: string;
      track: string;
      genre: string;
      cleanFilename?: string;
      isUserEdited?: boolean;
    }> | null
  >(null);

  // Eligible ready items
  const readyJobs = jobs.filter((j) => j.status === 'ready');
  const targetJobs = readyJobs.filter((j) => (overwriteUserEdited ? true : !j.isUserEdited));

  const handleBatchRename = async () => {
    if (!geminiConfigured || isLoading) return;
    setErrorMessage(null);
    setNoticeMessage(null);
    setSuccessInfo(null);

    if (targetJobs.length === 0) {
      if (readyJobs.length === 0) {
        setErrorMessage('Chưa có bài hát nào ở trạng thái "Sẵn sàng" để đổi tên.');
      } else {
        setErrorMessage('Tất cả bài hát sẵn sàng đều đã được sửa tay. Hãy bật tùy chọn "Ghi đè cả những bài tôi đã sửa" nếu muốn đổi tên lại.');
      }
      return;
    }

    const batchToSend = targetJobs.slice(0, 20);
    setIsLoading(true);

    try {
      const payload = {
        items: batchToSend.map((j) => ({
          id: j.id,
          title: j.title,
          channel: j.channel || j.uploader || '',
          description: (j.description || '').slice(0, 300),
        })),
        genreOptions: GENRE_OPTIONS,
      };

      const res = await fetch('/api/suggest-names-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi gọi đổi tên hàng loạt.');
      }

      if (data.notice) {
        setNoticeMessage(data.notice);
      }

      const results: Array<{ id: string; artist: string; song: string; genres: string[]; primaryGenre: string }> =
        data.results || [];

      // Snapshot for Undo before modifying
      const snapshot = batchToSend.map((j) => ({
        id: j.id,
        artist: j.artist || '',
        track: j.track || '',
        genre: j.genre || 'Bản gốc',
        cleanFilename: j.cleanFilename,
        isUserEdited: j.isUserEdited,
      }));

      // Map updates
      const updates = results
        .map((resItem) => {
          const original = batchToSend.find((j) => j.id === resItem.id);
          if (!original) return null;

          let newArtist = resItem.artist?.trim() ? resItem.artist.trim() : (original.artist || '');
          let newTrack = resItem.song?.trim() ? resItem.song.trim() : (original.track || original.title);
          let newGenre = resItem.primaryGenre?.trim() ? resItem.primaryGenre.trim() : (original.genre || defaultGenre);

          if (autoCapitalize) {
            newArtist = titleCaseVietnamese(newArtist);
            newTrack = titleCaseVietnamese(newTrack);
          }

          const isVideo = original.format.startsWith('video');
          const ext = isVideo ? '.mp4' : '.m4a';
          const newFilename = buildFinalFilename(newArtist, newTrack, newGenre, ext);

          return {
            id: original.id,
            artist: newArtist,
            track: newTrack,
            genre: newGenre,
            cleanFilename: newFilename,
            isUserEdited: true,
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        artist: string;
        track: string;
        genre: string;
        cleanFilename: string;
        isUserEdited: boolean;
      }>;

      if (updates.length > 0) {
        setUndoSnapshot(snapshot);
        await onBatchUpdate(updates);
        setSuccessInfo({
          updatedCount: updates.length,
          totalCount: batchToSend.length,
        });
      } else {
        setErrorMessage('AI không trả về kết quả hợp lệ nào cho danh sách này.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi gọi đổi tên hàng loạt.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!undoSnapshot || undoSnapshot.length === 0) return;
    try {
      await onBatchUndo(undoSnapshot);
      setUndoSnapshot(null);
      setSuccessInfo(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể hoàn tác.');
    }
  };

  if (readyJobs.length === 0) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/20 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Đổi tên tự động bằng Gemini</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {targetJobs.length} bài
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Gửi một lần cho toàn bộ bài hát sẵn sàng, chuẩn hóa tác giả & tên bài
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleBatchRename}
            disabled={!geminiConfigured || isLoading || targetJobs.length === 0}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 ${
              !geminiConfigured
                ? 'opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer'
            }`}
            title={!geminiConfigured ? 'Chưa có khóa Gemini. Chạy them-api-key.bat rồi khởi động lại.' : 'Đổi tên toàn bộ bài hát sẵn sàng bằng AI'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading ? `Đang xử lý ${targetJobs.slice(0, 20).length} bài...` : '✨ Đổi tên cả danh sách bằng Gemini'}
            </span>
          </button>

          {undoSnapshot && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Khôi phục lại tên trước đó của các bài vừa đổi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hoàn tác</span>
            </button>
          )}
        </div>
      </div>

      {/* Options Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
        <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={overwriteUserEdited}
            onChange={(e) => setOverwriteUserEdited(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-[11px]">Ghi đè cả những bài tôi đã sửa tay</span>
        </label>

        {!geminiConfigured && (
          <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Chưa có khóa Gemini. Chạy <code>them-api-key.bat</code> rồi khởi động lại.</span>
          </span>
        )}
      </div>

      {/* Status Messages */}
      {successInfo && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Đã cập nhật {successInfo.updatedCount}/{successInfo.totalCount} bài hát thành công.
            </span>
          </div>
        </div>
      )}

      {noticeMessage && (
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px]">
          {noticeMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
