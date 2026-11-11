import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ChevronDown, X } from 'lucide-react';
import { FAQ_DATA } from '../data/faq';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, triggerRef }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Toggle single accordion item
  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Keyboard navigation inside FAQ list
  const handleFaqKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % FAQ_DATA.length;
      const el = document.getElementById(`modal-faq-btn-${FAQ_DATA[nextIndex].id}`);
      el?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + FAQ_DATA.length) % FAQ_DATA.length;
      const el = document.getElementById(`modal-faq-btn-${FAQ_DATA[prevIndex].id}`);
      el?.focus();
    }
  };

  // Lock body scroll and manage focus
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first element in modal
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag bar */}
        <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="faq-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Câu Hỏi Thường Gặp
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                10 giải đáp chi tiết về cài đặt, sử dụng & tính năng
              </p>
            </div>
          </div>

          <button
            ref={firstFocusableRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại FAQs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable FAQ Accordion */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-2 text-xs">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  id={`modal-faq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`modal-faq-content-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(e) => handleFaqKeyDown(e, index, item.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer select-none"
                >
                  <span className="flex-1 leading-snug">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
                </button>

                <div
                  id={`modal-faq-content-${item.id}`}
                  role="region"
                  aria-labelledby={`modal-faq-btn-${item.id}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
