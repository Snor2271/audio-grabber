import React, { useState, useRef, useEffect } from 'react';
import { Music, Activity, Sun, Moon, Monitor, Check, Medal } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface HeaderProps {
  themeMode: ThemeMode;
  isDark: boolean;
  onSelectTheme: (mode: ThemeMode, themeButtonEl: HTMLElement | null) => void;
  onOpenHealth: () => void;
  onOpenFaq: () => void;
  onOpenCredits: () => void;
  faqBtnRef?: React.RefObject<HTMLButtonElement | null>;
  creditsBtnRef?: React.RefObject<HTMLButtonElement | null>;
  selectedFormat: string;
}

export const Header: React.FC<HeaderProps> = ({
  themeMode,
  isDark,
  onSelectTheme,
  onOpenHealth,
  onOpenFaq,
  onOpenCredits,
  faqBtnRef,
  creditsBtnRef,
  selectedFormat,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isThemeMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isThemeMenuOpen]);

  const getFormatLabel = () => {
    if (selectedFormat === 'video_720p') return '720p';
    if (selectedFormat === 'video_1080p') return '1080p';
    return '.m4a';
  };

  const getThemeButtonDetails = () => {
    if (themeMode === 'light') {
      return {
        label: 'Chế độ sáng',
        icon: <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />,
      };
    }
    if (themeMode === 'dark') {
      return {
        label: 'Chế độ tối',
        icon: <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 hover:-rotate-12" />,
      };
    }
    return {
      label: `Theo hệ thống (${isDark ? 'đang tối' : 'đang sáng'})`,
      icon: <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 hover:scale-110" />,
    };
  };

  const currentTheme = getThemeButtonDetails();

  // Close menu and wait 1 frame before triggering transition so menu is excluded from snapshot
  const handleSelectMode = (mode: ThemeMode) => {
    setIsThemeMenuOpen(false);
    requestAnimationFrame(() => {
      onSelectTheme(mode, themeButtonRef.current);
    });
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-3xl mx-auto px-2.5 sm:px-4 h-15 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                Audio Grabber
              </h1>
              <span className="hidden min-[380px]:inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                {getFormatLabel()}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[130px] min-[360px]:max-w-[180px] sm:max-w-none">
              Tải nhạc YouTube .m4a cho iPhone & máy tính
            </p>
          </div>
        </div>

        {/* 4 Action Buttons: [Hệ thống] [FAQs] [Huy chương] [Sáng/Tối] */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 1. Health Check Button */}
          <button
            type="button"
            onClick={onOpenHealth}
            aria-label="Kiểm tra hệ thống"
            title="Kiểm tra hệ thống (yt-dlp, FFmpeg, Gemini)"
            className="h-9 px-2 min-[480px]:px-2.5 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95 motion-reduce:active:scale-100 duration-100"
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden min-[480px]:inline">Hệ thống</span>
          </button>

          {/* 2. FAQs Pill Button */}
          <button
            ref={faqBtnRef}
            type="button"
            onClick={onOpenFaq}
            aria-label="Câu hỏi thường gặp"
            title="Câu hỏi thường gặp"
            className="h-9 px-2.5 sm:px-3 flex items-center justify-center text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95 motion-reduce:active:scale-100 duration-100 select-none"
          >
            FAQs
          </button>

          {/* 3. Medal / Credits Button */}
          <button
            ref={creditsBtnRef}
            type="button"
            onClick={onOpenCredits}
            aria-label="Bảng vinh danh"
            title="Bảng vinh danh"
            className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95 motion-reduce:active:scale-100 duration-100"
          >
            <Medal className="w-4 h-4 text-amber-500" />
          </button>

          {/* 4. Theme Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              ref={themeButtonRef}
              type="button"
              data-view-transition="theme-toggle"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              aria-label={currentTheme.label}
              aria-haspopup="true"
              aria-expanded={isThemeMenuOpen}
              title={currentTheme.label}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95 motion-reduce:active:scale-100 duration-100"
            >
              {currentTheme.icon}
            </button>

            {isThemeMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Giao diện
                </div>

                {/* Light Option */}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={themeMode === 'light'}
                  onClick={() => handleSelectMode('light')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Sáng</span>
                  </div>
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                {/* Dark Option */}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={themeMode === 'dark'}
                  onClick={() => handleSelectMode('dark')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Tối</span>
                  </div>
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                {/* System Option */}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={themeMode === 'system'}
                  onClick={() => handleSelectMode('system')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    themeMode === 'system'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-slate-500" />
                    <span>Theo hệ thống</span>
                  </div>
                  {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
