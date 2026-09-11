import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import ToastContainer from './components/ui/Toast';
import ArgusEventModal from './components/argus/ArgusEventModal';
import CommandCenter from './pages/CommandCenter';
import RiskAnalysis from './pages/RiskAnalysis';
import Incidents from './pages/Incidents';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import DataSources from './pages/DataSources';
import { LayoutDashboard, TrendingUp, AlertTriangle, Bell, BarChart3, Database } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'COMMAND CENTER',
  '/risk-analysis': 'RISK ANALYSIS',
  '/incidents': 'INCIDENT MANAGEMENT',
  '/alerts': 'ALERT CENTER',
  '/analytics': 'ANALYTICS',
  '/data-sources': 'DATA SOURCES',
};

function AppLayout() {
  const location = useLocation();
  const { argusEvent, showArgusEvent, setShowArgusEvent } = useApp();
  const title = pageTitles[location.pathname] || 'TERRASENTINEL';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pb-20 lg:pb-6">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/risk-analysis" element={<RiskAnalysis />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/data-sources" element={<DataSources />} />
          </Routes>
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-navy-600 bg-navy-900/95 px-2 lg:hidden">
        {[
          ['/', 'Center', LayoutDashboard], ['/risk-analysis', 'Risk', TrendingUp], ['/incidents', 'Cases', AlertTriangle],
          ['/alerts', 'Alerts', Bell], ['/analytics', 'Trends', BarChart3], ['/data-sources', 'Feeds', Database],
        ].map(([path, label, Icon]) => {
          const isActive = location.pathname === path;
          const NavIcon = Icon as typeof LayoutDashboard;
          return <Link key={path as string} to={path as string} className={`flex min-w-11 flex-col items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-medium ${isActive ? 'text-emerald-300' : 'text-slate-500'}`}>
            <NavIcon className="h-4 w-4" />{label as string}
          </Link>;
        })}
      </nav>
      <ToastContainer />
      {argusEvent && showArgusEvent && (
        <ArgusEventModal event={argusEvent} onClose={() => setShowArgusEvent(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
