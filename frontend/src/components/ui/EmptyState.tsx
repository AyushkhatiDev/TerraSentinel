import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Inbox className="w-8 h-8 text-slate-500 mb-3" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
