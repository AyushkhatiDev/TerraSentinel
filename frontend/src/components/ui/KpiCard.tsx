import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'slate';
  subtext?: string;
  trend?: string;
}

const colorMap = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  yellow: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-300', icon: 'text-slate-400' },
};

export default function KpiCard({ label, value, icon: Icon, color = 'slate', subtext, trend }: KpiCardProps) {
  const c = colorMap[color];

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg px-3.5 py-3 flex items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.2)]`}>
      <div className={`w-9 h-9 rounded-md flex items-center justify-center ${c.bg} border ${c.border}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0 overflow-hidden">
        <div className="flex items-baseline gap-1.5"><div className={`text-xl leading-none font-bold ${c.text} truncate`}>{value}</div>{trend && <span className="text-[9px] font-medium text-slate-400 shrink-0">{trend}</span>}</div>
        <div className="mt-1 text-[10px] text-slate-400 uppercase tracking-[0.1em] truncate">{label}</div>
        {subtext && <div className="text-[10px] text-slate-500 mt-1 truncate">{subtext}</div>}
      </div>
    </div>
  );
}
