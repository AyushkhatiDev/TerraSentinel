import { useEffect, useState } from 'react';
import { fetchDataSources, fetchArgusEvent } from '../api/client';
import type { DataSource, ArgusEvent } from '../api/client';
import { useApp } from '../context/AppContext';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import {
  Camera, Cloud, Droplets, Satellite, Map, Users, CheckCircle,
  Radio, Clock, ExternalLink, Wifi, ServerCog, Activity, Eye,
  Zap, Loader2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'ARGUS Visual Intelligence': Camera,
  'IMD Weather Data': Cloud,
  'Soil Moisture Sensors': Droplets,
  'Satellite Remote Sensing': Satellite,
  'GIS / DEM Data': Map,
  'Citizen Reports': Users,
};

const statusColor: Record<string, string> = {
  Connected: 'text-emerald-300', Active: 'text-emerald-300', Available: 'text-blue-300', Offline: 'text-red-300',
};

function relativeTime(date?: string) {
  if (!date) return '—';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60_000));
  return minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} hr ago`;
}

export default function DataSources() {
  const { addToast, refreshKey, argusEvent, setArgusEvent, setShowArgusEvent } = useApp();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [testingFeeds, setTestingFeeds] = useState(false);

  const handleTestFeeds = async () => {
    if (testingFeeds) return;
    setTestingFeeds(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast({
      title: 'Ingestion Bus Verified',
      message: 'All 6 external sensor & vision feeds active. Average gateway latency: 14 ms.',
      severity: 'success',
    });
    setTestingFeeds(false);
  };

  const handleViewEvent = async () => {
    let event: ArgusEvent | null = argusEvent;
    if (!event) {
      try { event = await fetchArgusEvent(); } catch { return; }
    }
    if (event) {
      setArgusEvent(event);
      setShowArgusEvent(true);
    }
  };

  const loadData = async () => {
    try {
      setError(false);
      setSources(await fetchDataSources());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  if (loading) return <LoadingState message="Loading data sources..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const healthySources = sources.filter(source => ['Connected', 'Active', 'Available'].includes(source.status));
  const totalFeeds = sources.reduce((total, source) => total + source.active_count, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="live-dot" /> Ingestion health</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Data Sources</h1>
          <p className="mt-1 text-xs text-slate-400">External intelligence feeds monitored by TerraSentinel.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="surface-subtle flex items-center gap-2 px-3 py-2 text-[10px] text-slate-400"><Clock className="h-3.5 w-3.5 text-blue-300" /> Source status is simulated for this prototype.</div>
          <button
            type="button"
            onClick={handleTestFeeds}
            disabled={testingFeeds}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {testingFeeds ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>Ping Feeds</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Healthy feeds', value: `${healthySources.length}/${sources.length}`, icon: Wifi, color: 'text-emerald-300' },
          { label: 'Live endpoints', value: totalFeeds.toLocaleString(), icon: Radio, color: 'text-blue-300' },
          { label: 'External AI modules', value: sources.filter(source => source.name.includes('ARGUS')).length, icon: ServerCog, color: 'text-amber-300' },
        ].map(item => <div key={item.label} className="surface flex items-center gap-3 px-4 py-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-md border border-navy-600 bg-navy-900 ${item.color}`}><item.icon className="h-4 w-4" /></div>
          <div><div className="text-lg font-bold text-white">{item.value}</div><div className="text-[10px] uppercase tracking-[0.11em] text-slate-500">{item.label}</div></div>
        </div>)}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 min-w-0">
        {sources.map(source => {
          const Icon = iconMap[source.name] || Radio;
          const isArgus = source.name.includes('ARGUS');
          let metadata: Record<string, unknown> = {};
          try { metadata = JSON.parse(source.metadata_info || '{}') as Record<string, unknown>; } catch { /* optional malformed metadata */ }
          const detection = typeof metadata.detection === 'string' ? metadata.detection : '';
          const isSelected = selectedSourceId === source.id;

          return (
            <div
              key={source.id}
              onClick={() => setSelectedSourceId(isSelected ? null : source.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedSourceId(isSelected ? null : source.id);
                }
              }}
              role="button"
              tabIndex={0}
              className={`surface w-full p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-500 cursor-pointer ${
                isSelected ? 'border-blue-400/60 ring-1 ring-blue-400/60' : ''
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-navy-600 bg-navy-900"><Icon className="h-5 w-5 text-slate-300" /></div>
                  <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{source.name}</h3><p className="mt-0.5 text-[10px] text-slate-400">{source.type}</p></div>
                </div>
                <span className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold ${statusColor[source.status] || 'text-slate-400'}`}><CheckCircle className="h-3.5 w-3.5" />{source.status}</span>
              </div>

              <dl className="space-y-2 border-y border-navy-700 py-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{isArgus ? 'Input' : 'Source'}</dt>
                  <dd className="truncate text-right text-slate-200">{isArgus ? 'CCTV / RTSP' : source.source || '—'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{isArgus ? 'Output' : 'Mode'}</dt>
                  <dd className={`font-medium ${isArgus ? 'text-blue-300' : 'text-amber-300'}`}>
                    {isArgus ? 'Visual Detection Events' : source.mode}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{isArgus ? 'Cameras' : 'Active endpoints'}</dt>
                  <dd className="text-slate-200">{isArgus ? '04 Active' : source.active_count || '—'}</dd>
                </div>
                {isArgus && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Integration</dt>
                    <dd className="font-mono text-slate-300">Webhook / API</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{isArgus ? 'Last event' : 'Last signal'}</dt>
                  <dd className="flex items-center gap-1 text-slate-200">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {isArgus && argusEvent ? `${argusEvent.timestamp}` : relativeTime(source.last_updated)}
                  </dd>
                </div>
              </dl>

              {isArgus && (
                <div className="mt-3 rounded-md border border-amber-500/25 bg-amber-500/5 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-amber-300" />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-200">External AI module · Simulated</span>
                    </div>
                    <span className="font-mono text-[9px] text-amber-300 font-bold">MODE: SIMULATED</span>
                  </div>
                  <div className="text-xs font-medium text-amber-200">
                    {argusEvent?.detection || detection || 'Ground Movement Detected (Standby)'}
                  </div>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-slate-400">
                    ARGUS operates as an independent visual-intelligence module. Detection events are transmitted via API to TerraSentinel.
                  </p>
                </div>
              )}

              {isArgus && argusEvent && (
                <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-red-300" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-300">Active ARGUS Detection</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">● CONFIRMED</span>
                  </div>
                  <div className="text-xs font-semibold text-white">{argusEvent.detection}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-300">
                    {argusEvent.camera} · {(argusEvent.confidence * 100).toFixed(0)}% · {argusEvent.timestamp} · {argusEvent.location}
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleViewEvent();
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/20"
                  >
                    <Eye className="h-3 w-3" /> View Event
                  </button>
                </div>
              )}
              {isSelected && !isArgus && <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-blue-300"><Activity className="h-3.5 w-3.5" /> Monitoring details selected</div>}
            </div>
          );
        })}
      </div>

      <p className="pb-4 text-center text-[9px] uppercase tracking-[0.14em] text-slate-500">All listed sources are simulated prototype inputs</p>
    </div>
  );
}
