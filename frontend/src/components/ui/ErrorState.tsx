import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
      <span className="text-sm mb-1">{message}</span>
      <span className="text-xs text-slate-500 mb-4">Backend connection unavailable</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-navy-700 hover:bg-navy-600 rounded border border-navy-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
