import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQ_DATA } from '../data/faq';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % FAQ_DATA.length;
      const el = document.getElementById(`faq-btn-${FAQ_DATA[nextIndex].id}`);
      el?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + FAQ_DATA.length) % FAQ_DATA.length;
      const el = document.getElementById(`faq-btn-${FAQ_DATA[prevIndex].id}`);
      el?.focus();
    }
  };

  return (
    <section aria-labelledby="faq-title" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 id="faq-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
          Câu Hỏi Thường Gặp
        </h2>
      </div>

      <div className="space-y-2" role="region" aria-label="Danh sách câu hỏi thường gặp">
        {FAQ_DATA.map((item, index) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs transition-colors"
            >
              <button
                type="button"
                id={`faq-btn-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${item.id}`}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index, item.id)}
                className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer select-none"
              >
                <span className="flex-1 leading-snug">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                />
              </button>

              <div
                id={`faq-content-${item.id}`}
                role="region"
                aria-labelledby={`faq-btn-${item.id}`}
                className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
