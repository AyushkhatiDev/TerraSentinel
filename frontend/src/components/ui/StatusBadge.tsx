interface StatusBadgeProps {
  level: string;
  size?: 'sm' | 'md';
}

const levelStyles: Record<string, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MODERATE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  LOW: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Active: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Monitoring: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Resolved: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Acknowledged: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Field Response Active': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function StatusBadge({ level, size = 'sm' }: StatusBadgeProps) {
  const style = levelStyles[level] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${style} ${sizeClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />{level}
    </span>
  );
}
