import React, { useState } from 'react';
import { Smartphone, ChevronDown, ChevronUp, DownloadCloud } from 'lucide-react';

export const SafariTip: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-medium text-slate-800 dark:text-slate-200"
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Mẹo tải file về iPhone / iPad qua Safari</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px] leading-relaxed">
          <div className="flex items-start gap-2">
            <DownloadCloud className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong>1. Bấm nút "Tải về":</strong> Safari sẽ hiện thông báo xác nhận <em>"Bạn có muốn tải về...?"</em>. Hãy bấm <strong>Tải về</strong>.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-500">2.</span>
            <div>
              <strong>Xem file đã tải:</strong> Nhìn vào biểu tượng mũi tên xanh tải về trên thanh địa chỉ Safari, hoặc mở ứng dụng <strong>Tệp (Files) &gt; Tải về (Downloads)</strong>.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-500">3.</span>
            <div>
              <strong>Không hao RAM:</strong> Ứng dụng dùng link trực tiếp tiêu chuẩn thay vì nạp blob vào bộ nhớ, giúp Safari không bị giật lag hay tự tải lại trang.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
