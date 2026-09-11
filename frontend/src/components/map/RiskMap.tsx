import { Fragment, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import type { RiskZone } from '../../api/client';
import StatusBadge from '../ui/StatusBadge';
import { Camera, CloudRain, Activity, Gauge, Layers3, Radio, MapPin } from 'lucide-react';

interface RiskMapProps {
  zones: RiskZone[];
  onZoneSelect: (zone: RiskZone) => void;
  selectedZoneId?: number | null;
}

const riskColors: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MODERATE: '#d97706',
  LOW: '#16a34a',
};

const riskFillOpacity: Record<string, number> = {
  CRITICAL: 0.35,
  HIGH: 0.25,
  MODERATE: 0.2,
  LOW: 0.15,
};

function MapBoundsUpdater({ zones }: { zones: RiskZone[] }) {
  const map = useMap();
  const hasSetInitialBounds = useRef(false);
  useEffect(() => {
    if (zones.length > 0 && !hasSetInitialBounds.current) {
      const bounds = zones.map(z => [z.latitude, z.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 8 });
      hasSetInitialBounds.current = true;
    }
  }, [map, zones]);
  return null;
}

export default function RiskMap({ zones, onZoneSelect, selectedZoneId }: RiskMapProps) {
  const center: [number, number] = [25.8, 91.5]; // NE India center
  const [tileError, setTileError] = useState(false);
  const criticalCount = zones.filter(zone => zone.risk_level === 'CRITICAL').length;

  return (
    <div className={`relative w-full h-full min-h-[410px] overflow-hidden rounded-xl border border-navy-600 bg-navy-900 shadow-[0_14px_34px_rgba(0,0,0,0.22)] isolate ${tileError ? 'map-fallback-grid' : ''}`}>
      <MapContainer
        center={center}
        zoom={7}
        className="operational-map w-full h-full"
        style={{ background: '#0f1729' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          eventHandlers={{ tileerror: () => setTileError(true), load: () => setTileError(false) }}
        />

        <MapBoundsUpdater zones={zones} />

        {zones.map(zone => {
          const color = riskColors[zone.risk_level] || '#16a34a';
          const isSelected = zone.id === selectedZoneId;
          const isCritical = zone.risk_level === 'CRITICAL';

          return (
            <Fragment key={zone.id}>
              {isCritical && <CircleMarker
                key={`ring-${zone.id}-${zone.risk_score}`}
                center={[zone.latitude, zone.longitude]}
                radius={25}
                interactive={false}
                pathOptions={{ color, fillOpacity: 0, weight: 1.5, opacity: 0.75, className: 'critical-map-ring' }}
              />}
              <CircleMarker
                key={`${zone.id}-${zone.risk_level}-${zone.risk_score}`}
                center={[zone.latitude, zone.longitude]}
                radius={isSelected ? 17 : isCritical ? 14 : 11}
                pathOptions={{
                  color: isSelected ? '#f8fafc' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.9 : riskFillOpacity[zone.risk_level] || 0.15,
                  weight: isSelected ? 3 : 2,
                  opacity: isCritical ? 1 : 0.85,
                }}
                eventHandlers={{
                  click: () => onZoneSelect(zone),
                }}
              >
                {isSelected && <Tooltip direction="top" offset={[0, -18]} opacity={1} permanent>
                  <span className="map-zone-label">{zone.name.split('—')[0].trim()} · {zone.risk_score}</span>
                </Tooltip>}
                <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-sm mb-1">{zone.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge level={zone.risk_level} />
                    <span className="text-xs font-medium">{zone.risk_score}/100</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CloudRain className="w-3 h-3" /> Rainfall: {zone.rainfall} mm
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3 h-3" /> Soil Moisture: {zone.soil_moisture}%
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> Movement: {zone.ground_movement ? 'Detected' : 'Normal'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3 h-3" /> CCTV: {zone.cctv_status}
                    </div>
                  </div>
                  <button
                    onClick={() => onZoneSelect(zone)}
                    className="mt-2 w-full text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                  >
                    View Details
                  </button>
                </div>
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>

      <div className="absolute top-3 left-3 z-[1000] panel-map px-3 py-2.5 min-w-[205px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
              <Layers3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.14em] text-white uppercase">GIS Operations Layer</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400"><Radio className="w-2.5 h-2.5 text-emerald-400" /> Sensor fusion live</div>
            </div>
          </div>
          <span className="font-mono text-[10px] text-slate-400">{zones.length} ZONES</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {criticalCount > 0 && <div className="panel-map flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-red-300"><span className="critical-pulse" /> {criticalCount} CRITICAL</div>}
        <div className="panel-map flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-slate-300"><MapPin className="w-3 h-3 text-blue-300" /> NORTH-EAST INDIA</div>
      </div>

      {tileError && (
        <div className="absolute inset-0 z-[900] pointer-events-none flex items-end justify-center pb-6 bg-navy-950/45">
          <div className="panel-map px-3 py-2 text-[10px] text-slate-300">Basemap unavailable — operational risk overlay remains active.</div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 panel-map px-3 py-2 z-[1000]">
        <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">Risk Level</div>
        <div className="space-y-1">
          {[
            { label: 'Critical', color: '#dc2626' },
            { label: 'High', color: '#ea580c' },
            { label: 'Moderate', color: '#d97706' },
            { label: 'Low', color: '#16a34a' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-[10px] text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
