/**
 * Audio Grabber - Main Application Component
 * Optimized for Safari iPhone & Desktop
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header, ThemeMode } from './components/Header';
import { LinkInput } from './components/LinkInput';
import { QueueItemCard } from './components/QueueItemCard';
import { BatchRenameSection } from './components/BatchRenameSection';
import { FaqModal } from './components/FaqModal';
import { CreditsModal } from './components/CreditsModal';
import { HealthModal } from './components/HealthModal';
import { SettingsModal } from './components/SettingsModal';
import { SafariTip } from './components/SafariTip';
import { JobItem, DownloadFormat } from './utils/youtube';
import { runThemeTransition, runDonutAnimation } from './utils/themeAnimation';
import { ListMusic, Trash2 } from 'lucide-react';

export default function App() {
  // Theme state: light | dark | system (default: system)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ag_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ag_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // Focus return refs
  const faqBtnRef = useRef<HTMLButtonElement>(null);
  const creditsBtnRef = useRef<HTMLButtonElement>(null);

  // Gemini configured flag (from backend /api/health)
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Sync helper to update DOM classes, meta theme-color, and state
  const applyThemeSync = useCallback((nextIsDark: boolean) => {
    setIsDark(nextIsDark);
    if (nextIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', nextIsDark ? '#0F172A' : '#F8FAFC');
  }, []);

  // Handle explicit user selection from Header dropdown
  const handleSelectTheme = useCallback(
    (mode: ThemeMode, originEl: HTMLElement | null) => {
      const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const determineIsDark = (m: ThemeMode) => {
        if (m === 'dark') return true;
        if (m === 'light') return false;
        return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      };

      const nextIsDark = determineIsDark(mode);
      const themeChanged = nextIsDark !== isDark;

      setThemeMode(mode);
      localStorage.setItem('ag_theme', mode);

      if (themeChanged) {
        // 1.2 / 1.3 / 1.5: Effective theme changed -> Run feathered View Transition
        if (prefersReducedMotion) {
          applyThemeSync(nextIsDark);
        } else {
          runThemeTransition(nextIsDark, originEl, () => {
            applyThemeSync(nextIsDark);
          });
        }
      } else {
        // 1.4: Theme did not change -> Run feathered donut ring from button center
        if (!prefersReducedMotion) {
          let x = window.innerWidth / 2;
          let y = window.innerHeight / 2;
          if (originEl) {
            const rect = originEl.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
          }
          runDonutAnimation(x, y, isDark);
        }
      }
    },
    [isDark, applyThemeSync]
  );

  // 1.6: OS system theme changes (user did NOT click button) -> Smooth CSS transition 300ms, NO loang
  useEffect(() => {
    if (themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const systemIsDark = e.matches;
      const root = document.documentElement;
      const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReducedMotion) {
        root.classList.add('theme-transitioning');
        setTimeout(() => {
          root.classList.remove('theme-transitioning');
        }, 300);
      }

      applyThemeSync(systemIsDark);
    };

    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, [themeMode, applyThemeSync]);

  // Initial load: fetch jobs & health info (Gemini status)
  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: JobItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      })
      .catch(() => {});

    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((health) => {
        if (health) {
          setGeminiConfigured(Boolean(health.geminiConfigured));
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

  // Update customized track/artist/genre for a single job
  const handleUpdateJobName = async (
    id: string,
    artist: string,
    track: string,
    genre: string,
    isUserEdited: boolean = true
  ) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, artist, track, genre, isUserEdited, isLowConfidence: false } : j
      )
    );

    try {
      await fetch(`/api/jobs/${id}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist, track, genre }),
      });
    } catch {}
  };

  // Batch rename update from Gemini
  const handleBatchUpdate = async (
    updates: Array<{
      id: string;
      artist: string;
      track: string;
      genre: string;
      cleanFilename: string;
      isUserEdited: boolean;
    }>
  ) => {
    const updateMap = new Map(updates.map((u) => [u.id, u]));

    setJobs((prev) =>
      prev.map((item) => {
        const up = updateMap.get(item.id);
        if (!up) return item;
        return {
          ...item,
          artist: up.artist,
          track: up.track,
          genre: up.genre,
          cleanFilename: up.cleanFilename,
          isUserEdited: true,
          isLowConfidence: false,
        };
      })
    );

    // Sync changes to backend in parallel
    await Promise.all(
      updates.map((up) =>
        fetch(`/api/jobs/${up.id}/name`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: up.artist, track: up.track, genre: up.genre }),
        }).catch(() => {})
      )
    );
  };

  // Batch undo: revert items to snapshot before batch run
  const handleBatchUndo = async (
    previousItems: Array<{
      id: string;
      artist: string;
      track: string;
      genre: string;
      cleanFilename?: string;
      isUserEdited?: boolean;
    }>
  ) => {
    const prevMap = new Map(previousItems.map((p) => [p.id, p]));

    setJobs((prev) =>
      prev.map((item) => {
        const p = prevMap.get(item.id);
        if (!p) return item;
        return {
          ...item,
          artist: p.artist,
          track: p.track,
          genre: p.genre,
          cleanFilename: p.cleanFilename || item.cleanFilename,
          isUserEdited: p.isUserEdited,
        };
      })
    );

    await Promise.all(
      previousItems.map((p) =>
        fetch(`/api/jobs/${p.id}/name`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: p.artist, track: p.track, genre: p.genre }),
        }).catch(() => {})
      )
    );
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
            const isUserEdited = Boolean(item.isUserEdited);
            return {
              ...item,
              status: data.status,
              progress: data.progress,
              title: data.title || item.title,
              channel: data.channel || data.uploader || item.channel,
              uploader: data.uploader || item.uploader,
              description: data.description || item.description,
              artist: isUserEdited ? item.artist : (data.artist ?? item.artist),
              track: isUserEdited ? item.track : (data.track ?? item.track),
              genre: isUserEdited ? item.genre : (data.genre ?? item.genre),
              isLowConfidence: isUserEdited ? false : (data.isLowConfidence ?? item.isLowConfidence),
              cleanFilename: data.cleanFilename || item.cleanFilename,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        themeMode={themeMode}
        isDark={isDark}
        onSelectTheme={handleSelectTheme}
        onOpenHealth={() => setIsHealthOpen(true)}
        onOpenFaq={() => setIsFaqOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        faqBtnRef={faqBtnRef}
        creditsBtnRef={creditsBtnRef}
        selectedFormat={selectedFormat}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 space-y-6">
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
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
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
                  geminiConfigured={geminiConfigured}
                />
              ))}

              {/* Batch Rename Section (below queue cards) */}
              <BatchRenameSection
                jobs={jobs}
                geminiConfigured={geminiConfigured}
                defaultGenre={defaultGenre}
                autoCapitalize={autoCapitalize}
                onBatchUpdate={handleBatchUpdate}
                onBatchUndo={handleBatchUndo}
              />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <p>Audio Grabber &bull; Hỗ trợ Safari iPhone, iPad & Máy tính &bull; File .m4a AAC 128k</p>
      </footer>

      {/* Health Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* FAQ Modal */}
      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        triggerRef={faqBtnRef}
      />

      {/* Credits / Hall of Fame Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        triggerRef={creditsBtnRef}
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
