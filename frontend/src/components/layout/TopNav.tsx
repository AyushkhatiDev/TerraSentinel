import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Radio, ShieldCheck, RotateCcw, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resetSimulation, resetArgusEvent } from '../../api/client';

export default function TopNav({ title }: { title: string }) {
  const [time, setTime] = useState(new Date());
  const [resetting, setResetting] = useState(false);
  const { addToast, triggerRefresh, setArgusEvent } = useApp();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await Promise.allSettled([resetSimulation(), resetArgusEvent()]);
      setArgusEvent(null);
      triggerRefresh();
      addToast({
        title: 'Platform Reset',
        message: 'All sensor telemetry, risk levels, and simulated events restored to baseline.',
        severity: 'info',
      });
    } catch {
      addToast({
        title: 'Reset Failed',
        message: 'Could not reset some simulation parameters.',
        severity: 'high',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-14 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/80 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3 overflow-hidden z-20">
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <h2 className="text-xs font-bold text-white tracking-[0.14em] shrink-0 uppercase">{title}</h2>
        <span className="hidden lg:block h-4 w-px bg-navy-600/70 shrink-0" />
        <span className="hidden lg:flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 shrink-0 tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> NORTH-EAST INDIA • DISASTER MONITORING
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Global Reset Demo Button */}
        <button
          type="button"
          onClick={handleGlobalReset}
          disabled={resetting}
          title="Reset entire demonstration back to baseline state"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-navy-800/90 border border-navy-600 hover:border-amber-400/50 hover:bg-navy-700 text-[10px] font-semibold tracking-wider text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.98]"
        >
          {resetting ? (
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
          ) : (
            <RotateCcw className="w-3 h-3 text-amber-400" />
          )}
          <span className="hidden sm:inline">RESET DEMO</span>
        </button>

        {/* Demo mode badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 tracking-wider">DEMO</span>
        </div>

        {/* Region */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-navy-800/60 px-2.5 py-1 rounded-md border border-navy-700/60">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium">North-East India</span>
        </div>

        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-navy-800/60 px-2.5 py-1 rounded-md border border-navy-700/60">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-medium">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* User */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 bg-navy-800/80 px-2.5 py-1 rounded-md border border-navy-700">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <User className="w-3 h-3 text-emerald-300" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Disaster Control Authority</span>
        </div>
      </div>
    </header>
  );
}
