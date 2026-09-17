import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRiskZones, fetchAlerts, fetchAnalyticsSummary, createIncident } from '../api/client';
import type { RiskZone, Alert, SimulationResponse, AnalyticsSummary } from '../api/client';
import { useApp } from '../context/AppContext';
import KpiCard from '../components/ui/KpiCard';
import RiskMap from '../components/map/RiskMap';
import ZoneDetailPanel from '../components/map/ZoneDetailPanel';
import AlertPanel from '../components/alerts/AlertPanel';
import HazardSimulation from '../components/simulation/HazardSimulation';
import ArgusCard from '../components/argus/ArgusCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { ShieldAlert, AlertTriangle, Activity, Radio, Bell, Map as MapIcon, ChevronRight, RefreshCw, Siren, Radar } from 'lucide-react';

export default function CommandCenter() {
  const navigate = useNavigate();
  const { selectedZoneId, setSelectedZoneId, addToast, refreshKey, simulationRunning } = useApp();
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(false);
      const [z, a, s] = await Promise.all([fetchRiskZones(), fetchAlerts(), fetchAnalyticsSummary()]);
      setZones(z);
      setAlerts(a);
      setSummary(s);
      setLastSynced(new Date());
      // Re-select zone if was selected
      if (selectedZoneId) {
        const found = z.find(zone => zone.id === selectedZoneId);
        if (found) setSelectedZone(found);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedZoneId]);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!simulationRunning) loadData();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [loadData, simulationRunning]);

  const refreshOperationalData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleZoneSelect = (zone: RiskZone) => {
    setSelectedZone(zone);
    setSelectedZoneId(zone.id);
  };

  const handleSimulationUpdate = (updatedZone: RiskZone) => {
    setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    if (selectedZone?.id === updatedZone.id) setSelectedZone(updatedZone);
  };

  const handleSimulationComplete = async (_res: SimulationResponse) => {
    // Reload all data
    await loadData();
  };

  const handleCreateIncident = async () => {
    if (!selectedZone) return;
    try {
      await createIncident({
        location: selectedZone.name,
        type: 'Landslide',
        risk_score: selectedZone.risk_score,
        severity: selectedZone.risk_level,
        description: `${selectedZone.risk_level} risk event detected at ${selectedZone.name}. Risk Score: ${selectedZone.risk_score}/100.`,
        cause: 'Heavy Rainfall + Ground Movement',
        zone_id: selectedZone.id,
      });
      addToast({ title: 'Incident Created', message: `Incident created for ${selectedZone.name}`, severity: 'success' });
      await loadData();
    } catch {
      addToast({ title: 'Error', message: 'Failed to create incident', severity: 'high' });
    }
  };

  if (loading) return <LoadingState message="Loading Command Center..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const activeAlerts = alerts.filter(alert => alert.status === 'Active');
  const priorityZones = [...zones]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 3);

  return (
    <div className="h-full min-h-[650px] flex flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="live-dot" /> Live operational picture</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Disaster Risk Command Center</h1>
          <p className="mt-1 text-xs text-slate-400">Real-time hazard intelligence, early warning and coordinated response across North-East India.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800/80 px-3 py-2 text-[10px] text-slate-400">
            <MapIcon className="h-3.5 w-3.5 text-blue-300" /> LIVE COVERAGE <ChevronRight className="h-3 w-3" /> <span className="font-semibold text-slate-200">{zones.length} zones</span>
          </div>
          <button type="button" onClick={refreshOperationalData} disabled={refreshing} className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-[10px] font-semibold text-slate-300 transition-all hover:border-blue-400/50 hover:text-white cursor-pointer active:scale-[0.98] disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 text-blue-300 ${refreshing ? 'animate-spin' : ''}`} /> REFRESH
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard label="Critical Zones" value={summary?.critical_zones ?? 0} icon={ShieldAlert} color="red" subtext="Require action" />
        <KpiCard label="High Risk" value={summary?.high_risk ?? 0} icon={AlertTriangle} color="orange" subtext="Under surveillance" />
        <KpiCard label="Active Incidents" value={summary?.active_incidents ?? 0} icon={Activity} color="yellow" subtext="Response tracked" />
        <KpiCard label="Active Sensors" value={summary?.active_sensors ?? 42} icon={Radio} color="green" subtext="Feeds healthy" />
        <KpiCard label="Active Alerts" value={summary?.active_alerts ?? 0} icon={Bell} color="blue" subtext="Unresolved" />
      </div>

      {/* Main content: Map + Side panels */}
      <div className="flex-1 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px] min-h-0">
        {/* Map area */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex-1 min-h-[470px]">
            <RiskMap zones={zones} onZoneSelect={handleZoneSelect} selectedZoneId={selectedZoneId} />
          </div>
          <div className="surface grid grid-cols-1 gap-3 p-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-center gap-3 border-b border-navy-700 pb-3 sm:border-b-0 sm:border-r sm:pr-4 sm:pb-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10"><Siren className="h-4 w-4 text-red-300" /></div>
              <div><div className="section-label">Active alert queue</div><div className="mt-1 text-lg font-bold text-white font-mono">{activeAlerts.length}</div></div>
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between"><span className="section-label">Priority watchlist</span><span className="text-[10px] text-slate-500 font-mono">Updated {lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
                {priorityZones.map(zone => <button key={zone.id} type="button" onClick={() => handleZoneSelect(zone)} className={`flex min-w-0 items-center justify-between rounded-md px-2.5 py-2 text-left transition-all cursor-pointer border ${selectedZoneId === zone.id ? 'bg-navy-700 border-blue-400/60 shadow-sm' : 'bg-navy-900/75 border-navy-700/60 hover:bg-navy-800 hover:border-blue-400/40'}`}>
                  <span className="truncate text-[11px] font-medium text-slate-200">{zone.name.split('—')[0].trim()}</span>
                  <span className={`ml-2 font-mono text-[11px] font-bold ${zone.risk_score >= 75 ? 'text-red-300' : zone.risk_score >= 50 ? 'text-orange-300' : 'text-amber-300'}`}>{zone.risk_score}</span>
                </button>)}
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <aside className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden min-h-0 min-w-0">
          {/* Zone detail or Simulation */}
          {selectedZone ? (
            <ZoneDetailPanel
              zone={selectedZone}
              onClose={() => { setSelectedZone(null); setSelectedZoneId(null); }}
              onCreateIncident={handleCreateIncident}
            />
          ) : (
            <div className="surface p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10"><Radar className="h-4 w-4 text-blue-300" /></div>
              <p className="text-xs font-semibold text-slate-200">Select a risk zone</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Choose a zone on the GIS layer to inspect live conditions and coordinate response.</p>
            </div>
          )}

          {/* ARGUS Visual Intelligence */}
          <ArgusCard />

          {/* Simulation controls */}
          <HazardSimulation
            onUpdate={handleSimulationUpdate}
            onComplete={handleSimulationComplete}
            zoneId={1}
          />

          {/* Alert panel */}
          <AlertPanel alerts={alerts} onAlertClick={() => navigate('/alerts')} />
        </aside>
      </div>
    </div>
  );
}
