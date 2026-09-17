import { useState, useEffect } from 'react';
import { fetchIncidents, updateIncident, createIncident } from '../api/client';
import type { Incident } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import {
  X, Users, Bell, CheckCircle, AlertTriangle, MapPin,
  ChevronRight, Loader2, Send, Shield, Camera, Search, Plus
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Active', 'Field Response Active', 'Resolved'] as const;

export default function Incidents() {
  const { addToast, refreshKey } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logging, setLogging] = useState(false);

  // New incident form
  const [newLocation, setNewLocation] = useState('Darjeeling — Zone 04');
  const [newType, setNewType] = useState('Landslide');
  const [newSeverity, setNewSeverity] = useState('CRITICAL');
  const [newRiskScore, setNewRiskScore] = useState(85);
  const [newCause, setNewCause] = useState('Heavy Rainfall + Slope Saturation');
  const [newDescription, setNewDescription] = useState('Active slope failure and debris flow reported along the main transit corridor.');

  const loadData = async () => {
    try {
      setError(false);
      const data = await fetchIncidents();
      setIncidents(data);
      if (selected) {
        const updated = data.find(i => i.id === selected.id);
        if (updated) setSelected(updated);
      } else if (data.length > 0 && !selected) {
        setSelected(data[0]);
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
        team_assigned: 'NDRF Team Alpha',
        team_eta: '12 min',
      });
      addToast({ title: 'Field Team Dispatched', message: `NDRF Team Alpha assigned to ${selected.location}. ETA: 12 min`, severity: 'success' });
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
      addToast({ title: 'Citizen Alert Broadcast', message: `Emergency warning issued to 1,248 nearby users (SIMULATED)`, severity: 'success' });
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

  const handleCreateNewIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    setLogging(true);
    try {
      const created = await createIncident({
        location: newLocation,
        type: newType,
        severity: newSeverity,
        risk_score: Number(newRiskScore),
        cause: newCause,
        description: newDescription,
      });
      addToast({
        title: 'Incident Logged',
        message: `${created.incident_code} created for ${created.location}.`,
        severity: 'success',
      });
      setShowLogModal(false);
      await loadData();
      setSelected(created);
    } catch {
      addToast({ title: 'Failed to Log Incident', message: 'Please check your inputs and try again.', severity: 'high' });
    } finally {
      setLogging(false);
    }
  };

  if (loading) return <LoadingState message="Loading incidents..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const filtered = incidents.filter(inc => {
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      inc.incident_code.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q) ||
      inc.type.toLowerCase().includes(q) ||
      (inc.cause && inc.cause.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

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
    <div className="flex h-full min-h-[650px] flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-300">
            <span className="critical-pulse" /> Command & Field Response
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Incident Management</h1>
          <p className="mt-1 text-xs text-slate-400">Track active hazard cases, dispatch emergency units, and broadcast citizen warnings.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="surface-subtle px-3 py-2 text-[10px] text-slate-400 font-mono">
            <span className="font-bold text-slate-200">{incidents.filter(incident => incident.status !== 'Resolved').length}</span> active / {incidents.length} total
          </div>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-white border border-orange-500/40 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-900/60 p-2.5 rounded-lg border border-navy-700/70">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_FILTERS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab
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
            placeholder="Search by ID, location, or type..."
            className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px] min-h-0">
        {/* Table */}
        <div className="surface overflow-hidden flex flex-col min-h-[380px] min-w-0">
          <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900/40 px-4 py-3">
            <span className="section-label">Incident Queue ({filtered.length})</span>
            <span className="text-[10px] text-slate-500">Select a record to view details & mobilize</span>
          </div>
          <div className="overflow-auto flex-1">
            {filtered.length === 0 ? (
              <EmptyState message="No incidents match the selected criteria" />
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-600 bg-navy-900/80">
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
                  {filtered.map(inc => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelected(inc)}
                      className={`border-b border-navy-700/80 cursor-pointer transition-colors ${
                        selected?.id === inc.id ? 'bg-blue-500/15 border-l-2 border-l-blue-400' : 'hover:bg-navy-800/60'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">{inc.incident_code}</td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{inc.location}</td>
                      <td className="px-4 py-3 text-slate-400">{inc.type}</td>
                      <td className="px-4 py-3"><StatusBadge level={inc.severity} /></td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{inc.detected_at}</td>
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
              <div className="flex items-center justify-between border-b border-navy-600 px-4 py-3 bg-navy-900/40">
                <div>
                  <div className="section-label mb-0.5">Active Incident Case</div>
                  <h3 className="font-mono text-base font-bold text-white tracking-wide">{selected.incident_code}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="h-3 w-3 text-blue-400" /> {selected.location}
                  </p>
                </div>
                <StatusBadge level={selected.severity} />
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3 border-b border-navy-700 p-4">
                {[
                  { label: 'Hazard Type', value: selected.type },
                  { label: 'Risk Score', value: `${selected.risk_score} / 100` },
                  { label: 'Detected At', value: selected.detected_at },
                  { label: 'Status', value: selected.status },
                  { label: 'Primary Cause', value: selected.cause || 'Rainfall & Slope', full: true },
                ].map(item => (
                  <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                    <div className="section-label mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-200">{item.value}</div>
                  </div>
                ))}

                {selected.description?.includes('ARGUS') && (
                  <div className="col-span-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-red-300">
                      <Camera className="h-3 w-3" /> Detection Source: ARGUS AI Vision
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white">Evidence: Ground Movement Detected</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">Validated by highway camera CAM-04 (94% confidence)</div>
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
                  <div className="text-xs text-slate-200 font-medium">{selected.team_assigned} — ETA: {selected.team_eta}</div>
                </div>
              )}

              {/* Citizen alert status */}
              {selected.citizen_alert_sent && (
                <div className="px-4 py-3 border-b border-navy-700 bg-blue-500/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                    <Bell className="w-3.5 h-3.5" /> CITIZEN WARNING BROADCAST
                  </div>
                  <div className="text-xs text-slate-200">Recipients: {selected.citizen_alert_count.toLocaleString()} nearby users along corridor</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">Simulated CAP / Cell Broadcast</div>
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
                      <span className={step.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 space-y-2">
                {!selected.team_assigned && selected.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={handleDispatch}
                    disabled={dispatching}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {dispatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                    Dispatch Field Team
                  </button>
                )}
                {!selected.citizen_alert_sent && selected.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={handleCitizenAlert}
                    disabled={sendingAlert}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {sendingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Issue Citizen Alert
                  </button>
                )}
                {selected.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={handleResolve}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium uppercase tracking-wider bg-navy-700 text-slate-300 border border-navy-600 hover:bg-navy-600 transition-all cursor-pointer active:scale-[0.99]"
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

      {/* Log New Incident Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4">
          <div className="surface w-full max-w-lg rounded-xl border border-navy-600 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-navy-600 px-5 py-3.5 bg-navy-900/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Log New Hazard Incident</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-navy-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewIncident} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location / Corridor</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md px-3 py-2 text-slate-200"
                    placeholder="e.g. Darjeeling — Zone 04"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hazard Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md px-3 py-2 text-slate-200"
                  >
                    <option value="Landslide">Landslide</option>
                    <option value="Rockfall">Rockfall</option>
                    <option value="Slope Instability">Slope Instability</option>
                    <option value="Flash Flood">Flash Flood</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md px-3 py-2 text-slate-200"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Score (0–100): {newRiskScore}</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newRiskScore}
                    onChange={e => setNewRiskScore(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Causal Factor</label>
                <input
                  type="text"
                  required
                  value={newCause}
                  onChange={e => setNewCause(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md px-3 py-2 text-slate-200"
                  placeholder="e.g. Heavy Rainfall + Ground Movement"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operational Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-600 focus:border-blue-400 rounded-md px-3 py-2 text-slate-200 resize-none"
                  placeholder="Provide context on road blockages, structural risk, etc."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-navy-700/70">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-md border border-navy-600 bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logging}
                  className="flex items-center gap-2 px-5 py-2 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {logging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Record Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
