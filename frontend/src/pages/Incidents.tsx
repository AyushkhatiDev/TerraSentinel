import { useState, useEffect } from 'react';
import { fetchIncidents, updateIncident } from '../api/client';
import type { Incident } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import {
  X, Users, Bell, CheckCircle, AlertTriangle, MapPin,
  ChevronRight, Loader2, Send, Shield, Camera
} from 'lucide-react';

export default function Incidents() {
  const { addToast, refreshKey } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  const loadData = async () => {
    try {
      setError(false);
      const data = await fetchIncidents();
      setIncidents(data);
      if (selected) {
        const updated = data.find(i => i.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleDispatch = async () => {
    if (!selected) return;
    setDispatching(true);
    try {
      await updateIncident(selected.id, {
        status: 'Field Response Active',
        team_assigned: 'Team Alpha',
        team_eta: '12 min',
      });
      addToast({ title: 'Field Team Dispatched', message: `Team Alpha assigned to ${selected.location}. ETA: 12 min`, severity: 'success' });
      await loadData();
    } catch {
      addToast({ title: 'Error', message: 'Failed to dispatch team', severity: 'high' });
    } finally {
      setDispatching(false);
    }
  };

  const handleCitizenAlert = async () => {
    if (!selected) return;
    setSendingAlert(true);
    try {
      await updateIncident(selected.id, {
        citizen_alert_sent: true,
        citizen_alert_count: 1248,
      });
      addToast({ title: 'Citizen Alert Sent', message: `Alert issued to 1,248 nearby users (SIMULATED)`, severity: 'success' });
      await loadData();
    } catch {
      addToast({ title: 'Error', message: 'Failed to send citizen alert', severity: 'high' });
    } finally {
      setSendingAlert(false);
    }
  };

  const handleResolve = async () => {
    if (!selected) return;
    try {
      await updateIncident(selected.id, { status: 'Resolved' });
      addToast({ title: 'Incident Resolved', message: `${selected.incident_code} marked as resolved`, severity: 'info' });
      await loadData();
    } catch {
      addToast({ title: 'Error', message: 'Failed to resolve incident', severity: 'high' });
    }
  };

  if (loading) return <LoadingState message="Loading incidents..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const timeline = selected ? [
    { label: 'Hazard detected', done: true },
    { label: 'Risk assessed', done: true },
    { label: 'Alert generated', done: true },
    { label: 'Authority notified', done: selected.status !== 'Active' },
    { label: 'Field team dispatched', done: selected.team_assigned !== '' },
    { label: 'Citizen alert issued', done: selected.citizen_alert_sent },
    { label: 'Incident resolved', done: selected.status === 'Resolved' },
  ] : [];

  return (
    <div className="flex h-full min-h-[650px] flex-col">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-300"><span className="critical-pulse" /> Response coordination</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Incident Management</h1>
          <p className="mt-1 text-xs text-slate-400">Track operational status, dispatch teams and issue public warnings.</p>
        </div>
        <div className="surface-subtle px-3 py-2 text-[10px] text-slate-400"><span className="font-semibold text-slate-200">{incidents.filter(incident => incident.status !== 'Resolved').length}</span> active of {incidents.length} total incidents</div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_370px] min-h-0">
        {/* Table */}
        <div className="surface overflow-hidden flex flex-col min-h-[380px] min-w-0">
          <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900/40 px-4 py-3"><span className="section-label">Incident queue</span><span className="text-[10px] text-slate-500">Select a record to coordinate response</span></div>
          <div className="overflow-auto flex-1">
            {incidents.length === 0 ? (
              <EmptyState message="No incidents recorded" />
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-600 bg-navy-900/70">
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">ID</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Location</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Type</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Risk</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Detected</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(inc => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelected(inc)}
                      className={`border-b border-navy-700 cursor-pointer transition-colors ${
                        selected?.id === inc.id ? 'bg-blue-500/10' : 'hover:bg-navy-700/50'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-slate-200">{inc.incident_code}</td>
                      <td className="px-4 py-3 text-slate-300">{inc.location}</td>
                      <td className="px-4 py-3 text-slate-400">{inc.type}</td>
                      <td className="px-4 py-3"><StatusBadge level={inc.severity} /></td>
                      <td className="px-4 py-3 text-slate-400">{inc.detected_at}</td>
                      <td className="px-4 py-3"><StatusBadge level={inc.status} /></td>
                      <td className="px-4 py-3 text-slate-500"><ChevronRight className="w-4 h-4" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="surface overflow-y-auto">
          {selected ? (
            <div>
              <div className="flex items-center justify-between border-b border-navy-600 px-4 py-3">
                <div>
                  <div className="section-label mb-1">Selected incident</div><span className="font-mono text-sm font-bold text-white">{selected.incident_code}</span>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selected.location}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-navy-700 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Risk Score</span>
                  <span className="font-bold text-white">{selected.risk_score}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Severity</span>
                  <StatusBadge level={selected.severity} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Detected</span>
                  <span className="text-slate-200">{selected.detected_at}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 text-xs">
                  <span className="text-slate-400">Cause</span>
                  <span className="text-slate-200 text-right max-w-[180px]">{selected.cause || '—'}</span>
                </div>
                {selected.cause?.includes('ARGUS') && (
                  <div className="col-span-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-red-300">
                      <Camera className="h-3 w-3" /> Detection Source: ARGUS
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white">Evidence: Ground Movement Detected</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">Triggered by external surveillance stream CAM-04 (94% confidence)</div>
                  </div>
                )}
                {selected.description && (
                  <p className="col-span-2 rounded-md bg-navy-900/65 p-2.5 text-xs leading-relaxed text-slate-400">{selected.description}</p>
                )}
              </div>

              {/* Team status */}
              {selected.team_assigned && (
                <div className="px-4 py-3 border-b border-navy-700 bg-emerald-500/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                    <Shield className="w-3.5 h-3.5" /> FIELD RESPONSE ACTIVE
                  </div>
                  <div className="text-xs text-slate-300">{selected.team_assigned} — ETA: {selected.team_eta}</div>
                </div>
              )}

              {/* Citizen alert status */}
              {selected.citizen_alert_sent && (
                <div className="px-4 py-3 border-b border-navy-700 bg-blue-500/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                    <Bell className="w-3.5 h-3.5" /> CITIZEN ALERT SENT
                  </div>
                  <div className="text-xs text-slate-300">Recipients: {selected.citizen_alert_count.toLocaleString()} nearby users</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">Prototype / Simulated</div>
                </div>
              )}

              {/* Timeline */}
              <div className="px-4 py-3 border-b border-navy-700">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Response Timeline</div>
                <div className="space-y-2">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {step.done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                      )}
                      <span className={step.done ? 'text-slate-200' : 'text-slate-500'}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 space-y-2">
                {!selected.team_assigned && selected.status !== 'Resolved' && (
                  <button
                    onClick={handleDispatch}
                    disabled={dispatching}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                  >
                    {dispatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                    Dispatch Field Team
                  </button>
                )}
                {!selected.citizen_alert_sent && selected.status !== 'Resolved' && (
                  <button
                    onClick={handleCitizenAlert}
                    disabled={sendingAlert}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 disabled:opacity-50 transition-colors"
                  >
                    {sendingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Issue Citizen Alert
                  </button>
                )}
                {selected.status !== 'Resolved' && (
                  <button
                    onClick={handleResolve}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium uppercase tracking-wider bg-navy-700 text-slate-300 border border-navy-600 hover:bg-navy-600 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center text-slate-500">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-navy-600 bg-navy-900"><AlertTriangle className="h-5 w-5 text-orange-300" /></div>
              <span className="text-xs font-medium text-slate-300">Select an incident to coordinate response</span>
              <span className="mt-1 text-[10px] leading-relaxed">Dispatch field teams, issue citizen alerts and track resolution from the response panel.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
