import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchRiskZone, fetchRiskZones, fetchRiskTrend, fetchRainfallRisk } from '../api/client';
import type { RiskZone, TimeSeriesPoint } from '../api/client';
import { useApp } from '../context/AppContext';
import RiskGauge from '../components/ui/RiskGauge';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { CloudRain, Droplets, Mountain, Activity, History, MapPin, CheckCircle, Send, Camera, ChevronDown } from 'lucide-react';

export default function RiskAnalysis() {
  const location = useLocation();
  const { selectedZoneId, setSelectedZoneId, addToast, refreshKey, argusEvent } = useApp();
  const [zoneId, setZoneId] = useState<number>(
    (location.state as any)?.zoneId || selectedZoneId || 1
  );
  const [allZones, setAllZones] = useState<RiskZone[]>([]);
  const [zone, setZone] = useState<RiskZone | null>(null);
  const [trendData, setTrendData] = useState<TimeSeriesPoint[]>([]);
  const [rainfallData, setRainfallData] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRiskZones().then(setAllZones).catch(() => {});
  }, [refreshKey]);

  const loadData = async () => {
    try {
      setError(false);
      const [z, t, r] = await Promise.all([
        fetchRiskZone(zoneId),
        fetchRiskTrend(zoneId),
        fetchRainfallRisk(zoneId),
      ]);
      setZone(z);
      setTrendData(t);
      setRainfallData(r);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [zoneId, refreshKey]);

  const handleZoneChange = (newId: number) => {
    setZoneId(newId);
    setSelectedZoneId(newId);
  };

  if (loading) return <LoadingState message="Loading risk analysis..." />;
  if (error) return <ErrorState onRetry={loadData} />;
  if (!zone) return <ErrorState message="Zone not found" />;

  const evidence = [
    { check: zone.rainfall > 80, label: 'Heavy rainfall' },
    { check: zone.soil_moisture > 70, label: 'High soil moisture' },
    { check: zone.ground_movement, label: 'Ground movement detected' },
    { check: zone.slope > 30, label: 'High slope angle' },
    { check: zone.historical_risk === 'High', label: 'Historical susceptibility' },
    { check: zone.terrain_risk === 'High', label: 'Terrain risk factor' },
    { check: !!argusEvent, label: 'ARGUS visual detection' },
  ];

  const actions = zone.risk_level === 'CRITICAL'
    ? ['Dispatch field response team', 'Restrict affected road corridor', 'Issue citizen warning']
    : zone.risk_level === 'HIGH'
    ? ['Increase monitoring frequency', 'Prepare response team', 'Notify authorities']
    : ['Continue standard monitoring', 'Review rainfall trend'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
            <span className="live-dot" /> Multi-Sensor Risk Evaluation
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Risk Analysis & Diagnostics</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{zone.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium">{zone.region}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Zone Switcher Dropdown */}
          {allZones.length > 0 && (
            <div className="relative">
              <label htmlFor="zone-select" className="sr-only">Select Monitored Zone</label>
              <select
                id="zone-select"
                value={zoneId}
                onChange={(e) => handleZoneChange(Number(e.target.value))}
                className="appearance-none bg-navy-800 border border-navy-600 hover:border-blue-400/50 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer shadow-sm transition-all"
              >
                {allZones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-navy-900 text-white">
                    {z.name} ({z.risk_score}/100 · {z.risk_level})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
          <StatusBadge level={zone.risk_level} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: Gauge + Metrics */}
        <div className="space-y-3">
          {/* Gauge */}
          <div className="surface flex justify-center py-6">
            <RiskGauge score={zone.risk_score} size={180} />
          </div>

          {/* Metrics */}
          <div className="surface space-y-3 p-4">
            <div className="section-label">Risk Factors</div>
            {[
              { icon: CloudRain, label: 'Rainfall', value: `${zone.rainfall} mm / 24h` },
              { icon: Droplets, label: 'Soil Moisture', value: `${zone.soil_moisture}%` },
              { icon: Mountain, label: 'Slope', value: `${zone.slope}°` },
              { icon: Activity, label: 'Ground Movement', value: zone.ground_movement ? 'Detected' : 'Normal' },
              { icon: History, label: 'Historical Risk', value: zone.historical_risk },
              { icon: MapPin, label: 'Terrain Risk', value: zone.terrain_risk },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <m.icon className="w-3.5 h-3.5" />
                  {m.label}
                </div>
                <span className="text-xs font-medium text-slate-200">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Evidence */}
          <div className="surface p-4">
            <div className="section-label mb-3">AI / Data Evidence</div>
            <div className="space-y-1.5">
              {evidence.map(e => (
                <div key={e.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`w-3.5 h-3.5 ${e.check ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span className={e.check ? 'text-slate-200' : 'text-slate-500'}>{e.label}</span>
                </div>
              ))}
            </div>
            {argusEvent && (
              <div className="mt-3 rounded-md border border-red-500/35 bg-red-500/10 p-3">
                <div className="mb-2 flex items-center justify-between border-b border-red-500/20 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-300">ARGUS DETECTION</span>
                  </div>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-red-300 border border-red-500/30">
                    SOURCE: ARGUS
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">{argusEvent.detection}</div>
                <div className="mt-2 space-y-1 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-bold text-emerald-300">{Math.round(argusEvent.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Camera:</span>
                    <span className="text-slate-200">{argusEvent.camera}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-slate-200">{argusEvent.timestamp}</span>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-slate-400 border-t border-navy-700/60 pt-1.5">
                  Visual evidence contributing to multi-sensor risk assessment.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Charts + Actions */}
        <div className="space-y-3">
          {/* Risk Trend */}
          <div className="surface p-4">
            <div className="section-label mb-4">Risk Trend — Last 24 Hours</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} interval={3} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                  <Tooltip
                    contentStyle={{ background: '#151f36', border: '1px solid #243556', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} fill="url(#riskGrad)" name="Risk Score" />
                  <ReferenceLine y={75} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'CRITICAL (75)', fill: '#f87171', fontSize: 9, position: 'insideTopRight' }} />
                  <ReferenceLine y={50} stroke="#ea580c" strokeDasharray="3 3" label={{ value: 'HIGH (50)', fill: '#fb923c', fontSize: 9, position: 'insideTopRight' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rainfall vs Risk */}
          <div className="surface p-4">
            <div className="section-label mb-4">Rainfall vs Risk Correlation</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rainfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                  <Tooltip
                    contentStyle={{ background: '#151f36', border: '1px solid #243556', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="surface p-4">
            <div className="section-label mb-3">Recommended Actions</div>
            <div className="flex flex-wrap gap-2">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => addToast({ title: 'Action Initiated', message: action, severity: 'success' })}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  {action}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-slate-500 text-center uppercase tracking-wider">
            Prototype Risk Engine — Not a scientifically validated production model
          </p>
        </div>
      </div>
    </div>
  );
}
