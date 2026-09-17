import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, AlertTriangle, Bell,
  TrendingUp, Database, Shield, Radio, ChevronRight, Activity
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
    <aside className="sticky left-0 top-0 z-40 hidden w-56 shrink-0 h-screen flex-col border-r border-navy-700/80 bg-navy-950/95 backdrop-blur-md shadow-[4px_0_24px_rgba(0,0,0,0.25)] lg:flex select-none">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-navy-700/80 bg-navy-900/40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-[0.14em] text-white font-mono">TERRASENTINEL</h1>
            <p className="text-[8.5px] text-slate-400 tracking-[0.12em] uppercase font-semibold">Risk & Response Ops</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-1.5 text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Command Modules
        </div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/15 text-white border-l-[3px] border-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/70 border-l-[3px] border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {isActive ? (
                <ChevronRight className="ml-auto h-3 w-3 text-emerald-400 shrink-0" />
              ) : item.path === '/alerts' ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-navy-700/80 bg-navy-900/40">
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2">
          <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-[0.15em] font-semibold mb-1">
            <span>Grid Telemetry</span>
            <Activity className="w-2.5 h-2.5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] text-emerald-300 font-semibold tracking-tight">Active & Synced</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
