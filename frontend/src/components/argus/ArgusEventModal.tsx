import { useState, useCallback } from 'react';
import { X, Camera, Send, RotateCcw, Loader2, Radar, FileWarning, CheckCircle2 } from 'lucide-react';
import type { ArgusEvent } from '../../api/client';
import { resetArgusEvent } from '../../api/client';
import { useApp } from '../../context/AppContext';
import ArgusProcessingOverlay from './ArgusProcessingOverlay';

interface ArgusEventModalProps {
  event: ArgusEvent;
  onClose: () => void;
}

export default function ArgusEventModal({ event, onClose }: ArgusEventModalProps) {
  const { addToast, triggerRefresh, setArgusEvent } = useApp();
  const [processing, setProcessing] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSend = useCallback(() => {
    if (sent) return;
    setProcessing(true);
  }, [sent]);

  const handleProcessed = useCallback(() => {
    setProcessing(false);
    setSent(true);
    triggerRefresh();
    addToast({
      title: 'ARGUS DETECTION SENT',
      message: `${event.location} — Risk updated to ${event.risk_score}/100 (${event.risk_level}). Alert & incident created.`,
      severity: 'critical',
    });
  }, [addToast, triggerRefresh, event]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetArgusEvent();
      setArgusEvent(null);
      triggerRefresh();
      addToast({ title: 'ARGUS Event Reset', message: 'Detection cleared — original risk state restored', severity: 'info' });
      onClose();
    } catch {
      addToast({ title: 'ARGUS Reset Error', message: 'Failed to reset ARGUS event state', severity: 'high' });
    } finally {
      setResetting(false);
    }
  };

  const confidencePct = Math.round(event.confidence * 100);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-navy-950/90 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="ARGUS visual detection event">
      <div className="surface flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-navy-600 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-600 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10"><Camera className="h-4 w-4 text-red-300" /></div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-300">ARGUS DETECTION EVENT</div>
              <div className="font-mono text-[10px] text-slate-400">{event.event_id} · EXTERNAL AI MODULE</div>
            </div>
          </div>
          <button aria-label="Close ARGUS event" onClick={onClose} className="rounded p-1 text-slate-400 transition-colors hover:bg-navy-700 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {processing ? (
            <div className="min-h-[420px] flex-1"><ArgusProcessingOverlay onComplete={handleProcessed} /></div>
          ) : (
            <>
              {/* CCTV frame */}
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black">
                <img src={event.frame_url} alt={`Simulated CCTV frame ${event.camera}`} className="h-full w-full object-cover" />
                {/* camera overlay */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1">
                  <span className="critical-pulse" />
                  <span className="font-mono text-[10px] font-bold text-red-300">{event.camera}</span>
                  <span className="text-[10px] font-semibold text-emerald-300">LIVE</span>
                </div>
                <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-slate-200">{event.timestamp}</div>
                <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-red-300">● REC</div>
                <div className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-slate-300">NH-10 · Darjeeling</div>
                {/* detection bounding box */}
                <div className="absolute border-2 border-dashed border-red-500/90 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]" style={{ left: '46%', top: '40%', width: '30%', height: '26%' }}>
                  <div className="absolute -top-6 left-0 rounded-sm bg-red-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">SLOPE MOVEMENT {confidencePct}%</div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Event details */}
              <div className="border-b border-navy-700 px-4 py-3">
                <div className="section-label mb-2">EVENT DETAILS</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {[
                    { label: 'Detection', value: event.detection, full: true },
                    { label: 'Confidence', value: `${confidencePct}%` },
                    { label: 'Camera', value: event.camera },
                    { label: 'Location', value: event.location },
                    { label: 'Timestamp', value: event.timestamp },
                    { label: 'Event ID', value: event.event_id },
                    { label: 'Source', value: 'ARGUS Visual Intelligence' },
                    { label: 'Status', value: '● Detection Confirmed', highlight: true },
                    { label: 'Incident Code', value: event.incident_code || 'Candidate' },
                  ].map(item => (
                    <div key={item.label} className={item.full ? 'col-span-2 sm:col-span-3' : ''}>
                      <div className="section-label mb-0.5">{item.label}</div>
                      <div className={`text-xs font-medium ${item.highlight ? 'text-emerald-400 font-semibold' : 'text-slate-200'}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentinel handoff status & Future integration note */}
              <div className="space-y-2 px-4 py-3">
                {sent ? (
                  <div className="flex w-full items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">Risk updated by ARGUS detection</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{event.location} — Risk score {event.risk_score}/100 · {event.risk_level}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center gap-2 rounded-md border border-blue-500/20 bg-navy-900/60 p-3">
                    <Radar className="h-4 w-4 shrink-0 text-blue-300" />
                    <div className="text-[10px] text-slate-400">Detection validated by ARGUS AI. Send to TerraSentinel to apply the risk update, raise an alert and log an incident.</div>
                  </div>
                )}
                <div className="rounded-md border border-navy-700 bg-navy-900/40 px-3 py-2 text-[9px] leading-relaxed text-slate-500">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Future Integration: </span>
                  ARGUS communicates with TerraSentinel through: ARGUS → Webhook / API → TerraSentinel → Risk Engine → Alerts & Response (simulated for SIH prototype).
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto grid gap-2 border-t border-navy-700 px-4 py-3 sm:grid-cols-[1fr_auto]">
                {!sent ? (
                  <button
                    onClick={handleSend}
                    className="flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/25"
                  >
                    <Send className="h-4 w-4" /> Send to TerraSentinel
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> Event sent — {event.alert_id ? 'Alert created' : 'Waiting'}
                    <FileWarning className="ml-2 h-4 w-4" />
                  </div>
                )}
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex items-center justify-center gap-2 rounded-md border border-navy-600 bg-navy-700 py-2.5 px-4 text-xs font-medium uppercase tracking-wider text-slate-300 transition-colors hover:bg-navy-600 disabled:opacity-50"
                >
                  {resetting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Resetting...</> : <><RotateCcw className="h-3.5 w-3.5" /> Reset ARGUS Event</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}