import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2, Crosshair, RefreshCw, Warehouse, Truck, AlertTriangle } from 'lucide-react';

export interface ColdContainerMapItem {
  id: string;
  container_id: string;
  shipment_id: string;
  cargo: string;
  product: string;
  asset: string;
  lat: number;
  lng: number;
  origin: string;
  destination: string;
  origin_coords: [number, number];
  dest_coords: [number, number];
  temp: string;
  temp_val: number;
  peak_temp: string;
  peak_temp_val: number;
  safe_min_temp: number;
  safe_max_temp: number;
  required_range: string;
  sop_range: string;
  excursion_duration_mins: number;
  status: 'NORMAL' | 'MEDIUM' | 'CRITICAL';
  severity: 'NORMAL' | 'MEDIUM' | 'CRITICAL';
  risk_probability: number;
  is_anomaly: boolean;
  anomaly_layer: string;
  nearest_hub?: {
    id: string;
    name: string;
    location: string;
    lat: number;
    lng: number;
    distance_km: number;
    eta_minutes: number;
    available_tons: number;
    status: string;
  };
  recommended_action: string;
  action_description: string;
  cargo_value: string;
}

export interface ColdHubMapItem {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  temp_zones: string[];
  capacity_tons: number;
  available_tons: number;
  occupied_pct: number;
  status: string;
}

export interface ColdRouteMapItem {
  shipment_id: string;
  container_id: string;
  status: 'NORMAL' | 'MEDIUM' | 'CRITICAL';
  origin: string;
  destination: string;
  points: [number, number][];
  diversion_points?: [number, number][] | null;
}

interface LiveColdMapProps {
  containers: ColdContainerMapItem[];
  hubs: ColdHubMapItem[];
  routes: ColdRouteMapItem[];
  selectedContainerId: string;
  onSelectContainer: (id: string) => void;
  onExecuteRecovery?: (id: string, actionType: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const LiveColdMap: React.FC<LiveColdMapProps> = ({
  containers,
  hubs,
  routes,
  selectedContainerId,
  onSelectContainer,
  onRefresh,
  loading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 76.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark CartoDB basemap with high contrast styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Force Leaflet to recalculate container bounds after DOM mount
    const invalidateTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(invalidateTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Routes
    routes.forEach((r) => {
      const isCritical = r.status === 'CRITICAL';
      const isWarning = r.status === 'MEDIUM';
      const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#08B5E5';

      // Standard corridor polyline
      if (r.points && r.points.length >= 2) {
        L.polyline(r.points, {
          color,
          weight: r.container_id === selectedContainerId ? 3.5 : 2,
          opacity: 0.7,
          dashArray: isCritical ? '6, 6' : undefined,
        }).addTo(layerGroup);
      }

      // Emergency diversion corridor polyline
      if (r.diversion_points && r.diversion_points.length >= 2) {
        L.polyline(r.diversion_points, {
          color: '#F59E0B',
          weight: 3,
          opacity: 0.9,
          dashArray: '4, 6',
        }).addTo(layerGroup);
      }
    });

    // 2. Draw Cold Storage Hubs
    hubs.forEach((h) => {
      const isAvailable = h.status === 'OPERATIONAL' && h.available_tons > 20;
      const hubColor = isAvailable ? '#3B82F6' : '#64748B';

      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #0d1e38;
            border: 2px solid ${hubColor};
            border-radius: 4px;
            transform: rotate(45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
            cursor: pointer;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: ${hubColor};
              border-radius: 1px;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const hubMarker = L.marker([h.lat, h.lng], { icon: hubIcon });
      hubMarker.bindPopup(`
        <div style="min-width: 210px; font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <b style="font-size: 13px; color: #60A5FA;">${h.name}</b>
          </div>
          <div style="color: #94A3B8; font-size: 11px; margin-bottom: 6px;">📍 ${h.location}</div>
          <div style="background: #17253b; padding: 6px 8px; border-radius: 6px; font-size: 10px; display: grid; gap: 3px;">
            <div>📦 Available Capacity: <b style="color: #10B981;">${h.available_tons} Tons</b> / ${h.capacity_tons} T</div>
            <div>📊 Facility Occupancy: <b>${h.occupied_pct}%</b></div>
            <div>🌡 Temp Zones: <b style="color: #38BDF8;">${(h.temp_zones || []).join(', ')}</b></div>
            <div>⚡ Status: <b style="color: ${isAvailable ? '#10B981' : '#EF4444'};">${h.status}</b></div>
          </div>
        </div>
      `);
      hubMarker.addTo(layerGroup);
    });

    // 3. Draw Containers / Reefer Trucks
    containers.forEach((c) => {
      const isSelected = c.id === selectedContainerId;
      const isCritical = c.status === 'CRITICAL';
      const isWarning = c.status === 'MEDIUM';

      const markerColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
      const pulseClass = isCritical ? 'pulse-critical' : isWarning ? '' : 'pulse-normal';
      const size = isSelected ? 34 : 28;

      const containerIcon = L.divIcon({
        className: 'custom-container-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div class="${pulseClass}" style="
              width: ${size}px;
              height: ${size}px;
              background: ${markerColor};
              border: ${isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.85)'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 14px ${markerColor}99;
              transition: all 0.2s;
            ">
              <span style="color: #FFFFFF; font-size: ${isSelected ? '12px' : '10px'}; font-weight: 800;">
                ${isCritical ? '🚨' : '🚚'}
              </span>
            </div>
            <div style="
              position: absolute;
              top: -18px;
              white-space: nowrap;
              background: #0d1424;
              border: 1px solid ${isSelected ? '#38BDF8' : '#202c42'};
              border-radius: 4px;
              padding: 1px 5px;
              font-size: 9px;
              font-weight: 700;
              color: ${markerColor};
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            ">
              ${c.id} · ${c.temp}
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([c.lat, c.lng], { icon: containerIcon });

      marker.on('click', () => {
        onSelectContainer(c.id);
      });

      const popupContent = `
        <div style="min-width: 230px; font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <b style="font-size: 14px; color: #F1F5F9;">${c.id}</b>
            <span style="
              background: ${isCritical ? '#3b1b2b' : '#153326'};
              color: ${markerColor};
              border: 1px solid ${markerColor};
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 9px;
              font-weight: 700;
            ">${c.status}</span>
          </div>
          <div style="color: #94A3B8; font-size: 11px;">
            <b>${c.cargo}</b> (${c.cargo_value}) · <span style="color: #38BDF8;">${c.shipment_id}</span>
          </div>
          <hr style="border: 0; border-top: 1px solid #202c42; margin: 6px 0;" />
          <div style="font-size: 11px; display: grid; gap: 3px;">
            <div>🌡 Current Temp: <b style="color: ${markerColor}; font-size: 13px;">${c.temp}</b> (SOP: ${c.sop_range})</div>
            <div>📈 Peak Excursion: <b>${c.peak_temp}</b> (${c.excursion_duration_mins} min)</div>
            <div>📍 Route: <b>${c.origin} → ${c.destination}</b></div>
            <div>⚠️ Spoilage Risk: <b style="color: ${markerColor};">${Math.round(c.risk_probability * 100)}%</b></div>
            ${c.nearest_hub ? `<div>❄ Nearest Hub: <b>${c.nearest_hub.name}</b> (${c.nearest_hub.distance_km} km, ${c.nearest_hub.eta_minutes}m)</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
    });
  }, [containers, hubs, routes, selectedContainerId, onSelectContainer]);

  // Focus on Selected Container
  const handleFocusSelected = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const selected = containers.find((c) => c.id === selectedContainerId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 8, { duration: 1.2 });
    }
  };

  // Fit Network Bounds
  const handleFitNetwork = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const allCoords: [number, number][] = [
      ...containers.map((c): [number, number] => [c.lat, c.lng]),
      ...hubs.map((h): [number, number] => [h.lat, h.lng]),
    ];
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const criticalCount = containers.filter((c) => c.status === 'CRITICAL').length;

  return (
    <div
      className="livecold-map-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '480px',
        minHeight: '480px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #1e293b',
        background: '#0b1329'
      }}
    >
      {/* Top Map Chips */}
      <div className="livecold-overlay-top">
        <div className="livecold-chip">
          <Warehouse size={13} style={{ color: '#38BDF8' }} />
          <span>{hubs.length} Certified Cold Hubs</span>
        </div>
        <div className="livecold-chip">
          <Truck size={13} style={{ color: '#10B981' }} />
          <span>{containers.length} Monitored Reefers</span>
        </div>
        {criticalCount > 0 ? (
          <div className="livecold-chip danger">
            <AlertTriangle size={13} />
            <span>{criticalCount} Active Excursion Alert</span>
          </div>
        ) : (
          <div className="livecold-chip">
            <span style={{ color: '#10B981' }}>● All Reefers Within SOP Range</span>
          </div>
        )}
      </div>

      {/* Map Control Buttons */}
      <div className="livecold-overlay-controls">
        <button
          className="livecold-ctrl-btn"
          onClick={handleFocusSelected}
          title="Focus Selected Reefer"
        >
          <Crosshair size={13} />
          <span>Focus {selectedContainerId}</span>
        </button>
        <button
          className="livecold-ctrl-btn"
          onClick={handleFitNetwork}
          title="Fit Entire Cold Network"
        >
          <Maximize2 size={13} />
          <span>Fit Network</span>
        </button>
        {onRefresh && (
          <button
            className="livecold-ctrl-btn"
            onClick={onRefresh}
            title="Refresh Live Telemetry"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '480px',
          zIndex: 1
        }}
      />

      {/* Map Legend */}
      <div className="livecold-legend">
        <span>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Normal (2–8°C)
        </span>
        <span>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
          Warning (&gt;7°C)
        </span>
        <span>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
          Critical Excursion
        </span>
        <span>
          <i style={{ width: 8, height: 8, background: '#3B82F6', transform: 'rotate(45deg)', display: 'inline-block' }} />
          Cold Storage Hub
        </span>
        <span>
          <i style={{ width: 14, height: 0, borderTop: '2px dashed #F59E0B', display: 'inline-block' }} />
          Emergency Diversion
        </span>
      </div>
    </div>
  );
};
