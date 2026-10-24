import React from 'react';
import { Zap, CheckCircle2, X } from 'lucide-react';

export function NotificationToast({ toast, onDismiss }) {
  if (!toast) return null;

  return (
    <div className="fixed top-16 right-4 sm:right-8 z-50 animate-fade-in max-w-sm w-full">
      <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-indigo-500/40 p-4 rounded-2xl shadow-2xl shadow-indigo-500/20 text-white flex items-start gap-3">
        <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
          <Zap className="w-5 h-5 animate-pulse" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{toast.title}</span>
            </h4>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {toast.detail}
          </p>
          <span className="text-[10px] text-indigo-400 font-mono mt-1.5 block">
            Target: ymahanthreddy.app.n8n.cloud • {new Date(toast.timestamp).toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}

