import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ArgusEvent } from '../api/client';
import { fetchArgusEvent } from '../api/client';

export interface Toast {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info' | 'success';
  timestamp: Date;
}

interface AppContextType {
  selectedZoneId: number | null;
  setSelectedZoneId: (id: number | null) => void;
  simulationRunning: boolean;
  setSimulationRunning: (v: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  argusEvent: ArgusEvent | null;
  setArgusEvent: (event: ArgusEvent | null) => void;
  showArgusEvent: boolean;
  setShowArgusEvent: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [argusEvent, setArgusEvent] = useState<ArgusEvent | null>(null);
  const [showArgusEvent, setShowArgusEvent] = useState(false);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newToast: Toast = { ...toast, id, timestamp: new Date() };
    setToasts(prev => [...prev.slice(-2), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchArgusEvent().then(ev => {
      if (ev) setArgusEvent(ev);
    }).catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{
      selectedZoneId, setSelectedZoneId,
      simulationRunning, setSimulationRunning,
      toasts, addToast, removeToast,
      refreshKey, triggerRefresh,
      argusEvent, setArgusEvent, showArgusEvent, setShowArgusEvent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
