import type { Alert } from '../../api/client';
import StatusBadge from '../ui/StatusBadge';
import { AlertTriangle, Clock } from 'lucide-react';

interface AlertPanelProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertPanel({ alerts, onAlertClick }: AlertPanelProps) {
  const activeAlerts = alerts.filter(a => a.status === 'Active');

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-navy-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Active Alerts</span>
        </div>
        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          {activeAlerts.length}
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {activeAlerts.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">No active alerts</div>
        ) : (
          activeAlerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => onAlertClick?.(alert)}
              className="w-full border-b border-navy-700 px-4 py-3 text-left transition-colors hover:bg-navy-700/50 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <StatusBadge level={alert.severity} />
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  {alert.created_at ? new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-1">{alert.location}</div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{alert.message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
