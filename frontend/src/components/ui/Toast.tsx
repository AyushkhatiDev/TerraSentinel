import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const severityConfig = {
  critical: { icon: AlertTriangle, bg: 'bg-red-500/10', border: 'border-red-500/40', title: 'text-red-400' },
  high: { icon: AlertCircle, bg: 'bg-orange-500/10', border: 'border-orange-500/40', title: 'text-orange-400' },
  moderate: { icon: AlertCircle, bg: 'bg-amber-500/10', border: 'border-amber-500/40', title: 'text-amber-400' },
  low: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', title: 'text-emerald-400' },
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/40', title: 'text-blue-400' },
  success: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', title: 'text-emerald-400' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.slice(0, 3).map(toast => {
        const config = severityConfig[toast.severity];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto ${config.bg} border ${config.border} rounded-md p-3 shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.title}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${config.title}`}>{toast.title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
