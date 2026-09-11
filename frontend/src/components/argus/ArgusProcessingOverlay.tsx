import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Cpu } from 'lucide-react';

const STEPS = [
  'ARGUS EVENT RECEIVED',
  'VALIDATING EVENT',
  'RISK ENGINE ANALYSIS',
  'RISK UPDATED',
];

interface ArgusProcessingOverlayProps {
  onComplete: () => void;
}

export default function ArgusProcessingOverlay({ onComplete }: ArgusProcessingOverlayProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];

    const run = (index: number) => {
      if (cancelled) return;
      setCurrent(index);
      if (index >= STEPS.length) {
        timeouts.push(window.setTimeout(() => { if (!cancelled) onComplete(); }, 700));
        return;
      }
      timeouts.push(window.setTimeout(() => run(index + 1), 750));
    };

    run(0);
    return () => { cancelled = true; timeouts.forEach(t => window.clearTimeout(t)); };
  }, [onComplete]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-navy-950/95 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <Cpu className="h-4 w-4 text-red-300" />
          <span className="absolute inset-0 rounded-full border border-red-400/40 animate-ping" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">Linking ARGUS → TerraSentinel</div>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-md border px-3.5 py-2.5 transition-all duration-300 ${
                done
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : active
                  ? 'border-red-500/40 bg-red-500/10'
                  : 'border-navy-600 bg-navy-900/40 opacity-50'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-red-300" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-navy-500 text-[9px] text-slate-500">
                  {index + 1}
                </span>
              )}
              <span className={`text-xs font-mono ${done ? 'text-emerald-300' : active ? 'text-red-200' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Simulated external AI pipeline</p>
    </div>
  );
}