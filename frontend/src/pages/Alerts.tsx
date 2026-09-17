import { useEffect, useMemo, useState } from 'react';
import { fetchAlerts, updateAlertStatus } from '../api/client';
import type { Alert } from '../api/client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { Clock, CheckCircle, FileWarning, BellRing, ChevronRight, ShieldAlert, Search, MapPin } from 'lucide-react';

const tabs = ['All', 'CRITICAL', 'HIGH', 'Resolved'] as const;

function formatTimestamp(value?: string) {
  if (!value) return 'Time unavailable';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Alerts() {
  const navigate = useNavigate();
  const { addToast, refreshKey, setSelectedZoneId } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setError(false);
      setAlerts(await fetchAlerts());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const filtered = useMemo(() => alerts.filter(alert => {
    const matchesTab = activeTab === 'All'
      ? true
      : activeTab === 'Resolved'
      ? ['Resolved', 'Acknowledged'].includes(alert.status)
      : alert.severity === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      alert.location.toLowerCase().includes(q) ||
      alert.message.toLowerCase().includes(q) ||
      (alert.recommendation && alert.recommendation.toLowerCase().includes(q));
    return matchesTab && matchesQuery;
  }), [activeTab, alerts, searchQuery]);

  const handleAcknowledge = async (alert: Alert) => {
    setWorkingId(alert.id);
    try {
      await updateAlertStatus(alert.id, 'Acknowledged');
      addToast({ title: 'Alert acknowledged', message: `${alert.location} moved to the response queue.`, severity: 'info' });
      await loadData();
    } catch {
      addToast({ title: 'Update failed', message: 'The alert could not be acknowledged. Please retry.', severity: 'high' });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) return <LoadingState message="Loading alerts..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const active = alerts.filter(alert => alert.status === 'Active');
  const critical = active.filter(alert => alert.severity === 'CRITICAL');

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300"><span className="critical-pulse" /> Emergency notification queue</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Alert Center</h1>
          <p className="mt-1 text-xs text-slate-400">Triage, acknowledge and escalate hazard notifications.</p>
        </div>
        <div className="surface-subtle flex items-center gap-2 px-3 py-2 text-[10px] text-slate-400"><BellRing className="h-3.5 w-3.5 text-amber-300" /> {active.length} active notifications</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Active queue', value: active.length, tone: 'text-blue-300' },
          { label: 'Critical now', value: critical.length, tone: 'text-red-300' },
          { label: 'High priority', value: active.filter(alert => alert.severity === 'HIGH').length, tone: 'text-orange-300' },
          { label: 'Acknowledged', value: alerts.filter(alert => alert.status === 'Acknowledged').length, tone: 'text-emerald-300' },
        ].map(item => <div key={item.label} className="surface px-4 py-3"><div className={`text-xl font-bold ${item.tone}`}>{item.value}</div><div className="mt-1 text-[10px] uppercase tracking-[0.11em] text-slate-500">{item.label}</div></div>)}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-900/60 p-2.5 rounded-lg border border-navy-700/70">
        <div className="flex w-full gap-1 overflow-x-auto rounded-lg sm:w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-navy-700 text-white shadow-sm border border-navy-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search alerts by location or note..."
            className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState message="No alerts match the selected criteria" /> : <div className="grid gap-3 xl:grid-cols-2">
        {filtered.map(alert => <article key={alert.id} className={`surface overflow-hidden ${alert.severity === 'CRITICAL' && alert.status === 'Active' ? 'border-red-500/45' : ''}`}>
          <div className="flex items-start justify-between gap-3 px-4 pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${alert.severity === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-amber-500/25 bg-amber-500/10 text-amber-300'}`}><ShieldAlert className="h-4 w-4" /></div>
              <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-white">{alert.location}</h2><div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500"><Clock className="h-3 w-3" />{formatTimestamp(alert.created_at)}</div></div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5"><StatusBadge level={alert.severity} /><StatusBadge level={alert.status} /></div>
          </div>
          <div className="px-4 py-4">
            <p className="text-xs leading-relaxed text-slate-300">{alert.message}</p>
            {alert.message.includes('ARGUS') && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-red-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-red-300 border border-red-500/25">
                  SOURCE: ARGUS VISUAL INTELLIGENCE
                </span>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-amber-300 border border-amber-500/25">
                  SIMULATED IN PROTOTYPE
                </span>
              </div>
            )}
            {alert.recommendation && <div className="mt-3 rounded-md border border-navy-600 bg-navy-900/70 p-2.5 text-[11px] leading-relaxed text-slate-400"><span className="mr-1 font-semibold uppercase tracking-[0.1em] text-slate-500">Recommended</span>{alert.recommendation}</div>}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-navy-700 bg-navy-900/35 px-4 py-3">
            {alert.status === 'Active' && <button type="button" disabled={workingId === alert.id} onClick={() => handleAcknowledge(alert)} className="flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 disabled:opacity-50 cursor-pointer"><CheckCircle className="h-3.5 w-3.5" />{workingId === alert.id ? 'Acknowledging…' : 'Acknowledge'}</button>}
            <button type="button" onClick={() => navigate('/incidents')} className="flex items-center gap-1.5 rounded-md border border-navy-600 bg-navy-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:border-orange-400/40 hover:text-white cursor-pointer"><FileWarning className="h-3.5 w-3.5 text-orange-300" /> Open incidents <ChevronRight className="h-3.5 w-3.5" /></button>
            {alert.zone_id && (
              <button
                type="button"
                onClick={() => {
                  setSelectedZoneId(alert.zone_id);
                  navigate('/risk-analysis', { state: { zoneId: alert.zone_id } });
                }}
                className="flex items-center gap-1.5 rounded-md border border-navy-600 bg-navy-800/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:border-blue-400/40 hover:text-white cursor-pointer ml-auto"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-400" /> View Zone
              </button>
            )}
          </div>
        </article>)}
      </div>}
    </div>
  );
}
