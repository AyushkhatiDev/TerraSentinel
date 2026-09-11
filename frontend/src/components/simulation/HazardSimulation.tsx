import { useEffect, useState } from 'react';
import { simulateHazard, resetSimulation, fetchSimulationStatus } from '../../api/client';
import type { SimulationResponse, RiskZone } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { Zap, RotateCcw, Loader2, Crosshair, CloudRain, Droplets } from 'lucide-react';

interface HazardSimulationProps {
  onUpdate: (zone: RiskZone) => void;
  onComplete: (res: SimulationResponse) => void;
  zoneId?: number;
}

export default function HazardSimulation({ onUpdate, onComplete, zoneId = 1 }: HazardSimulationProps) {
  const { addToast, simulationRunning, setSimulationRunning, triggerRefresh } = useApp();
  const [resetting, setResetting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchSimulationStatus(zoneId)
      .then(res => { if (mounted) setStep(res.simulation_step); })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, [zoneId]);

  const handleSimulate = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);

    try {
      // Run 4 steps with delays
      for (let i = 0; i < 4; i++) {
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 200 : 1200));
        const res = await simulateHazard(zoneId);
        setStep(res.simulation_step);
        onUpdate(res.zone);

        // Show toasts at key moments
        if (res.simulation_step === 2 || res.simulation_step === 3) {
          addToast({
            title: 'Risk Assessment Updated',
            message: `${res.zone.name} — Risk score: ${res.zone.risk_score}/100 (${res.zone.risk_level})`,
            severity: res.zone.risk_level === 'HIGH' ? 'high' : 'moderate',
          });
        }

        if (res.is_complete) {
          onComplete(res);
          if (res.zone.risk_level === 'CRITICAL') {
            addToast({
              title: '🚨 CRITICAL HAZARD DETECTED',
              message: `${res.zone.name}\nRisk Score: ${res.zone.risk_score}/100\nRecommended actions generated.`,
              severity: 'critical',
            });
          }
          break;
        }
      }
    } catch {
      addToast({ title: 'Simulation Error', message: 'Failed to run simulation step', severity: 'high' });
    } finally {
      setSimulationRunning(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetSimulation();
      setStep(0);
      triggerRefresh();
      addToast({ title: 'Simulation Reset', message: 'All data restored to initial state', severity: 'info' });
    } catch {
      addToast({ title: 'Reset Error', message: 'Failed to reset simulation', severity: 'high' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="surface p-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Hazard Simulation</div>
        <div className="flex items-center gap-1 text-[9px] font-semibold tracking-wider text-amber-300"><Crosshair className="w-3 h-3" /> DEMO FLOW</div>
      </div>

      <div className="mb-3 rounded-md border border-navy-600 bg-navy-900/70 px-3 py-2.5">
        <div className="text-[9px] uppercase tracking-wider text-slate-500">Simulation target</div>
        <div className="mt-0.5 text-xs font-medium text-slate-200">Darjeeling — Zone 04</div>
        <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><CloudRain className="w-3 h-3 text-blue-300" /> Rainfall escalation</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-300" /> Moisture saturation</span>
        </div>
      </div>

      {/* Progress */}
      {step > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Simulation Progress</span>
            <span>Step {step}/4</span>
          </div>
          <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(step / 4) * 100}%`,
                backgroundColor: step >= 4 ? '#dc2626' : step >= 3 ? '#ea580c' : '#d97706',
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleSimulate}
          disabled={simulationRunning || step >= 4}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {simulationRunning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Simulating...</>
          ) : (
            <><Zap className="w-4 h-4" /> Simulate Hazard Event</>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={resetting || simulationRunning}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium uppercase tracking-wider bg-navy-700 text-slate-300 border border-navy-600 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resetting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resetting...</>
          ) : (
            <><RotateCcw className="w-3.5 h-3.5" /> Reset Simulation</>
          )}
        </button>
      </div>

      <p className="text-[9px] text-slate-500 mt-2 text-center uppercase tracking-wider">Prototype Simulation</p>
    </div>
  );
}
