import { useState, useEffect } from 'react';
import {
  fetchAnalyticsSummary, fetchRiskTrend, fetchRainfallRisk,
  fetchIncidentsSeverity, fetchResponseTime, fetchRegionDistribution,
} from '../api/client';
import type { AnalyticsSummary, TimeSeriesPoint, RegionRisk } from '../api/client';
import { useApp } from '../context/AppContext';
import KpiCard from '../components/ui/KpiCard';

import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Clock, Bell, CheckCircle, AlertTriangle } from 'lucide-react';

const COLORS = ['#dc2626', '#ea580c', '#d97706', '#16a34a'];

export default function Analytics() {
  const { refreshKey } = useApp();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [riskTrend, setRiskTrend] = useState<TimeSeriesPoint[]>([]);
  const [rainfallRisk, setRainfallRisk] = useState<TimeSeriesPoint[]>([]);
  const [severityData, setSeverityData] = useState<TimeSeriesPoint[]>([]);
  const [responseData, setResponseData] = useState<TimeSeriesPoint[]>([]);
  const [regionData, setRegionData] = useState<RegionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    try {
      setError(false);
      const [s, rt, rr, sv, rs, rd] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchRiskTrend(),
        fetchRainfallRisk(),
        fetchIncidentsSeverity(),
        fetchResponseTime(),
        fetchRegionDistribution(),
      ]);
      setSummary(s);
      setRiskTrend(rt);
      setRainfallRisk(rr);
      setSeverityData(sv);
      setResponseData(rs);
      setRegionData(rd);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  if (loading) return <LoadingState message="Loading analytics..." />;
  if (error) return <ErrorState onRetry={loadData} />;

  const tooltipStyle = {
    contentStyle: { background: '#151f36', border: '1px solid #243556', borderRadius: 6, fontSize: 11 },
    labelStyle: { color: '#94a3b8' },
    itemStyle: { color: '#e2e8f0' },
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300"><span className="live-dot" /> Decision intelligence</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">Operational patterns synthesized from simulated monitoring data.</p>
        </div>
        <div className="surface-subtle px-3 py-2 text-[10px] text-slate-400">24-hour operational view · Prototype data</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Avg Response Time" value={`${summary?.average_response_time ?? 14} min`} icon={Clock} color="green" subtext="Across all teams" />
        <KpiCard label="Alerts Generated" value={summary?.alerts_generated ?? 127} icon={Bell} color="blue" subtext="Historical + active" />
        <KpiCard label="Incidents Resolved" value={summary?.incidents_resolved ?? 94} icon={CheckCircle} color="green" subtext="This cycle" />
        <KpiCard label="Critical Events" value={summary?.critical_events ?? 12} icon={AlertTriangle} color="red" subtext="Escalated events" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-w-0">
        {/* Risk Trend */}
        <div className="surface p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between"><div className="section-label">Risk Trend — Last 24 Hours</div><span className="text-[10px] text-orange-300">Hazard score</span></div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                <Tooltip {...tooltipStyle} />
                <defs>
                  <linearGradient id="riskGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} fill="url(#riskGradA)" name="Risk Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rainfall vs Risk */}
        <div className="surface p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between"><div className="section-label">Rainfall vs Risk Correlation</div><span className="text-[10px] text-blue-300">Trend model</span></div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rainfallRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Severity */}
        <div className="surface p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between"><div className="section-label">Incidents by Severity</div><span className="text-[10px] text-slate-500">Distribution</span></div>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="time"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {severityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time */}
        <div className="surface p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between"><div className="section-label">Response Time Trend</div><span className="text-[10px] text-emerald-300">Minutes</span></div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Distribution by Region */}
      <div className="surface p-4 min-w-0">
        <div className="mb-4 flex items-center justify-between"><div className="section-label">Risk Distribution by Region</div><span className="text-[10px] text-slate-500">Current score / 100</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#1c2a47' }} width={100} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="risk_score" name="Risk Score" radius={[0, 3, 3, 0]}>
                {regionData.map((entry, i) => {
                  const color = entry.risk_level === 'CRITICAL' ? '#dc2626' : entry.risk_level === 'HIGH' ? '#ea580c' : entry.risk_level === 'MODERATE' ? '#d97706' : '#16a34a';
                  return <Cell key={i} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[9px] text-slate-500 text-center uppercase tracking-wider pb-4">
        Prototype analytics based on simulated operational data
      </p>
    </div>
  );
}
