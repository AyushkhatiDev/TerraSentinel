// Local Vite requests use the development proxy. Deployments set this to the
// public Render URL (for example, https://terrasentinel-api.onrender.com).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      const detail = payload?.detail;
      throw new ApiError(
        typeof detail === 'string' ? detail : `Request failed (${res.status})`,
        res.status,
      );
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The service took too long to respond. Please retry.');
    }
    throw new ApiError('Unable to reach the TerraSentinel service.');
  } finally {
    window.clearTimeout(timeout);
  }
}

// ── Risk Zones ──
export const fetchRiskZones = () => request<RiskZone[]>('/api/risk-zones');
export const fetchRiskZone = (id: number) => request<RiskZone>(`/api/risk-zones/${id}`);

// ── Risk Analysis ──
export const analyzeRisk = (data: RiskAnalyzeRequest) =>
  request<RiskAnalyzeResponse>('/api/risk/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Incidents ──
export const fetchIncidents = () => request<Incident[]>('/api/incidents');
export const fetchIncident = (id: number) => request<Incident>(`/api/incidents/${id}`);
export const createIncident = (data: IncidentCreate) =>
  request<Incident>('/api/incidents', { method: 'POST', body: JSON.stringify(data) });
export const updateIncident = (id: number, data: Partial<Incident>) =>
  request<Incident>(`/api/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ── Alerts ──
export const fetchAlerts = (params?: { status?: string; severity?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.severity) query.set('severity', params.severity);
  const qs = query.toString();
  return request<Alert[]>(`/api/alerts${qs ? `?${qs}` : ''}`);
};
export const createAlert = (data: AlertCreate) =>
  request<Alert>('/api/alerts', { method: 'POST', body: JSON.stringify(data) });
export const updateAlertStatus = (id: number, status: string) =>
  request<Alert>(`/api/alerts/${id}?status=${status}`, { method: 'PATCH' });

// ── Data Sources ──
export const fetchDataSources = () => request<DataSource[]>('/api/data-sources');

// ── Simulation ──
export const simulateHazard = (zoneId: number = 1) =>
  request<SimulationResponse>('/api/simulation/hazard', {
    method: 'POST',
    body: JSON.stringify({ zone_id: zoneId }),
  });
export const fetchSimulationStatus = (zoneId: number = 1) =>
  request<SimulationResponse>(`/api/simulation/status?zone_id=${zoneId}`);
export const resetSimulation = () =>
  request<{ status: string; message: string }>('/api/simulation/reset', { method: 'POST' });

// ── ARGUS Visual Intelligence ──
export const fetchArgusStatus = () => request<ArgusStatus>('/api/argus/status');
export const simulateArgusEvent = () => request<ArgusEvent>('/api/argus/simulate', { method: 'POST' });
export const fetchArgusEvent = () => request<ArgusEvent | null>('/api/argus/event');
export const resetArgusEvent = () =>
  request<{ status: string; message?: string }>('/api/argus/reset', { method: 'POST' });

// ── Analytics ──
export const fetchAnalyticsSummary = () => request<AnalyticsSummary>('/api/analytics/summary');
export const fetchRiskTrend = (zoneId: number = 1) =>
  request<TimeSeriesPoint[]>(`/api/analytics/risk-trend?zone_id=${zoneId}`);
export const fetchRainfallRisk = (zoneId: number = 1) =>
  request<TimeSeriesPoint[]>(`/api/analytics/rainfall-risk?zone_id=${zoneId}`);
export const fetchIncidentsSeverity = () => request<TimeSeriesPoint[]>('/api/analytics/incidents-severity');
export const fetchResponseTime = () => request<TimeSeriesPoint[]>('/api/analytics/response-time');
export const fetchRegionDistribution = () => request<RegionRisk[]>('/api/analytics/region-distribution');

// ── Health ──
export const checkHealth = () => request<{ status: string }>('/api/health');

// ── Types ──
export interface RiskZone {
  id: number;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: string;
  rainfall: number;
  soil_moisture: number;
  slope: number;
  ground_movement: boolean;
  historical_risk: string;
  terrain_risk: string;
  cctv_status: string;
  prediction: string;
  updated_at: string;
}

export interface RiskAnalyzeRequest {
  rainfall: number;
  soil_moisture: number;
  slope: number;
  ground_movement: boolean;
  historical_risk?: string;
  terrain_risk?: string;
}

export interface RiskAnalyzeResponse {
  risk_score: number;
  risk_level: string;
  recommended_actions: string[];
}

export interface Incident {
  id: number;
  incident_code: string;
  location: string;
  type: string;
  risk_score: number;
  severity: string;
  status: string;
  detected_at: string;
  description: string;
  cause: string;
  team_assigned: string;
  team_eta: string;
  citizen_alert_sent: boolean;
  citizen_alert_count: number;
  zone_id: number;
  created_at: string;
}

export interface IncidentCreate {
  location: string;
  type: string;
  risk_score?: number;
  severity?: string;
  description?: string;
  cause?: string;
  zone_id?: number;
}

export interface Alert {
  id: number;
  severity: string;
  location: string;
  message: string;
  recommendation: string;
  status: string;
  zone_id: number;
  created_at: string;
}

export interface AlertCreate {
  severity: string;
  location: string;
  message: string;
  recommendation?: string;
  zone_id?: number;
}

export interface DataSource {
  id: number;
  name: string;
  type: string;
  source: string;
  status: string;
  mode: string;
  active_count: number;
  last_updated: string;
  metadata_info: string;
}

export interface SimulationResponse {
  zone: RiskZone;
  alert: Alert | null;
  incident_candidate: Incident | null;
  recommended_actions: string[];
  simulation_step: number;
  is_complete: boolean;
}

export interface AnalyticsSummary {
  average_response_time: number;
  alerts_generated: number;
  incidents_resolved: number;
  critical_events: number;
  critical_zones: number;
  high_risk: number;
  active_incidents: number;
  active_sensors: number;
  active_alerts: number;
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
  label?: string;
}

export interface RegionRisk {
  region: string;
  risk_score: number;
  risk_level: string;
}

export interface ArgusStatus {
  status: string;
  mode: string;
  cameras: number;
  cameras_online: number;
  last_detection: string | null;
  last_detection_at: string | null;
  confidence: number | null;
  active_event: boolean;
}

export interface ArgusEvent {
  event_id: string;
  detection: string;
  confidence: number;
  camera: string;
  location: string;
  timestamp: string;
  zone_id: number;
  frame_url: string;
  risk_score: number;
  risk_level: string;
  alert_id: number | null;
  incident_code: string | null;
}
