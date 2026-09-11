import type { RiskZone } from '../../api/client';
import RiskGauge from '../ui/RiskGauge';
import { X, CloudRain, Droplets, Mountain, Activity, Camera, Brain, Eye, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ZoneDetailPanelProps {
  zone: RiskZone;
  onClose: () => void;
  onCreateIncident: () => void;
}

export default function ZoneDetailPanel({ zone, onClose, onCreateIncident }: ZoneDetailPanelProps) {
  const navigate = useNavigate();

  const metrics = [
    { icon: CloudRain, label: 'Rainfall', value: `${zone.rainfall} mm / 24h`, warn: zone.rainfall > 80 },
    { icon: Droplets, label: 'Soil Moisture', value: `${zone.soil_moisture}%`, warn: zone.soil_moisture > 70 },
    { icon: Mountain, label: 'Slope', value: `${zone.slope}°`, warn: zone.slope > 30 },
    { icon: Activity, label: 'Ground Movement', value: zone.ground_movement ? 'Detected' : 'Normal', warn: zone.ground_movement },
    { icon: Camera, label: 'CCTV Status', value: zone.cctv_status, warn: zone.cctv_status === 'Offline' },
    { icon: Brain, label: 'Prediction', value: zone.prediction, warn: zone.risk_level === 'CRITICAL' || zone.risk_level === 'HIGH' },
  ];

  return (
    <div className="surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-600 px-4 py-3">
        <div>
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-300">Selected risk zone</div><h3 className="text-sm font-semibold text-white">{zone.name}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{zone.region}</p>
        </div>
        <button aria-label="Close zone detail" onClick={onClose} className="rounded p-1 text-slate-400 transition-colors hover:bg-navy-700 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Risk Gauge */}
      <div className="flex justify-center border-b border-navy-700 py-4 bg-navy-900/30">
        <RiskGauge score={zone.risk_score} size={140} />
      </div>

      {/* Metrics */}
      <div className="space-y-2.5 border-b border-navy-700 px-4 py-3">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </div>
              <span className={`max-w-[165px] text-right text-xs font-medium ${m.warn ? 'text-amber-300' : 'text-slate-200'}`}>
                {m.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="space-y-2 px-4 py-3">
        <button
          onClick={() => navigate('/risk-analysis', { state: { zoneId: zone.id } })}
          className="w-full rounded-md border border-blue-500/30 bg-blue-500/15 py-2 text-center text-xs font-semibold uppercase tracking-wider text-blue-300 transition-colors hover:bg-blue-500/25"
        >
          <Eye className="w-3.5 h-3.5 inline mr-1.5" />
          View Analysis
        </button>
        <button
          onClick={onCreateIncident}
          className="w-full rounded-md border border-orange-500/30 bg-orange-500/15 py-2 text-center text-xs font-semibold uppercase tracking-wider text-orange-300 transition-colors hover:bg-orange-500/25"
        >
          <FileWarning className="w-3.5 h-3.5 inline mr-1.5" />
          Create Incident
        </button>
      </div>
    </div>
  );
}
