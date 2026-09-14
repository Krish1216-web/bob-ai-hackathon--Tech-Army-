import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers, MapPin, Navigation, RefreshCw, AlertTriangle, ShieldAlert,
  Truck, Thermometer, Box, Compass, Sparkles, Globe, Maximize2, Zap, Warehouse, ShieldCheck
} from 'lucide-react';

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
  containers?: ColdContainerMapItem[];
  hubs?: ColdHubMapItem[];
  routes?: ColdRouteMapItem[];
  selectedContainerId?: string;
  onSelectContainer?: (id: string) => void;
  onExecuteRecovery?: (id: string, actionType: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

// Fallback Default Telemetry Data if empty
const defaultContainersData: ColdContainerMapItem[] = [
  {
    id: 'CTN-8801',
    container_id: 'CTN-8801',
    shipment_id: 'SHP-1042',
    cargo: 'Vaccines (Biologics)',
    product: 'Pfizer COVID-19 Vaccine Vials',
    asset: 'TRK-204',
    lat: 19.0760,
    lng: 72.8777,
    origin: 'Mumbai Hub',
    destination: 'Delhi NCR Logistics Hub',
    origin_coords: [18.9401, 72.8347],
    dest_coords: [28.6139, 77.2090],
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
    anomaly_layer: 'L1_BOUNDS (Sustained High Excursion)',
    nearest_hub: {
      id: 'HUB-PUNE-01',
      name: 'Pune Pharma Cold Hub',
      location: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      distance_km: 74,
      eta_minutes: 58,
      available_tons: 140,
      status: 'AVAILABLE'
    },
    recommended_action: 'DIVERT_TO_COLD_HUB',
    action_description: 'Divert to Pune Pharma Cold Hub (58m ETA, 140T capacity available) to prevent $1.25M cargo loss.',
    cargo_value: '$1,250,000'
  },
  {
    id: 'CTN-9204',
    container_id: 'CTN-9204',
    shipment_id: 'SHP-1038',
    cargo: 'Frozen Seafood (Shrimp)',
    product: 'Vannamei Export Grade Shrimp',
    asset: 'VES-802',
    lat: 13.0827,
    lng: 80.2707,
    origin: 'Chennai Port',
    destination: 'Singapore Port',
    origin_coords: [13.0827, 80.2707],
    dest_coords: [1.3521, 103.8198],
    temp: '-18.4°C',
    temp_val: -18.4,
    peak_temp: '-17.9°C',
    peak_temp_val: -17.9,
    safe_min_temp: -25.0,
    safe_max_temp: -18.0,
    required_range: '-25°C to -18°C',
    sop_range: '-25.0°C to -18.0°C',
    excursion_duration_mins: 0,
    status: 'NORMAL',
    severity: 'NORMAL',
    risk_probability: 0.08,
    is_anomaly: false,
    anomaly_layer: 'NONE',
    nearest_hub: {
      id: 'HUB-CHN-01',
      name: 'Chennai Port Reefer Station',
      location: 'Chennai',
      lat: 13.0827,
      lng: 80.2707,
      distance_km: 12,
      eta_minutes: 20,
      available_tons: 320,
      status: 'AVAILABLE'
    },
    recommended_action: 'CONTINUE_MONITORING',
    action_description: 'Reefer compressor operating nominally. Maintain scheduled route.',
    cargo_value: '$420,000'
  },
  {
    id: 'CTN-7740',
    container_id: 'CTN-7740',
    shipment_id: 'SHP-1049',
    cargo: 'Fresh Dairy & Cheese',
    product: 'Artisanal Organic Dairy',
    asset: 'TRK-109',
    lat: 23.0225,
    lng: 72.5714,
    origin: 'Ahmedabad Anand Hub',
    destination: 'Mundra Maritime Terminal',
    origin_coords: [23.0225, 72.5714],
    dest_coords: [22.8395, 69.7214],
    temp: '6.8°C',
    temp_val: 6.8,
    peak_temp: '7.4°C',
    peak_temp_val: 7.4,
    safe_min_temp: 2.0,
    safe_max_temp: 6.0,
    required_range: '2–6°C',
    sop_range: '2.0°C to 6.0°C',
    excursion_duration_mins: 18,
    status: 'MEDIUM',
    severity: 'MEDIUM',
    risk_probability: 0.52,
    is_anomaly: true,
    anomaly_layer: 'L2_RATE (Elevated Warming Trend)',
    nearest_hub: {
      id: 'HUB-MUN-01',
      name: 'Mundra Port Cold Terminal',
      location: 'Mundra',
      lat: 22.8395,
      lng: 69.7214,
      distance_km: 110,
      eta_minutes: 85,
      available_tons: 210,
      status: 'AVAILABLE'
    },
    recommended_action: 'BOOST_REEFER_COOLING',
    action_description: 'Send remote IoT command to increase compressor output by 25%.',
    cargo_value: '$180,000'
  }
];

const defaultHubsData: ColdHubMapItem[] = [
  { id: 'HUB-PUNE-01', name: 'Pune Pharma Cold Hub', location: 'Pune', lat: 18.5204, lng: 73.8567, temp_zones: ['-20°C', '2–8°C', '15–25°C'], capacity_tons: 200, available_tons: 140, occupied_pct: 30, status: 'AVAILABLE' },
  { id: 'HUB-BOM-01', name: 'Bhiwandi Central Cold Storage', location: 'Mumbai NCR', lat: 19.2967, lng: 73.0631, temp_zones: ['2–8°C', 'Frozen'], capacity_tons: 350, available_tons: 220, occupied_pct: 37, status: 'AVAILABLE' },
  { id: 'HUB-MUN-01', name: 'Mundra Port Cold Terminal', location: 'Mundra', lat: 22.8395, lng: 69.7214, temp_zones: ['-25°C', '2–8°C'], capacity_tons: 500, available_tons: 210, occupied_pct: 58, status: 'AVAILABLE' },
  { id: 'HUB-DEL-01', name: 'Delhi NCR Cargo Cold Hub', location: 'Delhi', lat: 28.5562, lng: 77.1000, temp_zones: ['2–8°C', 'Ultra-Low -80°C'], capacity_tons: 400, available_tons: 180, occupied_pct: 55, status: 'AVAILABLE' },
  { id: 'HUB-CHN-01', name: 'Chennai Port Reefer Station', location: 'Chennai', lat: 13.0827, lng: 80.2707, temp_zones: ['-25°C', '2–8°C'], capacity_tons: 600, available_tons: 320, occupied_pct: 47, status: 'AVAILABLE' },
  { id: 'HUB-HYD-01', name: 'Hyderabad Genome Valley Hub', location: 'Hyderabad', lat: 17.3850, lng: 78.4867, temp_zones: ['2–8°C', 'Ultra-Low'], capacity_tons: 300, available_tons: 240, occupied_pct: 20, status: 'AVAILABLE' },
  { id: 'HUB-BLR-01', name: 'Bengaluru Airport Perishable Center', location: 'Bengaluru', lat: 13.1986, lng: 77.7066, temp_zones: ['2–8°C', '15–25°C'], capacity_tons: 250, available_tons: 175, occupied_pct: 30, status: 'AVAILABLE' }
];

const defaultRoutesData: ColdRouteMapItem[] = [
  {
    shipment_id: 'SHP-1042',
    container_id: 'CTN-8801',
    status: 'CRITICAL',
    origin: 'Mumbai Hub',
    destination: 'Delhi NCR Logistics Hub',
    points: [
      [18.9401, 72.8347],
      [19.0760, 72.8777],
      [20.0112, 73.7902],
      [22.7196, 75.8577],
      [26.9124, 75.7873],
      [28.6139, 77.2090]
    ],
    diversion_points: [
      [19.0760, 72.8777],
      [18.7557, 73.4116],
      [18.5204, 73.8567]
    ]
  },
  {
    shipment_id: 'SHP-1038',
    container_id: 'CTN-9204',
    status: 'NORMAL',
    origin: 'Chennai Port',
    destination: 'Singapore Port',
    points: [
      [13.0827, 80.2707],
      [11.5000, 84.0000],
      [8.0000, 89.0000],
      [4.5000, 96.0000],
      [1.3521, 103.8198]
    ]
  },
  {
    shipment_id: 'SHP-1049',
    container_id: 'CTN-7740',
    status: 'MEDIUM',
    origin: 'Ahmedabad Anand Hub',
    destination: 'Mundra Maritime Terminal',
    points: [
      [23.0225, 72.5714],
      [22.8000, 71.3000],
      [22.8395, 69.7214]
    ]
  }
];

export const LiveColdMap: React.FC<LiveColdMapProps> = ({
  containers = defaultContainersData,
  hubs = defaultHubsData,
  routes = defaultRoutesData,
  selectedContainerId,
  onSelectContainer,
  onRefresh,
  loading = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});

  const [basemapStyle, setBasemapStyle] = useState<'carto-dark' | 'satellite' | 'street'>('carto-dark');
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showDiversions, setShowDiversions] = useState<boolean>(true);

  const activeContainers = containers && containers.length > 0 ? containers : defaultContainersData;
  const activeHubs = hubs && hubs.length > 0 ? hubs : defaultHubsData;
  const activeRoutes = routes && routes.length > 0 ? routes : defaultRoutesData;

  const selectedContainer = activeContainers.find(
    (c) => c.id === selectedContainerId || c.container_id === selectedContainerId
  ) || activeContainers[0];

  const criticalCount = activeContainers.filter((c) => c.status === 'CRITICAL' || c.severity === 'CRITICAL').length;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Trigger resize calculation
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; CARTO &copy; OpenStreetMap';

    if (basemapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery';
    } else if (basemapStyle === 'street') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
  }, [basemapStyle]);

  // Render Markers, Hubs, and Route Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markersMapRef.current = {};

    // 1. Draw Routes
    if (showRoutes) {
      activeRoutes.forEach((route) => {
        const isCritical = route.status === 'CRITICAL';
        const isMedium = route.status === 'MEDIUM';
        const routeColor = isCritical ? '#FF414D' : isMedium ? '#FF8A00' : '#08B5E5';

        // Primary transit line
        if (route.points && route.points.length > 1) {
          const polyline = L.polyline(route.points as [number, number][], {
            color: routeColor,
            weight: 3.5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: isCritical ? '6, 6' : undefined
          });
          polyline.bindTooltip(`<b>${route.shipment_id}</b>: ${route.origin} → ${route.destination}`, {
            sticky: true,
            className: 'custom-map-tooltip'
          });
          layerGroup.addLayer(polyline);
        }

        // Emergency Diversion Corridor
        if (showDiversions && route.diversion_points && route.diversion_points.length > 1) {
          const divPolyline = L.polyline(route.diversion_points as [number, number][], {
            color: '#FFD700',
            weight: 4,
            opacity: 0.95,
            dashArray: '4, 8'
          });
          divPolyline.bindTooltip(`⚡ <b>EMERGENCY DIVERSION</b> (${route.container_id})`, {
            sticky: true,
            className: 'custom-map-tooltip diversion'
          });
          layerGroup.addLayer(divPolyline);
        }
      });
    }

    // 2. Draw Cold Storage Hubs
    if (showHubs) {
      activeHubs.forEach((hub) => {
        const isAvailable = hub.status === 'AVAILABLE' || hub.occupied_pct < 80;
        const hubColor = isAvailable ? '#10B981' : '#F59E0B';

        const hubHtml = `
          <div class="hub-marker-wrap" style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            background: rgba(13, 21, 38, 0.92);
            border: 2px solid ${hubColor};
            border-radius: 6px;
            box-shadow: 0 0 10px ${hubColor}60;
            color: ${hubColor};
            cursor: pointer;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        `;

        const hubIcon = L.divIcon({
          html: hubHtml,
          className: 'custom-hub-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f1f5f9; min-width: 210px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 6px;">
              <strong style="color: #38bdf8; font-size: 13px;">${hub.name}</strong>
              <span style="background: ${isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${hubColor}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                ${hub.status}
              </span>
            </div>
            <div style="margin-bottom: 4px;">📍 <b>Location:</b> ${hub.location}</div>
            <div style="margin-bottom: 4px;">📦 <b>Available:</b> <span style="color: #10b981; font-weight: 700;">${hub.available_tons} Tons</span> / ${hub.capacity_tons} T</div>
            <div style="margin-bottom: 4px;">📊 <b>Occupancy:</b> ${hub.occupied_pct}%</div>
            <div style="margin-bottom: 6px;">🌡 <b>Temp Zones:</b> ${hub.temp_zones.join(', ')}</div>
            <div style="background: rgba(8, 181, 229, 0.1); padding: 5px 8px; border-radius: 4px; font-size: 11px; color: #08b5e5;">
              ✓ WHO GDP & FDA 21 CFR Certified
            </div>
          </div>
        `, {
          className: 'custom-leaflet-popup'
        });

        layerGroup.addLayer(marker);
      });
    }

    // 3. Draw Containers / Reefer Units
    activeContainers.forEach((c) => {
      const isSelected = selectedContainer && (selectedContainer.id === c.id || selectedContainer.container_id === c.container_id);
      const isCritical = c.status === 'CRITICAL' || c.severity === 'CRITICAL';
      const isMedium = c.status === 'MEDIUM' || c.severity === 'MEDIUM';
      const toneColor = isCritical ? '#FF414D' : isMedium ? '#FF8A00' : '#10B981';

      const pulseRing = isCritical
        ? `<span class="marker-pulse-ring" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 65, 77, 0.35); animation: liveColdPulse 1.4s infinite;"></span>`
        : '';

      const containerHtml = `
        <div class="reefer-marker-node" style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          ${pulseRing}
          <div style="
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 4px;
            background: #0d1526;
            border: 2px solid ${isSelected ? '#38bdf8' : toneColor};
            border-radius: 20px;
            padding: 3px 8px;
            box-shadow: 0 0 14px ${toneColor}80, 0 4px 10px rgba(0,0,0,0.8);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${toneColor};
              box-shadow: 0 0 6px ${toneColor};
            "></span>
            <span style="
              font-size: 11px;
              font-weight: 800;
              color: ${toneColor};
              font-family: monospace;
            ">${c.temp}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: containerHtml,
        className: 'custom-container-icon',
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      });

      const marker = L.marker([c.lat, c.lng], { icon });

      marker.on('click', () => {
        if (onSelectContainer) {
          onSelectContainer(c.id || c.container_id);
        }
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f1f5f9; min-width: 250px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <strong style="color: #38bdf8; font-size: 14px;">${c.id || c.container_id}</strong>
              <div style="font-size: 11px; color: #94a3b8;">${c.cargo} · ${c.asset}</div>
            </div>
            <span style="
              background: ${isCritical ? 'rgba(255, 65, 77, 0.25)' : isMedium ? 'rgba(255, 138, 0, 0.25)' : 'rgba(16, 185, 129, 0.25)'};
              color: ${toneColor};
              border: 1px solid ${toneColor};
              font-size: 11px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 4px;
            ">
              ${c.status}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px;">
            <div>
              <span style="color: #94a3b8; font-size: 10px;">LIVE TEMP</span>
              <div style="color: ${toneColor}; font-weight: 800; font-size: 13px;">${c.temp}</div>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px;">SOP THRESHOLD</span>
              <div style="color: #e2e8f0; font-weight: 700; font-size: 12px;">${c.required_range}</div>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px;">CARGO VALUE</span>
              <div style="color: #38bdf8; font-weight: 700; font-size: 12px;">${c.cargo_value}</div>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 10px;">RISK PROB</span>
              <div style="color: ${toneColor}; font-weight: 700; font-size: 12px;">${Math.round(c.risk_probability * 100)}%</div>
            </div>
          </div>

          ${c.nearest_hub ? `
            <div style="margin-bottom: 8px; font-size: 11px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 4px 6px;">
              <b>⚡ Nearest Cold Hub:</b> ${c.nearest_hub.name} (${c.nearest_hub.distance_km}km · ${c.nearest_hub.eta_minutes}m ETA)
            </div>
          ` : ''}

          ${c.recommended_action ? `
            <div style="font-size: 11px; background: rgba(255, 65, 77, 0.12); border-left: 3px solid ${toneColor}; padding: 4px 6px; color: #fca5a5;">
              <b>🛡️ AI Action:</b> ${c.recommended_action.replace(/_/g, ' ')}
            </div>
          ` : ''}
        </div>
      `, {
        className: 'custom-leaflet-popup'
      });

      layerGroup.addLayer(marker);
      markersMapRef.current[c.id || c.container_id] = marker;
    });

  }, [activeContainers, activeHubs, activeRoutes, selectedContainerId, showHubs, showRoutes, showDiversions]);

  // Center on selected container
  const handleCenterSelected = () => {
    const map = mapInstanceRef.current;
    if (!map || !selectedContainer) return;
    map.flyTo([selectedContainer.lat, selectedContainer.lng], 8, {
      duration: 1.2
    });
    const m = markersMapRef.current[selectedContainer.id || selectedContainer.container_id];
    if (m) {
      setTimeout(() => m.openPopup(), 600);
    }
  };

  // Fit all network bounds
  const handleFitNetwork = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const allCoords: [number, number][] = [
      ...activeContainers.map((c) => [c.lat, c.lng] as [number, number]),
      ...activeHubs.map((h) => [h.lat, h.lng] as [number, number])
    ];
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 560, borderRadius: 12, overflow: 'hidden', background: '#060b14', border: '1px solid rgba(8, 181, 229, 0.25)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}>
      {/* Map CSS rules */}
      <style>{`
        @keyframes liveColdPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #0d1526 !important;
          border: 1px solid rgba(8, 181, 229, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #0d1526 !important;
          border-left: 1px solid rgba(8, 181, 229, 0.4) !important;
          border-top: 1px solid rgba(8, 181, 229, 0.4) !important;
        }
        .custom-map-tooltip {
          background: #0d1526 !important;
          color: #f1f5f9 !important;
          border: 1px solid rgba(8, 181, 229, 0.4) !important;
          font-size: 11px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .custom-map-tooltip.diversion {
          border-color: #ffd700 !important;
          color: #fef08a !important;
        }
      `}</style>

      {/* Top Map Floating HUD Overlay */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 14,
        right: 14,
        zIndex: 1000,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        pointerEvents: 'none'
      }}>
        {/* Left Telemetry Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          <div style={{
            background: 'rgba(13, 21, 38, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(8, 181, 229, 0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Warehouse size={14} color="#10b981" />
            <span>{activeHubs.length} Cold Hubs</span>
          </div>

          <div style={{
            background: 'rgba(13, 21, 38, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(8, 181, 229, 0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Truck size={14} color="#08b5e5" />
            <span>{activeContainers.length} Active Reefers</span>
          </div>

          {criticalCount > 0 && (
            <div style={{
              background: 'rgba(255, 65, 77, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #ff414d',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: '#ff414d',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              animation: 'pulse 2s infinite'
            }}>
              <AlertTriangle size={14} />
              <span>{criticalCount} Critical Excursion</span>
            </div>
          )}
        </div>

        {/* Right Action & Layer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          {/* Basemap Switcher */}
          <div style={{
            background: 'rgba(13, 21, 38, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(8, 181, 229, 0.3)',
            borderRadius: 8,
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <button
              onClick={() => setBasemapStyle('carto-dark')}
              style={{
                background: basemapStyle === 'carto-dark' ? 'rgba(8, 181, 229, 0.3)' : 'transparent',
                border: 'none',
                color: basemapStyle === 'carto-dark' ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Dark Cyber
            </button>
            <button
              onClick={() => setBasemapStyle('satellite')}
              style={{
                background: basemapStyle === 'satellite' ? 'rgba(8, 181, 229, 0.3)' : 'transparent',
                border: 'none',
                color: basemapStyle === 'satellite' ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Satellite
            </button>
          </div>

          {/* Layer toggles */}
          <button
            onClick={() => setShowHubs(!showHubs)}
            style={{
              background: showHubs ? 'rgba(16, 185, 129, 0.2)' : 'rgba(13, 21, 38, 0.92)',
              border: `1px solid ${showHubs ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
              color: showHubs ? '#10b981' : '#94a3b8',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Hubs
          </button>

          <button
            onClick={() => setShowDiversions(!showDiversions)}
            style={{
              background: showDiversions ? 'rgba(255, 215, 0, 0.2)' : 'rgba(13, 21, 38, 0.92)',
              border: `1px solid ${showDiversions ? '#ffd700' : 'rgba(255,255,255,0.15)'}`,
              color: showDiversions ? '#ffd700' : '#94a3b8',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Diversions
          </button>

          {/* Center & Recenter */}
          <button
            onClick={handleCenterSelected}
            title="Focus Selected Reefer"
            style={{
              background: 'rgba(13, 21, 38, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(8, 181, 229, 0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#38bdf8',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Compass size={14} /> Center
          </button>

          <button
            onClick={handleFitNetwork}
            title="Fit Entire Network"
            style={{
              background: 'rgba(13, 21, 38, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(8, 181, 229, 0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Maximize2 size={14} /> Fit All
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Live Sensor Telemetry"
              style={{
                background: 'rgba(13, 21, 38, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(8, 181, 229, 0.3)',
                borderRadius: 8,
                padding: '6px 10px',
                color: '#38bdf8',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Selected Container Quick Bar (Bottom Left Overlay) */}
      {selectedContainer && (
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1000,
          background: 'rgba(13, 21, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${selectedContainer.status === 'CRITICAL' ? '#ff414d' : 'rgba(8, 181, 229, 0.4)'}`,
          borderRadius: 8,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 6px 20px rgba(0,0,0,0.7)'
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Selected Reefer</div>
            <strong style={{ fontSize: 13, color: '#f8fafc' }}>{selectedContainer.id || selectedContainer.container_id} ({selectedContainer.cargo})</strong>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>LIVE TEMP</div>
            <strong style={{
              fontSize: 13,
              color: selectedContainer.status === 'CRITICAL' ? '#ff414d' : selectedContainer.status === 'MEDIUM' ? '#ff8a00' : '#10b981'
            }}>
              {selectedContainer.temp}
            </strong>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>STATUS</div>
            <strong style={{
              fontSize: 11,
              color: selectedContainer.status === 'CRITICAL' ? '#ff414d' : selectedContainer.status === 'MEDIUM' ? '#ff8a00' : '#10b981'
            }}>
              {selectedContainer.status}
            </strong>
          </div>

          <button
            onClick={handleCenterSelected}
            style={{
              background: 'rgba(8, 181, 229, 0.2)',
              border: '1px solid #08b5e5',
              color: '#08b5e5',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Locate
          </button>
        </div>
      )}

      {/* The Actual Leaflet Map DOM Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: 560 }} />
    </div>
  );
};

