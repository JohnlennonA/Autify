import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="rounded-xl border border-white/10 bg-[#141619] shadow-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icons[toast.type] || icons.success}
          <p className="text-sm font-medium text-slate-200">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
