import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, AlertTriangle, Bell,
  TrendingUp, Database, Shield, Radio, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/risk-analysis', label: 'Risk Analysis', icon: TrendingUp },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/data-sources', label: 'Data Sources', icon: Database },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sticky left-0 top-0 z-50 hidden w-60 shrink-0 h-screen flex-col overflow-y-auto border-r border-navy-700 bg-navy-900 shadow-[8px_0_24px_rgba(0,0,0,0.12)] lg:flex">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-navy-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-emerald-600/90 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.15)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">TERRASENTINEL</h1>
            <p className="text-[9px] text-slate-400 tracking-[0.12em]">DISASTER RISK MONITORING</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operations</div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                isActive
                ? 'bg-navy-700 text-white shadow-[inset_2px_0_0_#34d399]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-emerald-300" />}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 py-4 border-t border-navy-700">
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <div className="text-[9px] text-slate-400 uppercase tracking-[0.14em] mb-1.5">System Status</div>
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-300 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
