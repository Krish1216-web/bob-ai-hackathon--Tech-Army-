import React from 'react';
import { MapboxControlTower3D } from './MapboxControlTower3D';

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
  return (
    <MapboxControlTower3D
      containers={containers}
      hubs={hubs}
      routes={routes}
      selectedContainerId={selectedContainerId}
      onSelectContainer={onSelectContainer}
      onRefresh={onRefresh}
      loading={loading}
    />
  );
};
