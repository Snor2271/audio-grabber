import React from 'react';
import { Award, ExternalLink, Sparkles, Bot, Download, Film, Layers, Code2 } from 'lucide-react';
import { CREDITS_DATA, CreditItem } from '../data/credits';

export const CreditsSection: React.FC = () => {
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
    <section aria-labelledby="credits-title" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-500" />
        <h2 id="credits-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
          Bảng Vinh Danh
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CREDITS_DATA.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs flex items-start gap-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all"
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
    </section>
  );
};
