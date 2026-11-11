/**
 * Audio Grabber - Main Application Component
 * Optimized for Safari iPhone & Desktop
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LinkInput } from './components/LinkInput';
import { QueueItemCard } from './components/QueueItemCard';
import { HealthModal } from './components/HealthModal';
import { SettingsModal } from './components/SettingsModal';
import { SafariTip } from './components/SafariTip';
import { JobItem, DownloadFormat } from './utils/youtube';
import { ListMusic, Trash2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ag_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Selected format state
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>(() => {
    return (localStorage.getItem('ag_format') as DownloadFormat) || 'audio_m4a';
  });

  // Naming template settings
  const [defaultGenre, setDefaultGenre] = useState<string>(() => {
    return localStorage.getItem('ag_default_genre') || 'Bản gốc';
  });

  const [autoDetectGenre, setAutoDetectGenre] = useState<boolean>(() => {
    return localStorage.getItem('ag_auto_genre') !== 'false';
  });

  const [autoCapitalize, setAutoCapitalize] = useState<boolean>(() => {
    return localStorage.getItem('ag_auto_capitalize') !== 'false';
  });

  // Jobs queue state
  const [jobs, setJobs] = useState<JobItem[]>([]);

  // Modals state
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync dark mode with document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ag_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ag_theme', 'light');
    }
  }, [darkMode]);

  // Initial load: fetch existing server jobs
  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: JobItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      })
      .catch(() => {});
  }, []);

  // Persist format preference
  const handleFormatChange = (f: DownloadFormat) => {
    setSelectedFormat(f);
    localStorage.setItem('ag_format', f);
  };

  const handleDefaultGenreChange = (g: string) => {
    setDefaultGenre(g);
    localStorage.setItem('ag_default_genre', g);
  };

  const handleToggleAutoDetectGenre = (val: boolean) => {
    setAutoDetectGenre(val);
    localStorage.setItem('ag_auto_genre', val ? 'true' : 'false');
  };

  const handleToggleAutoCapitalize = (val: boolean) => {
    setAutoCapitalize(val);
    localStorage.setItem('ag_auto_capitalize', val ? 'true' : 'false');
  };

  // Update customized track/artist/genre
  const handleUpdateJobName = async (id: string, artist: string, track: string, genre: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, artist, track, genre } : j))
    );

    try {
      await fetch(`/api/jobs/${id}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist, track, genre }),
      });
    } catch {}
  };

  // Add jobs to queue
  const handleAddLinks = async (videoIds: string[]) => {
    for (const vid of videoIds) {
      try {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: vid, format: selectedFormat }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // Add as error card to let user see individual failure
          const failedJob: JobItem = {
            id: `temp_${Date.now()}_${vid}`,
            videoId: vid,
            url: `https://www.youtube.com/watch?v=${vid}`,
            format: selectedFormat,
            status: 'error',
            progress: 0,
            title: `YouTube ${vid}`,
            error: errData.error || 'Không thể gửi yêu cầu đến hàng đợi.',
            createdAt: Date.now(),
          };
          setJobs((prev) => [failedJob, ...prev]);
          continue;
        }

        const data = await res.json();
        const newJob: JobItem = {
          id: data.id,
          videoId: data.videoId,
          url: `https://www.youtube.com/watch?v=${data.videoId}`,
          format: data.format,
          status: data.status,
          progress: data.progress || 0,
          title: data.title || `YouTube ${data.videoId}`,
          createdAt: Date.now(),
        };

        setJobs((prev) => [newJob, ...prev]);
      } catch (err: any) {
        const failedJob: JobItem = {
          id: `temp_${Date.now()}_${vid}`,
          videoId: vid,
          url: `https://www.youtube.com/watch?v=${vid}`,
          format: selectedFormat,
          status: 'error',
          progress: 0,
          title: `YouTube ${vid}`,
          error: err.message || 'Lỗi mạng khi thêm vào hàng đợi.',
          createdAt: Date.now(),
        };
        setJobs((prev) => [failedJob, ...prev]);
      }
    }
  };

  // Retry job
  const handleRetry = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    // If it was a mock temp job, re-add it
    if (id.startsWith('temp_')) {
      handleDelete(id);
      handleAddLinks([job.videoId]);
      return;
    }

    try {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: 'waiting', progress: 0, error: undefined } : j))
      );
      const res = await fetch(`/api/jobs/${id}/retry`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Thử lại thất bại.');
      }
    } catch {
      // Re-trigger via add
      handleDelete(id);
      handleAddLinks([job.videoId]);
    }
  };

  // Delete job
  const handleDelete = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (!id.startsWith('temp_')) {
      try {
        await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      } catch {}
    }
  };

  // Clear completed jobs
  const handleClearCompleted = () => {
    const completed = jobs.filter((j) => j.status === 'ready' || j.status === 'error');
    completed.forEach((j) => handleDelete(j.id));
  };

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll job status every 1.5 seconds (1500ms)
  const pollActiveJobs = useCallback(async () => {
    const activeJobs = jobs.filter((j) => j.status === 'waiting' || j.status === 'downloading');
    if (activeJobs.length === 0) return;

    for (const job of activeJobs) {
      if (job.id.startsWith('temp_')) continue;
      try {
        const res = await fetch(`/api/jobs/${job.id}`);
        if (!res.ok) continue;
        const data = await res.json();

        setJobs((prev) =>
          prev.map((item) => {
            if (item.id !== job.id) return item;
            return {
              ...item,
              status: data.status,
              progress: data.progress,
              title: data.title || item.title,
              duration: data.duration,
              fileSize: data.fileSize,
              error: data.error,
              errorDetails: data.errorDetails,
              readyAt: data.readyAt,
            };
          })
        );
      } catch {}
    }
  }, [jobs]);

  useEffect(() => {
    // Check if there are active jobs to poll
    const hasActive = jobs.some((j) => j.status === 'waiting' || j.status === 'downloading');

    if (hasActive) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(pollActiveJobs, 1500);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [jobs, pollActiveJobs]);

  const activeCount = jobs.filter((j) => j.status === 'waiting' || j.status === 'downloading').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenHealth={() => setIsHealthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedFormat={selectedFormat}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Safari Tip Banner */}
        <SafariTip />

        {/* Link Input Section */}
        <section aria-labelledby="input-section-title">
          <h2 id="input-section-title" className="sr-only">
            Nhập đường dẫn YouTube
          </h2>
          <LinkInput
            onAddLinks={handleAddLinks}
            isQueueFull={jobs.length >= 20}
            selectedFormat={selectedFormat}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </section>

        {/* Queue List Section */}
        <section aria-labelledby="queue-section-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 id="queue-section-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hàng Đợi Tải Về
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {jobs.length}/20
              </span>
              {activeCount > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">
                  ({activeCount} đang xử lý)
                </span>
              )}
            </div>

            {jobs.length > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                title="Dọn dẹp các mục đã xong hoặc lỗi"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa mục đã xong</span>
              </button>
            )}
          </div>

          {/* Empty State */}
          {jobs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <ListMusic className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Chưa có bài hát nào trong hàng đợi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Dán link YouTube ở trên và bấm "Thêm vào hàng đợi" để bắt đầu trích xuất âm thanh .m4a chất lượng cao.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((item) => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                  onUpdateName={handleUpdateJobName}
                  autoCapitalize={autoCapitalize}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>Audio Grabber &bull; Hỗ trợ Safari iPhone, iPad & Máy tính &bull; File .m4a AAC 128k</p>
      </footer>

      {/* Health Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        format={selectedFormat}
        onChangeFormat={handleFormatChange}
        defaultGenre={defaultGenre}
        onChangeDefaultGenre={handleDefaultGenreChange}
        autoDetectGenre={autoDetectGenre}
        onToggleAutoDetectGenre={handleToggleAutoDetectGenre}
        autoCapitalize={autoCapitalize}
        onToggleAutoCapitalize={handleToggleAutoCapitalize}
      />
    </div>
  );
}
