import { useState, useEffect, useCallback } from 'react';
import { Camera, Zap, Loader2, Eye, RotateCcw, ChevronRight } from 'lucide-react';
import { fetchArgusStatus, simulateArgusEvent, resetArgusEvent, fetchArgusEvent } from '../../api/client';
import type { ArgusStatus, ArgusEvent } from '../../api/client';
import { useApp } from '../../context/AppContext';


export default function ArgusCard() {
  const { addToast, triggerRefresh, refreshKey, argusEvent, setArgusEvent, setShowArgusEvent } = useApp();
  const [status, setStatus] = useState<ArgusStatus | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await fetchArgusStatus());
    } catch {
      // Non-fatal — card keeps rendering from context if available.
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus, refreshKey]);

  const active = status?.active_event || !!argusEvent;
  const lastDetection = argusEvent?.detection || status?.last_detection;
  const confidence = argusEvent?.confidence ?? status?.confidence;

  const handleSimulate = async () => {
    if (simulating) return;
    setSimulating(true);
    try {
      const event = await simulateArgusEvent();
      setArgusEvent(event);
      setShowArgusEvent(true);
      await loadStatus();
      const stats = await fetchArgusStatus();
      setStatus(stats);
      addToast({
        title: 'ARGUS DETECTION',
        message: `${event.detection} · ${event.camera} · ${Math.round(event.confidence * 100)}% confidence`,
        severity: 'critical',
      });
    } catch {
      addToast({ title: 'ARGUS Simulation Error', message: 'Failed to trigger ARGUS detection event', severity: 'high' });
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetArgusEvent();
      setArgusEvent(null);
      triggerRefresh();
      await loadStatus();
      addToast({ title: 'ARGUS Event Reset', message: 'Detection cleared — original state restored', severity: 'info' });
    } catch {
      addToast({ title: 'ARGUS Reset Error', message: 'Failed to reset ARGUS event state', severity: 'high' });
    } finally {
      setResetting(false);
    }
  };

  const handleView = async () => {
    let event: ArgusEvent | null = argusEvent;
    if (!event) {
      try { event = await fetchArgusEvent(); } catch { /* stay closed */ }
    }
    if (event) {
      setArgusEvent(event);
      setShowArgusEvent(true);
    }
  };

  return (
    <div className="surface p-4 min-w-0 overflow-hidden border-red-500/30">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">
          <Camera className="h-3.5 w-3.5 text-red-400" /> ARGUS Visual Intelligence
        </div>
        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300 border border-amber-500/20">
          EXTERNAL AI MODULE
        </span>
      </div>

      {/* Status line */}
      <div className="mb-2.5 rounded-md border border-navy-600 bg-navy-900/70 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${active ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]' : 'bg-emerald-400'}`} />
            <span className={`text-[11px] font-bold tracking-wide ${active ? 'text-red-300' : 'text-emerald-300'}`}>
              {active ? 'DETECTION ACTIVE' : 'CONNECTED'}
            </span>
          </div>
          {active && (
            <span className="flex items-center gap-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/30">
              <span className="critical-pulse" /> OUTPUT READY
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-navy-700/80 pt-2 text-[10px] text-slate-400 font-mono">
          <span>04 Cameras Connected</span>
          <span>04 RTSP Streams Active</span>
        </div>
      </div>

      {/* Pipeline diagram representation */}
      <div className="mb-3 rounded-md border border-navy-700 bg-navy-900/40 p-2">
        <div className="mb-1 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
          ARGUS INTEGRATION — PROTOTYPE
        </div>
        <div className="flex items-center justify-between gap-0.5 text-[8px] font-semibold text-slate-400">
          <span className="truncate">CCTV/RTSP</span>
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-red-400/70" />
          <span className="truncate text-red-300">ARGUS</span>
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-red-400/70" />
          <span className="truncate">API</span>
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-red-400/70" />
          <span className="truncate text-blue-300">Risk Engine</span>
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-red-400/70" />
          <span className="truncate text-orange-300">Response</span>
        </div>
      </div>

      {/* Last detection */}
      <div className="mb-3 rounded-md border border-navy-600 bg-navy-900/70 p-2.5">
        <div className="section-label mb-1">Latest Detection</div>
        <div className={`text-xs font-semibold ${active ? 'text-red-300' : 'text-slate-300'}`}>
          {lastDetection || 'Awaiting visual detection'}
        </div>
        {active && confidence != null && (
          <div className="mt-1.5 space-y-0.5 border-t border-navy-700/70 pt-1.5 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Location:</span>
              <span className="text-slate-200 font-sans">{argusEvent?.location || 'NH-10 / Darjeeling'}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence:</span>
              <span className="text-emerald-300 font-bold">{(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Camera & Time:</span>
              <span className="text-slate-300">{argusEvent?.camera || 'CAM-04'} · {argusEvent?.timestamp || '14:32:08'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {active ? (
          <>
            <button
              onClick={handleView}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            >
              <Eye className="h-4 w-4" /> View ARGUS Event
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-700 py-2 text-xs font-medium uppercase tracking-wider text-slate-300 transition-colors hover:bg-navy-600 disabled:opacity-50"
            >
              {resetting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Resetting...</> : <><RotateCcw className="h-3.5 w-3.5" /> Reset ARGUS Event</>}
            </button>
          </>
        ) : (
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {simulating ? <><Loader2 className="h-4 w-4 animate-spin" /> Detecting...</> : <><Zap className="h-4 w-4" /> Simulate ARGUS Event</>}
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[9px] uppercase tracking-wider text-slate-500">External visual-intelligence module · Simulated</p>
    </div>
  );
}