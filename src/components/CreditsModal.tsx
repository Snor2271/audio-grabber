import React, { useEffect, useRef } from 'react';
import { Award, ExternalLink, Sparkles, Bot, Download, Film, Layers, Code2, X } from 'lucide-react';
import { CREDITS_DATA, CreditItem } from '../data/credits';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose, triggerRef }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Manage body scroll and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger button
      triggerRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const renderIcon = (item: CreditItem) => {
    if (item.avatarUrl) {
      return (
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 dark:border-indigo-500 shadow-xs shrink-0"
          loading="lazy"
        />
      );
    }

    const iconClasses = 'w-5 h-5 text-indigo-600 dark:text-indigo-400';
    let iconElement = <Code2 className={iconClasses} />;

    switch (item.iconName) {
      case 'sparkles':
        iconElement = <Sparkles className={iconClasses} />;
        break;
      case 'bot':
        iconElement = <Bot className={iconClasses} />;
        break;
      case 'download':
        iconElement = <Download className={iconClasses} />;
        break;
      case 'film':
        iconElement = <Film className={iconClasses} />;
        break;
      case 'layers':
        iconElement = <Layers className={iconClasses} />;
        break;
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
        {iconElement}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag bar */}
        <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 id="credits-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Bảng Vinh Danh
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ghi nhận đóng góp, công nghệ mã nguồn mở & công cụ nền tảng
              </p>
            </div>
          </div>

          <button
            ref={firstFocusableRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng vinh danh"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Credits List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CREDITS_DATA.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 shadow-2xs flex items-start gap-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all"
              >
                {renderIcon(item)}

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                    {item.role}
                  </span>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition-colors group"
                      >
                        <span className="truncate">{item.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                      </a>
                    ) : (
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </h3>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
