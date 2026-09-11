import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Radio, ShieldCheck } from 'lucide-react';

export default function TopNav({ title }: { title: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-navy-900/95 border-b border-navy-700 flex items-center justify-between px-5 shrink-0 gap-4 overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <h2 className="text-xs font-semibold text-white tracking-[0.12em] shrink-0">{title}</h2>
        <span className="hidden lg:block h-4 w-px bg-navy-600 shrink-0" />
        <span className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-500 shrink-0"><ShieldCheck className="h-3 w-3" /> NATIONAL DISASTER READINESS NETWORK</span>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        {/* Demo mode */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
          <Radio className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 tracking-wider">DEMO MODE</span>
        </div>

        {/* Region */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>North-East India</span>
        </div>

        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* User */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300">
          <User className="w-3.5 h-3.5" />
          <span>Disaster Control Authority</span>
        </div>
      </div>
    </header>
  );
}
