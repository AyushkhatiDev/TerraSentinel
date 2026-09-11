import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-slate-500 mb-3" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
