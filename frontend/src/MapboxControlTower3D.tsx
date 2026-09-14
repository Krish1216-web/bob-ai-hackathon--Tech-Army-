import React, { useEffect, useRef, useState } from 'react';
import {
  Layers, MapPin, Navigation, RefreshCw, Eye, AlertTriangle, ShieldAlert,
  Truck, Ship, Thermometer, Box, Compass, Sparkles, Globe, Maximize2, Zap
} from 'lucide-react';
import type { ColdContainerMapItem, ColdHubMapItem, ColdRouteMapItem } from './LiveColdMap';

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export interface MapboxControlTower3DProps {
  containers?: ColdContainerMapItem[];
  hubs?: ColdHubMapItem[];
  routes?: ColdRouteMapItem[];
  selectedContainerId?: string;
  onSelectContainer?: (id: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

// Sample rich telemetry data if props are omitted
const defaultContainersData: ColdContainerMapItem[] = [
  {
    id: 'CTN-8801',
    container_id: 'CTN-8801',
    shipment_id: 'SHP-1042',
    cargo: 'Vaccines (Biologics)',
    product: 'Pfizer COVID-19 Vaccine Vials',
    asset: 'TRK-204',
    lat: 18.9401,
    lng: 72.8347,
    origin: 'Mumbai',
    destination: 'Frankfurt',
    origin_coords: [18.9401, 72.8347],
    dest_coords: [50.1109, 8.6821],
    temp: '10.3°C',
    temp_val: 10.3,
    peak_temp: '11.2°C',
    peak_temp_val: 11.2,
    safe_min_temp: 2.0,
    safe_max_temp: 8.0,
    required_range: '2–8°C',
    sop_range: '2.0°C to 8.0°C',
    excursion_duration_mins: 45,
    status: 'CRITICAL',
    severity: 'CRITICAL',
    risk_probability: 0.94,
    is_anomaly: true,
    anomaly_layer: 'Thermal Spike Detection',
    nearest_hub: {
      id: 'HUB-MUNDRA',
      name: 'Mundra Ultra-Cold Logistics Center',
      location: 'Mundra, Gujarat',
      lat: 22.8395,
      lng: 69.7041,
      distance_km: 340,
      eta_minutes: 240,
      available_tons: 85,
      status: 'OPERATIONAL'
    },
    recommended_action: 'Emergency Cold Storage Reroute via Mundra Hub',
    action_description: 'Immediate reroute required to prevent thermal degradation of biological cargo.',
    cargo_value: '$1,250,000'
  },
  {
    id: 'CTN-9022',
    container_id: 'CTN-9022',
    shipment_id: 'SHP-1051',
    cargo: 'Pharmaceuticals',
    product: 'Insulin Pen Injectors',
    asset: 'TRK-088',
    lat: 13.0827,
    lng: 80.2707,
    origin: 'Chennai',
    destination: 'Singapore',
    origin_coords: [13.0827, 80.2707],
    dest_coords: [1.3521, 103.8198],
    temp: '7.8°C',
    temp_val: 7.8,
    peak_temp: '8.1°C',
    peak_temp_val: 8.1,
    safe_min_temp: 2.0,
    safe_max_temp: 8.0,
    required_range: '2–8°C',
    sop_range: '2.0°C to 8.0°C',
    excursion_duration_mins: 15,
    status: 'MEDIUM',
    severity: 'MEDIUM',
    risk_probability: 0.68,
    is_anomaly: true,
    anomaly_layer: 'Ambient Temp Warning',
    recommended_action: 'Activate Auxiliary Compressor Unit',
    action_description: 'Pre-emptive cooling boost recommended prior to cyclone arrival.',
    cargo_value: '$740,000'
  },
  {
    id: 'CTN-5510',
    container_id: 'CTN-5510',
    shipment_id: 'SHP-1112',
    cargo: 'Semiconductors',
    product: 'AI Accelerator Wafers',
    asset: 'TRK-221',
    lat: 12.9716,
    lng: 77.5946,
    origin: 'Bengaluru',
    destination: 'Dubai',
    origin_coords: [12.9716, 77.5946],
    dest_coords: [25.2048, 55.2708],
    temp: '4.2°C',
    temp_val: 4.2,
    peak_temp: '4.5°C',
    peak_temp_val: 4.5,
    safe_min_temp: 2.0,
    safe_max_temp: 8.0,
    required_range: '2–8°C',
    sop_range: '2.0°C to 8.0°C',
    excursion_duration_mins: 0,
    status: 'NORMAL',
    severity: 'NORMAL',
    risk_probability: 0.05,
    is_anomaly: false,
    anomaly_layer: 'Clean Telemetry',
    recommended_action: 'Maintain Standard Operating Route',
    action_description: 'Asset performing optimally within SOP parameters.',
    cargo_value: '$890,000'
  }
];

// Idle Fleet Assets
const idleAssetsData = [
  { id: 'TRK-204-IDLE', name: 'Idle Reefer Truck TRK-204', location: 'Mumbai Port Gate 4', lat: 18.9600, lng: 72.8500, idleHours: '14h idle', cargoValue: '$0 (Idle)', util: '18.5%', matchScore: '91% Match' },
  { id: 'CTN-117-IDLE', name: 'Idle Reefer Container CTN-117', location: 'Mundra Logistics Park', lat: 22.8450, lng: 69.7200, idleHours: '22h idle', cargoValue: '$0 (Idle)', util: '12.0%', matchScore: '87% Match' },
  { id: 'TRK-089-IDLE', name: 'Idle Cargo Reefer TRK-089', location: 'Pune Inland Depot', lat: 18.5204, lng: 73.8567, idleHours: '8h idle', cargoValue: '$0 (Idle)', util: '24.3%', matchScore: '83% Match' }
];

// Cargo Vessels at sea
const cargoVesselsData = [
  { id: 'VSL-OCEAN-STAR', name: 'MV Ocean Star', lat: 15.5000, lng: 68.2000, cargo: 'Perishable Produce & Bio-Pharma', route: 'Mumbai → Rotterdam', speed: '18.4 knots', status: 'Rerouting South of Disruption' },
  { id: 'VSL-PACIFIC-EXPRESS', name: 'MV Pacific Express', lat: 10.2000, lng: 85.4000, cargo: 'Industrial Electronics & Vaccines', route: 'Chennai → Singapore', speed: '21.0 knots', status: 'On Schedule' },
  { id: 'VSL-RED-SEA-TRADER', name: 'MV Red Sea Trader', lat: 20.8000, lng: 60.1000, cargo: 'High Value Perishables', route: 'Mundra → Dubai', speed: '16.2 knots', status: 'Normal Transit' }
];

// Disruption Zones
const disruptionZones = [
  {
    id: 'DISRUPT-MUMBAI',
    name: 'Mumbai Port Strike (Active Blockade)',
    level: 'CRITICAL',
    center: [72.8347, 18.9401],
    radiusKm: 45,
    description: '72h Expected Strike — 8 Shipments Exposed ($1.25M Cargo at Risk)',
    color: '#EF4444'
  },
  {
    id: 'DISRUPT-CHENNAI',
    name: 'Chennai Cyclone Warning (Severe Weather)',
    level: 'HIGH',
    center: [80.2707, 13.0827],
    radiusKm: 65,
    description: '48h Storm Warning — 5 Shipments Affected ($870K Exposure)',
    color: '#F59E0B'
  },
  {
    id: 'DISRUPT-DELHI',
    name: 'Delhi Highway NH-48 Closure',
    level: 'MEDIUM',
    center: [77.1025, 28.7041],
    radiusKm: 30,
    description: '24h Highway Blockage — 6 Shipments Delayed ($540K Exposure)',
    color: '#EAB308'
  }
];

export const MapboxControlTower3D: React.FC<MapboxControlTower3DProps> = ({
  containers = defaultContainersData,
  hubs = [],
  routes = [],
  selectedContainerId = 'CTN-8801',
  onSelectContainer,
  onRefresh,
  loading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Mapbox & Script State
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [terrainEnabled, setTerrainEnabled] = useState<boolean>(true);
  const [disruptionsEnabled, setDisruptionsEnabled] = useState<boolean>(true);
  const [idleAssetsEnabled, setIdleAssetsEnabled] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [activeFlyTo, setActiveFlyTo] = useState<string | null>(null);

  // Load Mapbox GL JS CDN dynamically if window.mapboxgl is absent
  useEffect(() => {
    if (window.mapboxgl) {
      setScriptLoaded(true);
      return;
    }

    // Check if stylesheet is added
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Script
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.warn('Mapbox script load fallback triggered');
      setScriptLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Mapbox GL JS v3 3D Globe when script is available
  useEffect(() => {
    if (!scriptLoaded || !mapContainerRef.current || mapRef.current) return;

    if (!window.mapboxgl) {
      console.warn('Mapbox GL object unavailable');
      return;
    }

    try {
      const mapboxToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) ||
        'pk.eyJ1IjoibWFwYm94Y29udHJvbHRvd2VyIiwiYSI6ImNtODFhYnJndzBhdDIya29uMXJwd2p2dnIifQ.xyz_mock_token_demo';

      window.mapboxgl.accessToken = mapboxToken;

      const styleUrl = mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/dark-v11';

      const map = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [78.9629, 20.5937],
        zoom: 2.85,
        pitch: 50,
        bearing: -10,
        projection: 'globe',
        attributionControl: false,
      });

      mapRef.current = map;
      setMapInitialized(true);

      map.on('load', () => {
        // Atmosphere & Fog Styling
        try {
          map.setFog({
            color: '#020813',
            'high-color': '#101b33',
            'space-color': '#0b1021',
            'horizon-blend': 0.08,
            'star-intensity': 0.7,
          });
        } catch (e) {
          console.warn('Fog:', e);
        }

        // 3D Terrain DEM
        try {
          if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
          }
          if (terrainEnabled) {
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
          }
        } catch (err) {
          console.warn('Terrain DEM:', err);
        }

        // 3D Extruded Buildings Layer
        try {
          const layers = map.getStyle()?.layers || [];
          const labelLayerId = layers.find(
            (layer: any) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
          )?.id;

          if (!map.getLayer('3d-buildings')) {
            map.addLayer(
              {
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 12,
                paint: {
                  'fill-extrusion-color': '#0f2342',
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12,
                    0,
                    12.5,
                    ['get', 'height'],
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12,
                    0,
                    12.5,
                    ['get', 'min_height'],
                  ],
                  'fill-extrusion-opacity': 0.75,
                },
              },
              labelLayerId
            );
          }
        } catch (e) {
          console.warn('Buildings:', e);
        }

        renderDisruptionZonesAndRoutes(map);
        renderMarkers(map);
      });
    } catch (err) {
      console.warn('Mapbox init catch:', err);
    }

    return () => {
      clearMarkers();
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, [scriptLoaded, mapStyle]);

  // Update Markers & Layers when containers or toggles update
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      if (map.isStyleLoaded()) {
        renderMarkers(map);
        toggleDisruptionsLayer(map, disruptionsEnabled);
      } else {
        map.once('load', () => {
          renderMarkers(map);
          toggleDisruptionsLayer(map, disruptionsEnabled);
        });
      }
    } catch (e) {}
  }, [containers, selectedContainerId, idleAssetsEnabled, disruptionsEnabled]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (e) {}
    });
    markersRef.current = [];
  };

  // Helper to create GeoJSON circular polygon for Disruption Zones
  const createCircleGeoJSON = (center: [number, number], radiusKm: number, points = 64) => {
    const coords: [number, number][] = [];
    const km = radiusKm;
    const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]);
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    };
  };

  const toggleDisruptionsLayer = (map: any, enabled: boolean) => {
    disruptionZones.forEach((dz) => {
      const fillId = `disruption-fill-${dz.id}`;
      const lineId = `disruption-line-${dz.id}`;
      try {
        if (map.getLayer(fillId)) {
          map.setLayoutProperty(fillId, 'visibility', enabled ? 'visible' : 'none');
        }
        if (map.getLayer(lineId)) {
          map.setLayoutProperty(lineId, 'visibility', enabled ? 'visible' : 'none');
        }
      } catch (e) {}
    });
  };

  // Render Disruption Polygons & 3D GeoJSON Route Corridors
  const renderDisruptionZonesAndRoutes = (map: any) => {
    try {
      disruptionZones.forEach((dz) => {
        const sourceId = `disruption-src-${dz.id}`;
        const fillId = `disruption-fill-${dz.id}`;
        const lineId = `disruption-line-${dz.id}`;

        const circleGeoJSON = createCircleGeoJSON(dz.center as [number, number], dz.radiusKm);

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: circleGeoJSON,
          });
        }

        if (!map.getLayer(fillId)) {
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': dz.color,
              'fill-opacity': 0.25,
            },
          });
        }

        if (!map.getLayer(lineId)) {
          map.addLayer({
            id: lineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': dz.color,
              'line-width': 2,
              'line-dasharray': [3, 2],
            },
          });
        }
      });

      // 3D GeoJSON Shipping Routes
      const originalRouteGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [72.8347, 18.9401], // Mumbai
            [69.7041, 22.8395], // Mundra
            [55.2708, 25.2048], // Dubai
            [43.2500, 12.6000], // Bab-el-Mandeb
            [32.5500, 29.9500], // Suez
            [14.5000, 35.8000], // Med
            [8.6821, 50.1109],  // Frankfurt
          ],
        },
      };

      const reroutedAlternativeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [72.8347, 18.9401], // Mumbai
            [69.7041, 22.8395], // Mundra
            [68.2000, 15.5000], // Arabian Sea
            [80.2707, 13.0827], // Chennai
            [103.8198, 1.3521], // Singapore
          ],
        },
      };

      if (!map.getSource('original-shipping-route')) {
        map.addSource('original-shipping-route', {
          type: 'geojson',
          data: originalRouteGeoJSON,
        });

        map.addLayer({
          id: 'original-route-line',
          type: 'line',
          source: 'original-shipping-route',
          paint: {
            'line-color': '#08B5E5',
            'line-width': 3.5,
            'line-opacity': 0.85,
          },
        });
      }

      if (!map.getSource('rerouted-shipping-route')) {
        map.addSource('rerouted-shipping-route', {
          type: 'geojson',
          data: reroutedAlternativeGeoJSON,
        });

        map.addLayer({
          id: 'rerouted-route-line',
          type: 'line',
          source: 'rerouted-shipping-route',
          paint: {
            'line-color': '#F59E0B',
            'line-width': 4,
            'line-dasharray': [4, 4],
            'line-opacity': 0.95,
          },
        });
      }
    } catch (e) {
      console.warn('Routes rendering:', e);
    }
  };

  // Render Custom HTML Markers with Popups & Breach Pulsing Rings
  const renderMarkers = (map: any) => {
    clearMarkers();
    if (!window.mapboxgl) return;

    const displayContainers = containers.length > 0 ? containers : defaultContainersData;

    // A. Active Cold Chain Container Markers
    displayContainers.forEach((c) => {
      const isSelected = c.id === selectedContainerId;
      const isCritical = c.status === 'CRITICAL';
      const isWarning = c.status === 'MEDIUM';

      const statusColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';

      const el = document.createElement('div');
      el.className = 'mapbox-custom-marker';

      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${
            isCritical
              ? `<div class="pulse-breach-ring" style="
                  position: absolute;
                  width: 46px;
                  height: 46px;
                  background: rgba(239, 68, 68, 0.25);
                  border: 2px solid #EF4444;
                "></div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: ${statusColor};
            border: ${isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.9)'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px ${statusColor}cc;
            font-size: ${isSelected ? '14px' : '12px'};
            color: #FFFFFF;
            cursor: pointer;
            z-index: 10;
          ">
            ${isCritical ? '🚨' : '🚚'}
          </div>
          <div style="
            position: absolute;
            top: -22px;
            white-space: nowrap;
            background: rgba(13, 20, 36, 0.92);
            border: 1px solid ${isSelected ? '#38BDF8' : 'rgba(255,255,255,0.15)'};
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 9px;
            font-weight: 800;
            color: ${statusColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          ">
            ${c.id} · ${c.temp}
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectContainer) onSelectContainer(c.id);
      });

      const popupHTML = `
        <div style="font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 15px; font-weight: 800; color: #F8FAFC;">📦 ${c.id}</span>
            <span style="
              background: ${isCritical ? '#450a0a' : isWarning ? '#451a03' : '#064e3b'};
              color: ${statusColor};
              border: 1px solid ${statusColor};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 800;
            ">${c.status} BREACH</span>
          </div>

          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px; line-height: 1.4;">
            <div><b>Cargo Value:</b> <span style="color: #34D399; font-weight: 700;">${c.cargo_value || '$1,250,000'}</span></div>
            <div><b>Product Type:</b> <span style="color: #38BDF8;">${c.cargo}</span></div>
            <div><b>Shipment Ref:</b> ${c.shipment_id} · Asset: ${c.asset}</div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); padding: 8px 10px; border-radius: 6px; border: 1px solid #1e293b; font-size: 11px; display: grid; gap: 4px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Live Sensor Temp:</span>
              <b style="color: ${statusColor}; font-size: 12px;">${c.temp}</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>SOP Required Range:</span>
              <b style="color: #E2E8F0;">${c.sop_range || '2.0°C to 8.0°C'}</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Excursion Duration:</span>
              <b style="color: ${isCritical ? '#EF4444' : '#F59E0B'};">${c.excursion_duration_mins || 45} mins</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Regulatory Severity:</span>
              <b style="color: ${statusColor};">${c.severity || 'CRITICAL'}</b>
            </div>
          </div>

          ${
            c.recommended_action
              ? `<div style="font-size: 10px; color: #38BDF8; background: rgba(8, 181, 229, 0.1); border: 1px dashed rgba(8, 181, 229, 0.4); padding: 6px; border-radius: 6px; margin-bottom: 6px;">
                  ⚡ <b>AI Recommendation:</b> ${c.recommended_action}
                </div>`
              : ''
          }
        </div>
      `;

      try {
        const popup = new window.mapboxgl.Popup({ offset: 20 }).setHTML(popupHTML);

        const marker = new window.mapboxgl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      } catch (e) {}
    });

    // B. Idle Fleet Assets Markers
    if (idleAssetsEnabled) {
      idleAssetsData.forEach((asset) => {
        const el = document.createElement('div');
        el.className = 'mapbox-custom-marker';
        el.innerHTML = `
          <div style="
            width: 26px;
            height: 26px;
            background: #F59E0B;
            border: 2px solid #FFFFFF;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
            font-size: 11px;
            color: #FFFFFF;
            cursor: pointer;
          ">
            🚚
          </div>
        `;

        const popupHTML = `
          <div style="font-family: inherit; font-size: 11px;">
            <div style="font-weight: 800; color: #F59E0B; font-size: 13px; margin-bottom: 4px;">🚚 ${asset.name}</div>
            <div style="color: #94A3B8; margin-bottom: 6px;">📍 ${asset.location}</div>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b; display: grid; gap: 3px;">
              <div>⏱ Idle Duration: <b style="color: #F59E0B;">${asset.idleHours}</b></div>
              <div>📊 Current Utilisation: <b>${asset.util}</b></div>
              <div>🎯 Reroute Match: <b style="color: #10B981;">${asset.matchScore}</b></div>
            </div>
          </div>
        `;

        try {
          const popup = new window.mapboxgl.Popup({ offset: 15 }).setHTML(popupHTML);

          const marker = new window.mapboxgl.Marker({ element: el })
            .setLngLat([asset.lng, asset.lat])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
        } catch (e) {}
      });
    }

    // C. Cargo Vessels at sea
    cargoVesselsData.forEach((vessel) => {
      const el = document.createElement('div');
      el.className = 'mapbox-custom-marker';
      el.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          background: #0284C7;
          border: 2px solid #38BDF8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
          font-size: 12px;
          color: #FFFFFF;
          cursor: pointer;
        ">
          🚢
        </div>
      `;

      const popupHTML = `
        <div style="font-family: inherit; font-size: 11px;">
          <div style="font-weight: 800; color: #38BDF8; font-size: 13px; margin-bottom: 4px;">🚢 ${vessel.name}</div>
          <div style="color: #94A3B8; margin-bottom: 6px;">⚓ Transit Route: <b>${vessel.route}</b></div>
          <div style="background: rgba(15, 23, 42, 0.8); padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b; display: grid; gap: 3px;">
            <div>📦 Cargo: <b>${vessel.cargo}</b></div>
            <div>⚡ Speed: <b>${vessel.speed}</b></div>
            <div>STATUS: <b style="color: #10B981;">${vessel.status}</b></div>
          </div>
        </div>
      `;

      try {
        const popup = new window.mapboxgl.Popup({ offset: 15 }).setHTML(popupHTML);

        const marker = new window.mapboxgl.Marker({ element: el })
          .setLngLat([vessel.lng, vessel.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      } catch (e) {}
    });
  };

  // Fly-To Navigation Handlers
  const handleFlyToPortStrike = () => {
    setActiveFlyTo('strike');
    const map = mapRef.current;
    if (!map) return;
    try {
      map.flyTo({
        center: [72.8347, 18.9401],
        zoom: 9.5,
        pitch: 60,
        bearing: -20,
        duration: 2200,
        essential: true,
      });
    } catch (e) {}
  };

  const handleFlyToTempBreachContainer = () => {
    setActiveFlyTo('breach');
    const map = mapRef.current;
    if (!map) return;
    try {
      map.flyTo({
        center: [72.8347, 18.9401],
        zoom: 11,
        pitch: 65,
        bearing: 15,
        duration: 2400,
        essential: true,
      });
    } catch (e) {}
  };

  const handleFlyToIdleFleet = () => {
    setActiveFlyTo('idle');
    const map = mapRef.current;
    if (!map) return;
    try {
      map.flyTo({
        center: [69.7041, 22.8395],
        zoom: 8.5,
        pitch: 55,
        bearing: 5,
        duration: 2000,
        essential: true,
      });
    } catch (e) {}
  };

  const handleReset3DView = () => {
    setActiveFlyTo('reset');
    const map = mapRef.current;
    if (!map) return;
    try {
      map.flyTo({
        center: [78.9629, 20.5937],
        zoom: 2.85,
        pitch: 50,
        bearing: -10,
        duration: 2000,
        essential: true,
      });
    } catch (e) {}
  };

  return (
    <div className="mapbox3d-container">
      {/* Top Header Overlay Bar */}
      <div className="mapbox3d-top-overlay">
        <div className="mapbox3d-chip-group">
          <div className="mapbox3d-chip danger">
            <AlertTriangle size={13} />
            <span>1 CRITICAL Cold Chain Excursion (CTN-8801)</span>
          </div>
          <div className="mapbox3d-chip warning">
            <ShieldAlert size={13} />
            <span>Port Strike Active: Mumbai Corridor</span>
          </div>
          <div className="mapbox3d-chip">
            <Globe size={13} style={{ color: '#08B5E5' }} />
            <span>Mapbox GL v3 3D Globe Active</span>
          </div>
        </div>
      </div>

      {/* Fly-To Control Toolbar */}
      <div className="mapbox3d-flyto-bar">
        <button
          className={`mapbox3d-btn ${activeFlyTo === 'strike' ? 'active' : ''}`}
          onClick={handleFlyToPortStrike}
          title="Fly-To Mumbai Port Strike Disruption Zone"
        >
          <AlertTriangle size={13} style={{ color: '#EF4444' }} />
          <span>Focus Port Strike</span>
        </button>

        <button
          className={`mapbox3d-btn ${activeFlyTo === 'breach' ? 'active' : ''}`}
          onClick={handleFlyToTempBreachContainer}
          title="Inspect CTN-8801 Vaccine Reefer Excursion"
        >
          <Thermometer size={13} style={{ color: '#EF4444' }} />
          <span>Inspect Temp Breach Container</span>
        </button>

        <button
          className={`mapbox3d-btn ${activeFlyTo === 'idle' ? 'active' : ''}`}
          onClick={handleFlyToIdleFleet}
          title="Fly-To Concentrated Idle Fleet Capacity"
        >
          <Truck size={13} style={{ color: '#F59E0B' }} />
          <span>View Idle Fleet Assets</span>
        </button>

        <button
          className={`mapbox3d-btn ${activeFlyTo === 'reset' ? 'active' : ''}`}
          onClick={handleReset3DView}
          title="Reset Camera to Global 3D Perspective"
        >
          <Compass size={13} style={{ color: '#08B5E5' }} />
          <span>Reset 3D Globe</span>
        </button>

        {onRefresh && (
          <button
            className="mapbox3d-btn"
            onClick={onRefresh}
            title="Refresh Real-Time IoT Telemetry"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh IoT Sync</span>
          </button>
        )}
      </div>

      {/* Layer Toggle Controls Panel */}
      <div className="mapbox3d-layer-panel">
        <div className="mapbox3d-layer-title">Layer Controls</div>

        <label className="mapbox3d-layer-toggle">
          <span>3D Terrain DEM</span>
          <input
            type="checkbox"
            checked={terrainEnabled}
            onChange={(e) => setTerrainEnabled(e.target.checked)}
          />
        </label>

        <label className="mapbox3d-layer-toggle">
          <span>Disruption Zones</span>
          <input
            type="checkbox"
            checked={disruptionsEnabled}
            onChange={(e) => setDisruptionsEnabled(e.target.checked)}
          />
        </label>

        <label className="mapbox3d-layer-toggle">
          <span>Idle Assets Layer</span>
          <input
            type="checkbox"
            checked={idleAssetsEnabled}
            onChange={(e) => setIdleAssetsEnabled(e.target.checked)}
          />
        </label>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 6, marginTop: 2 }}>
          <div className="mapbox3d-layer-title">Basemap Style</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button
              className={`mapbox3d-btn ${mapStyle === 'dark' ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: 10, flex: 1, justifyContent: 'center' }}
              onClick={() => setMapStyle('dark')}
            >
              Dark 3D
            </button>
            <button
              className={`mapbox3d-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: 10, flex: 1, justifyContent: 'center' }}
              onClick={() => setMapStyle('satellite')}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Bottom Map Legend */}
      <div className="mapbox3d-bottom-legend">
        <div className="mapbox3d-legend-item">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 8px #EF4444' }} />
          <span>Critical Breach (&gt;8.0°C)</span>
        </div>
        <div className="mapbox3d-legend-item">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span>Optimal SOP (2–8°C)</span>
        </div>
        <div className="mapbox3d-legend-item">
          <span style={{ width: 10, height: 10, background: '#F59E0B', borderRadius: 2, display: 'inline-block' }} />
          <span>Idle Fleet Asset</span>
        </div>
        <div className="mapbox3d-legend-item">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284C7', border: '1px solid #38BDF8', display: 'inline-block' }} />
          <span>Cargo Vessel</span>
        </div>
        <div className="mapbox3d-legend-item">
          <span style={{ width: 16, height: 0, borderTop: '2.5px dashed #F59E0B', display: 'inline-block' }} />
          <span>3D Re-Route Corridor</span>
        </div>
        <div className="mapbox3d-legend-item">
          <span style={{ width: 10, height: 10, background: 'rgba(239,68,68,0.4)', border: '1px stroke #EF4444', borderRadius: '50%', display: 'inline-block' }} />
          <span>Disruption Polygon</span>
        </div>
      </div>
    </div>
  );
};

export default MapboxControlTower3D;
