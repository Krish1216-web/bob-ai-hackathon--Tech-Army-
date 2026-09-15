import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  Package, Truck, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, Clock, MapPin, Gauge, Thermometer, Battery, Droplets, Lock, Unlock, Sliders, Search, Filter, RefreshCw, ChevronRight, Eye, CornerDownRight, Sparkles, Layers, Box, Info, ArrowUpRight, Zap, Award, Wrench, Power, ZoomIn, ZoomOut, Bell, ChevronDown, MoreHorizontal, User, Orbit, Play, Pause, Rotate3d, Compass, Maximize2, Shield, Phone, Activity, Radio, Check, Calendar, BarChart3, Navigation, ExternalLink, FileText
} from 'lucide-react';;

export interface CargoPackageItem {
  id: string;
  name: string;
  client: string;
  category: string;
  weightLbs: number;
  volumeFt3: number;
  loadingOrder: number;
  col: number; // 0 to 3
  row: number; // 0 to 2
  destination: string;
  eta: string;
  tempF: number;
  tempC: number;
  status: 'Critical' | 'High' | 'Normal' | 'Low';
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Low';
  fragile: boolean;
  fragileNote?: string;
  quantity?: string;
}

export interface VehicleData {
  id: string;
  plate: string;
  truckModel: string;
  status: 'Active' | 'Idle' | 'In Transit' | 'Offline';
  driver: string;
  driverPhone: string;
  origin: string;
  destination: string;
  eta: string;
  totalWeightLbs: number;
  maxWeightLbs: number;
  totalVolumeFt3: number;
  maxVolumeFt3: number;
  fuelPct: number;
  onTimePct: number;
  packages: CargoPackageItem[];
}


export const FLEET_CATALOG: Record<string, VehicleData> = {
  'TX-9913-HX': {
    id: 'TX-9913-HX',
    plate: 'TX-9913-HX',
    truckModel: 'Kenworth T680 Heavy-Duty Reefer',
    status: 'Idle',
    driver: 'Marcus Vance',
    driverPhone: '+1 (555) 438-9201',
    origin: 'Dallas Central Terminal',
    destination: 'Memphis, TN',
    eta: '16:45 Today',
    totalWeightLbs: 28700,
    maxWeightLbs: 44000,
    totalVolumeFt3: 2390,
    maxVolumeFt3: 2400,
    fuelPct: 56.2,
    onTimePct: 94.2,
    packages: [
      {
        id: 'SHP-8841',
        name: 'Fiber Optic Cables (x200)',
        client: 'OptiGrid Telecom',
        category: 'Electronics / Telecom',
        weightLbs: 1400,
        volumeFt3: 120,
        loadingOrder: 1,
        col: 0,
        row: 0,
        destination: 'Memphis, TN',
        eta: '14:30',
        tempF: 68.4,
        tempC: 20.2,
        status: 'Critical',
        riskScore: 88,
        riskLevel: 'Critical',
        fragile: true,
        fragileNote: 'Handle with care. Shock-absorbing packaging required.',
        quantity: 'Fiber Optic Cables (x200)'
      },
      {
        id: 'SHP-4574',
        name: '48" LED Displays (x24)',
        client: 'TechFlow Inc.',
        category: 'High-Value Electronics',
        weightLbs: 4200,
        volumeFt3: 320,
        loadingOrder: 4,
        col: 1,
        row: 0,
        destination: 'Memphis, TN',
        eta: '16:45',
        tempF: 66.2,
        tempC: 19.0,
        status: 'High',
        riskScore: 15,
        riskLevel: 'Low',
        fragile: true,
        fragileNote: 'Handle with care. Shock-absorbing packaging required.',
        quantity: '48" LED Displays (x24)'
      },
      {
        id: 'SHP-9856',
        name: 'Precision CNC Controller Units',
        client: 'AeroMach Dynamics',
        category: 'Industrial Tech',
        weightLbs: 3100,
        volumeFt3: 260,
        loadingOrder: 2,
        col: 2,
        row: 0,
        destination: 'Nashville, TN',
        eta: '17:15',
        tempF: 65.0,
        tempC: 18.3,
        status: 'Normal',
        riskScore: 22,
        riskLevel: 'Low',
        fragile: false,
        quantity: 'CNC Units (x8)'
      },
      {
        id: 'SHP-3219',
        name: 'Critical Cold-Chain Vaccines',
        client: 'BioPharma Global',
        category: 'Biologics / Pharma',
        weightLbs: 1850,
        volumeFt3: 140,
        loadingOrder: 3,
        col: 3,
        row: 0,
        destination: 'Memphis Medical Hub',
        eta: '15:00',
        tempF: -0.4,
        tempC: -18.0,
        status: 'Critical',
        riskScore: 95,
        riskLevel: 'Critical',
        fragile: true,
        fragileNote: 'Ultra-low thermal stability requirement (-20°C).',
        quantity: 'Vaccine Vials (x10,000)'
      },
      {
        id: 'SHP-6542',
        name: 'Server Blade Racks (x12)',
        client: 'CloudCore Infrastructure',
        category: 'Data Center Hardware',
        weightLbs: 3800,
        volumeFt3: 310,
        loadingOrder: 5,
        col: 0,
        row: 1,
        destination: 'Little Rock, AR',
        eta: '18:30',
        tempF: 67.5,
        tempC: 19.7,
        status: 'Normal',
        riskScore: 35,
        riskLevel: 'Low',
        fragile: true,
        fragileNote: 'Precision calibrated assembly.',
        quantity: 'Server Racks (x12)'
      },
      {
        id: 'SHP-1209',
        name: 'Automotive Engine ECU Modules',
        client: 'Apex Powertrain Co.',
        category: 'Automotive Parts',
        weightLbs: 2600,
        volumeFt3: 210,
        loadingOrder: 6,
        col: 1,
        row: 1,
        destination: 'Memphis, TN',
        eta: '20:00',
        tempF: 69.1,
        tempC: 20.6,
        status: 'Normal',
        riskScore: 18,
        riskLevel: 'Low',
        fragile: false,
        quantity: 'ECU Modules (x150)'
      },
      {
        id: 'SHP-7744',
        name: 'Lithium Solid-State Battery Packs',
        client: 'VoltGrid Energy',
        category: 'Energy Storage',
        weightLbs: 4500,
        volumeFt3: 340,
        loadingOrder: 7,
        col: 2,
        row: 1,
        destination: 'Indianapolis, IN',
        eta: '22:15',
        tempF: 71.6,
        tempC: 22.0,
        status: 'Critical',
        riskScore: 92,
        riskLevel: 'Critical',
        fragile: true,
        fragileNote: 'Hazmat Class 9. Temperature threshold max 25°C.',
        quantity: 'Battery Packs (x10)'
      },
      {
        id: 'SHP-8978',
        name: 'Commercial Solar Inverters',
        client: 'SunPower Distribution',
        category: 'Renewables',
        weightLbs: 2900,
        volumeFt3: 240,
        loadingOrder: 8,
        col: 3,
        row: 1,
        destination: 'Columbus, OH',
        eta: '23:45',
        tempF: 66.0,
        tempC: 18.9,
        status: 'High',
        riskScore: 48,
        riskLevel: 'High',
        fragile: true,
        fragileNote: 'Shock sensors active.',
        quantity: 'Inverters (x18)'
      },
      {
        id: 'SHP-7197',
        name: 'High-Purity Specialty Solvents',
        client: 'ChemLab Reagents',
        category: 'Specialty Chemical',
        weightLbs: 2350,
        volumeFt3: 190,
        loadingOrder: 9,
        col: 0,
        row: 2,
        destination: 'Detroit, MI',
        eta: 'Tomorrow 04:30',
        tempF: 68.0,
        tempC: 20.0,
        status: 'Critical',
        riskScore: 84,
        riskLevel: 'Critical',
        fragile: true,
        fragileNote: 'Sealed drum pressure monitored.',
        quantity: 'Chemical Drums (x12)'
      },
      {
        id: 'SHP-7801',
        name: 'Aircraft Hydraulic Actuators',
        client: 'Honeywell Aerospace',
        category: 'Aerospace Components',
        weightLbs: 1100,
        volumeFt3: 90,
        loadingOrder: 10,
        col: 1,
        row: 2,
        destination: 'Cincinnati, OH',
        eta: 'Tomorrow 06:00',
        tempF: 65.4,
        tempC: 18.5,
        status: 'Low',
        riskScore: 10,
        riskLevel: 'Low',
        fragile: true,
        fragileNote: 'Precision calibrated assembly.',
        quantity: 'Actuators (x6)'
      },
      {
        id: 'SHP-5678',
        name: 'Semiconductor Wafer Carriers',
        client: 'GlobalFoundries US',
        category: 'Microchips',
        weightLbs: 1200,
        volumeFt3: 90,
        loadingOrder: 11,
        col: 2,
        row: 2,
        destination: 'Albany, NY',
        eta: 'Tomorrow 08:00',
        tempF: 68.2,
        tempC: 20.1,
        status: 'High',
        riskScore: 54,
        riskLevel: 'High',
        fragile: true,
        fragileNote: 'Anti-vibration hermetic nitrogen purged containers.',
        quantity: 'Wafer Pods (x8)'
      },
      {
        id: 'SHP-9102',
        name: 'High-Purity Plasma Vials',
        client: 'RedCross LifeSciences',
        category: 'Biopharma',
        weightLbs: 1700,
        volumeFt3: 130,
        loadingOrder: 12,
        col: 3,
        row: 2,
        destination: 'Philadelphia, PA',
        eta: 'Tomorrow 10:30',
        tempF: 64.8,
        tempC: 18.2,
        status: 'Normal',
        riskScore: 30,
        riskLevel: 'Low',
        fragile: true,
        fragileNote: 'Continuous thermal tracking active.',
        quantity: 'Cryo Pods (x16)'
      }
    ]
  },
  'TX-4821-HX': {
    id: 'TX-4821-HX',
    plate: 'TX-4821-HX',
    truckModel: 'Freightliner Cascadia Aero Reefer',
    status: 'In Transit',
    driver: 'Elena Rostova',
    driverPhone: '+1 (555) 782-4190',
    origin: 'Houston Port Terminal',
    destination: 'Atlanta, GA',
    eta: '19:15 Today',
    totalWeightLbs: 22400,
    maxWeightLbs: 44000,
    totalVolumeFt3: 1850,
    maxVolumeFt3: 2400,
    fuelPct: 78.4,
    onTimePct: 98.1,
    packages: [
      {
        id: 'SHP-3021',
        name: 'mRNA COVID-19 Vaccines',
        client: 'Pfizer Biopharma',
        category: 'Biologics',
        weightLbs: 2100,
        volumeFt3: 160,
        loadingOrder: 1,
        col: 0,
        row: 0,
        destination: 'Atlanta CDC Hub',
        eta: '18:00',
        tempF: -4.0,
        tempC: -20.0,
        status: 'Critical',
        riskScore: 96,
        riskLevel: 'Critical',
        fragile: true,
        fragileNote: 'Strict cold-chain compliance required.',
        quantity: 'Vaccine Vials (x25,000)'
      },
      {
        id: 'SHP-4092',
        name: 'Surgical Robotics Modules',
        client: 'Intuitive Surgical',
        category: 'Medical Robotics',
        weightLbs: 3400,
        volumeFt3: 280,
        loadingOrder: 2,
        col: 1,
        row: 0,
        destination: 'Atlanta, GA',
        eta: '19:15',
        tempF: 68.0,
        tempC: 20.0,
        status: 'High',
        riskScore: 62,
        riskLevel: 'High',
        fragile: true,
        quantity: 'Robotic Arms (x4)'
      }
    ]
  },
  'TX-7712-KL': {
    id: 'TX-7712-KL',
    plate: 'TX-7712-KL',
    truckModel: 'Peterbilt 579 UltraLoft Reefer',
    status: 'Active',
    driver: 'Devon Reed',
    driverPhone: '+1 (555) 902-3341',
    origin: 'Chicago Intermodal Yard',
    destination: 'Detroit Logistics Depot',
    eta: '21:00 Today',
    totalWeightLbs: 34200,
    maxWeightLbs: 44000,
    totalVolumeFt3: 2100,
    maxVolumeFt3: 2400,
    fuelPct: 64.0,
    onTimePct: 96.5,
    packages: [
      {
        id: 'SHP-5510',
        name: 'Lithium Ion Battery Packs (EV)',
        client: 'Tesla Gigafactory',
        category: 'EV Batteries',
        weightLbs: 5800,
        volumeFt3: 420,
        loadingOrder: 1,
        col: 0,
        row: 0,
        destination: 'Detroit, MI',
        eta: '21:00',
        tempF: 70.0,
        tempC: 21.1,
        status: 'Critical',
        riskScore: 90,
        riskLevel: 'Critical',
        fragile: true,
        quantity: 'Battery Modules (x6)'
      }
    ]
  }
};

export const CURRENT_VEHICLE = FLEET_CATALOG['TX-9913-HX'];


export interface ShipmentCargoDetailProps {
  navigate: (to: string) => void;
  notify?: (message: string, tone?: 'success' | 'danger') => void;
  initialVehicleId?: string;
}

export const ShipmentCargoDetail: React.FC<ShipmentCargoDetailProps> = ({
  navigate,
  notify,
  initialVehicleId,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || 'TX-9913-HX');
  const [vehicle, setVehicle] = useState<VehicleData>(() => FLEET_CATALOG[initialVehicleId || 'TX-9913-HX'] || CURRENT_VEHICLE);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Cargo' | 'Trips' | 'Maintenance' | 'Alerts'>('Cargo');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('SHP-4574');
  const [hoveredPkgId, setHoveredPkgId] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showReassignModal, setShowReassignModal] = useState<boolean>(false);
  const [reassignTargetTruck, setReassignTargetTruck] = useState<string>('TX-4821-HX');
  const [pkgSearchQuery, setPkgSearchQuery] = useState<string>('');

  // Handle vehicle switching
  const handleSelectVehicle = (vehicleId: string) => {
    if (FLEET_CATALOG[vehicleId]) {
      setSelectedVehicleId(vehicleId);
      const v = FLEET_CATALOG[vehicleId];
      setVehicle(v);
      if (v.packages.length > 0) {
        setSelectedPkgId(v.packages[0].id);
      }
      if (notify) notify(`Switched active view to fleet asset ${vehicleId}`, 'success');
    }
  };

  const packages = vehicle.packages;

  // Real dynamic mathematical calculations
  const totalWeightLbs = useMemo(() => {
    return packages.reduce((sum, p) => sum + (p.weightLbs || 0), 0);
  }, [packages]);

  const totalVolumeFt3 = useMemo(() => {
    return packages.reduce((sum, p) => sum + (p.volumeFt3 || 0), 0);
  }, [packages]);

  const weightPct = Math.min(100, Math.round((totalWeightLbs / vehicle.maxWeightLbs) * 100));
  const volumePct = Math.min(100, Math.round((totalVolumeFt3 / vehicle.maxVolumeFt3) * 100));

  const selectedPkg = useMemo(() => {
    return packages.find((p) => p.id === selectedPkgId) || packages[0] || {
      id: 'NONE',
      name: 'No Package Selected',
      client: 'N/A',
      category: 'General',
      weightLbs: 0,
      volumeFt3: 0,
      loadingOrder: 0,
      col: 0,
      row: 0,
      destination: vehicle.destination,
      eta: vehicle.eta,
      tempF: 68,
      tempC: 20,
      status: 'Normal' as const,
      riskScore: 0,
      riskLevel: 'Low' as const,
      fragile: false
    };
  }, [packages, selectedPkgId, vehicle]);

  const handleActivateRoute = () => {
    const nextStatus = vehicle.status === 'Active' ? 'Idle' : 'Active';
    setVehicle((prev) => ({ ...prev, status: nextStatus }));
    if (notify) {
      notify(
        nextStatus === 'Active'
          ? `Route activated for ${vehicle.plate} (${vehicle.origin} → ${vehicle.destination}). Live telemetry connected.`
          : `Vehicle ${vehicle.plate} set to Idle. Staged at ${vehicle.origin}.`,
        'success'
      );
    }
  };

  const handleTakeOffline = () => {
    const nextStatus = vehicle.status === 'Offline' ? 'Active' : 'Offline';
    setVehicle((prev) => ({ ...prev, status: nextStatus }));
    if (notify) {
      notify(
        nextStatus === 'Offline'
          ? `Vehicle ${vehicle.plate} taken offline for maintenance review.`
          : `Vehicle ${vehicle.plate} brought online and available for dispatch.`,
        nextStatus === 'Offline' ? 'danger' : 'success'
      );
    }
  };

  const handleMaintenance = () => {
    setActiveTab('Maintenance');
    if (notify) notify(`Viewing maintenance logs and TPMS matrix for ${vehicle.plate}`, 'success');
  };

  const handleReassignPackage = () => {
    const targetId = selectedPkg.id;
    const remaining = packages.filter((p) => p.id !== targetId);
    
    // Re-grid remaining crates
    const reordered = remaining.map((pkg, idx) => ({
      ...pkg,
      col: idx % 4,
      row: Math.floor(idx / 4),
      loadingOrder: idx + 1
    }));

    setVehicle((prev) => ({
      ...prev,
      packages: reordered,
      totalWeightLbs: totalWeightLbs - selectedPkg.weightLbs,
      totalVolumeFt3: totalVolumeFt3 - selectedPkg.volumeFt3
    }));

    if (reordered.length > 0) {
      setSelectedPkgId(reordered[0].id);
    }

    setShowReassignModal(false);
    if (notify) {
      notify(
        `Package ${targetId} (${selectedPkg.name}) transferred to ${reassignTargetTruck}. Remaining cargo weight: ${(totalWeightLbs - selectedPkg.weightLbs).toLocaleString()} lbs.`,
        'success'
      );
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.6, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.75, +(prev - 0.15).toFixed(2)));
  };

  const handleResetView = () => {
    setZoomLevel(1.0);
    setIsAutoRotating(false);
  };

return (
    <div className="haulix-layout-container">
      {/* 1. TOP SYSTEM BAR */}
      <div className="haulix-top-system-bar">
        {/* Left Metrics Strip */}
        <div className="haulix-system-chips">
          <div className="haulix-chip active-chip">
            <i className="haulix-dot green" />
            <span>Active <b>6/10</b></span>
          </div>
          <div className="haulix-chip">
            <span>Drivers <b>6/8</b></span>
          </div>
          <div className="haulix-chip">
            <span>Trips <b>5</b></span>
          </div>
          <div className="haulix-chip">
            <span>Avg. Fuel <b>{vehicle.fuelPct}%</b></span>
          </div>
          <div className="haulix-chip">
            <span>On-time <b>{vehicle.onTimePct}%</b></span>
          </div>
        </div>

        {/* Right Search, Notifications & User Avatar */}
        <div className="haulix-system-right">
          <div className="haulix-search-pill">
            <Search size={13} className="search-icon" />
            <input type="text" placeholder="Search vehicles, trips, or more..." />
            <kbd>⌘K</kbd>
          </div>

          <div className="haulix-notif-btn">
            <Bell size={15} />
            <span className="notif-badge">+3</span>
          </div>

          <div className="haulix-user-profile">
            <div className="user-avatar-badge">LN</div>
            <div className="user-info-text">
              <strong>Lisa Nguyen</strong>
              <small>Manager</small>
            </div>
            <ChevronDown size={12} className="user-chevron" />
          </div>
        </div>
      </div>

      {/* 2. PAGE HEADER & TITLE */}
      <div className="haulix-page-header">
        <div className="header-left-col">
          {/* Breadcrumb */}
          <div className="haulix-breadcrumb">
            <span onClick={() => navigate('/app')} className="bc-link">Dashboard</span>
            <span className="bc-sep">/</span>
            <span onClick={() => navigate('/fleet')} className="bc-link">Fleet Vehicles</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">{vehicle.plate}</span>
          </div>

          {/* Title Row */}
          <div className="haulix-title-row">
            <h1 className="haulix-vehicle-title">{vehicle.plate}</h1>
            <select
              className="haulix-vehicle-select-pill"
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              title="Switch Active Fleet Vehicle"
            >
              <option value="TX-9913-HX">TX-9913-HX (Dallas → Memphis · 12 Crates)</option>
              <option value="TX-4821-HX">TX-4821-HX (Houston → Atlanta · Vaccines)</option>
              <option value="TX-7712-KL">TX-7712-KL (Chicago → Detroit · EV Packs)</option>
            </select>
            <span className={`haulix-status-tag ${vehicle.status.toLowerCase()}`}>
              <i className="status-dot" /> {vehicle.status}
            </span>
          </div>

          <div className="haulix-vehicle-subtitle">{vehicle.truckModel}</div>
        </div>

        {/* Right Header Buttons */}
        <div className="haulix-header-actions">
          <button className="haulix-btn dark-pill" onClick={handleMaintenance}>
            <Wrench size={13} />
            <span>Maintenance</span>
          </button>
          <button className="haulix-btn dark-pill" onClick={handleTakeOffline}>
            <Power size={13} />
            <span>Take Offline</span>
          </button>
          <button className="haulix-btn activate-btn" onClick={handleActivateRoute}>
            <Zap size={14} />
            <span>Activate Route</span>
          </button>
          <button className="haulix-btn icon-only-btn" title="More Options">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="haulix-tabs-bar">
        {(['Overview', 'Cargo', 'Trips', 'Maintenance', 'Alerts'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const badgeCount =
            tab === 'Trips' ? '2' :
            tab === 'Maintenance' ? '1' :
            tab === 'Alerts' ? '0' : null;

          return (
            <button
              key={tab}
              className={`haulix-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tab}</span>
              {badgeCount && <span className="tab-count-bubble">{badgeCount}</span>}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN SPLIT: CARGO LAYOUT (LEFT) & PACKAGES (RIGHT) */}
      {activeTab === 'Cargo' && (
        <div className="haulix-main-split">
          {/* LEFT 68% PANEL: REALISTIC 3D TRUCK ROTATION */}
          <div className="haulix-cargo-panel">
            {/* Panel Top Header */}
            <div className="cargo-panel-top">
              <div className="cargo-panel-title-wrap">
                <Box size={14} className="box-title-icon" />
                <h2>Cargo Layout</h2>
                <span className="fully-loaded-badge">
                  <i className="dot coral" /> Fully loaded
                </span>
              </div>

              {/* Panel Top Controls: Orbit Controls */}
              <div className="cargo-panel-controls">
                <button
                  className={`control-icon-btn ${isAutoRotating ? 'active-rotating' : ''}`}
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  title={isAutoRotating ? 'Pause 360° Turntable' : 'Auto 360° Turntable'}
                >
                  {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button className="control-icon-btn" onClick={handleResetView} title="Reset View Angle">
                  <RefreshCw size={13} />
                </button>
                <button className="control-icon-btn" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn size={13} />
                </button>
                <button className="control-icon-btn" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut size={13} />
                </button>
              </div>
            </div>

            {/* Capacity Progress Row */}
            <div className="haulix-capacity-row">
              {/* Weight Capacity */}
              <div className="capacity-item">
                <div className="cap-label-row">
                  <span className="cap-icon-text">
                    <span className="cap-sym">⚖</span>
                    <b>{vehicle.totalWeightLbs.toLocaleString()}</b> / {vehicle.maxWeightLbs.toLocaleString()} lbs
                  </span>
                  <span className="cap-pct-tag amber-tag">{weightPct}%</span>
                </div>
                <span className="cap-sub">Weight capacity</span>
                <div className="cap-progress-bar">
                  <div className="cap-fill-bar amber-fill" style={{ width: `${weightPct}%` }} />
                </div>
              </div>

              {/* Volume Capacity */}
              <div className="capacity-item">
                <div className="cap-label-row">
                  <span className="cap-icon-text">
                    <span className="cap-sym">📦</span>
                    <b>{vehicle.totalVolumeFt3.toLocaleString()}</b> / {vehicle.maxVolumeFt3.toLocaleString()} ft³
                  </span>
                  <span className="cap-pct-tag red-tag">{volumePct}%</span>
                </div>
                <span className="cap-sub">Volume capacity</span>
                <div className="cap-progress-bar">
                  <div className="cap-fill-bar red-fill" style={{ width: `${volumePct}%` }} />
                </div>
              </div>
            </div>

            {/* REALISTIC 3D TRUCK STAGE (360° INTERACTIVE TURNTABLE) */}
            <div className="haulix-truck-stage">
              <RealisticAutomotiveTruck3D
                packages={packages}
                selectedPkgId={selectedPkgId}
                hoveredPkgId={hoveredPkgId}
                isAutoRotating={isAutoRotating}
                zoomLevel={zoomLevel}
                onSelectPkg={(id) => setSelectedPkgId(id)}
                onHoverPkg={(id) => setHoveredPkgId(id)}
              />

              {/* 360 Drag Hint */}
              <div className="orbit-drag-hint">
                <Rotate3d size={12} className="drag-hint-icon" />
                <span>360° Showroom Rotation · Drag with mouse or finger · Scroll to zoom</span>
              </div>
            </div>
          </div>

          {/* RIGHT 32% PANEL: PACKAGES LIST & SELECTED DETAIL */}
          <div className="haulix-packages-panel">
            {/* Header */}
            <div className="packages-header-top">
              <div className="pkg-header-title-group">
                <div className="pkg-title-icon-row">
                  <Package size={15} className="pkg-icon" />
                  <h2>Packages</h2>
                </div>
                <div className="pkg-meta-subline">
                  <span>Total: <b>{packages.length}/{packages.length} Items</b></span>
                  <span className="sep-bullet">·</span>
                  <span>Total weight: <b>{vehicle.totalWeightLbs.toLocaleString()} lbs</b></span>
                </div>
              </div>

              <button className="pkg-filter-icon-btn" title="Filter Packages">
                <Filter size={13} />
              </button>
            </div>

            {/* Packages List */}
            <div className="haulix-packages-list-wrap">
              {/* Card 1: SHP-8841 */}
              <div
                className={`haulix-pkg-summary-card ${selectedPkgId === 'SHP-8841' ? 'selected' : ''}`}
                onClick={() => setSelectedPkgId('SHP-8841')}
              >
                <div className="pkg-card-top-row">
                  <div className="pkg-mini-cube-thumb">
                    <Box size={16} />
                  </div>
                  <div className="pkg-title-area">
                    <div className="pkg-code-row">
                      <strong className="pkg-code-text">SHP-8841</strong>
                      <span className="status-badge-chip critical-chip">Critical</span>
                    </div>
                    <span className="pkg-subtitle-text">Fiber Optic Cables (x200)</span>
                  </div>
                </div>

                <div className="pkg-tags-row">
                  <span className="pkg-pill-tag">1,400 lbs</span>
                  <span className="pkg-pill-tag">120 ft³</span>
                  <span className="pkg-pill-tag warning-tag">⚠ Fragile</span>
                </div>
              </div>

              {/* Card 2: SHP-4574 (EXPANDED / SELECTED DEEP DETAIL HERO CARD) */}
              <div
                className={`haulix-pkg-hero-detail-card ${selectedPkgId === 'SHP-4574' ? 'selected' : ''}`}
                onClick={() => setSelectedPkgId('SHP-4574')}
              >
                {/* Top ID & Status */}
                <div className="pkg-card-top-row">
                  <div className="pkg-mini-cube-thumb active-thumb">
                    <Box size={16} />
                  </div>
                  <div className="pkg-title-area">
                    <div className="pkg-code-row">
                      <strong className="pkg-code-text">{selectedPkg.id}</strong>
                      <span className={`status-badge-chip ${selectedPkg.status.toLowerCase()}-chip`}>
                        {selectedPkg.status}
                      </span>
                    </div>
                    <span className="pkg-subtitle-text">{selectedPkg.name}</span>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="pkg-info-2col-grid">
                  <div className="info-cell">
                    <small>Client</small>
                    <strong>{selectedPkg.client}</strong>
                  </div>
                  <div className="info-cell">
                    <small>Loading order</small>
                    <strong style={{ color: '#E2F952' }}>#{selectedPkg.loadingOrder}</strong>
                  </div>
                  <div className="info-cell">
                    <small>Destination</small>
                    <strong>{selectedPkg.destination}</strong>
                  </div>
                  <div className="info-cell">
                    <small>Risk score</small>
                    <div className="risk-score-bar-row">
                      <strong style={{ color: '#22c55e' }}>{selectedPkg.riskScore}% Low</strong>
                      <div className="risk-mini-track">
                        <div className="risk-mini-fill" style={{ width: `${selectedPkg.riskScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight & Volume Specs Row */}
                <div className="pkg-specs-row">
                  <div className="spec-metric">
                    <span>⚖</span>
                    <b>{selectedPkg.weightLbs.toLocaleString()} lbs</b>
                  </div>
                  <div className="spec-metric">
                    <span>📦</span>
                    <b>{selectedPkg.volumeFt3.toLocaleString()} ft³</b>
                  </div>
                </div>

                {/* Fragile Alert Box */}
                {selectedPkg.fragile && (
                  <div className="haulix-fragile-alert-box">
                    <div className="fragile-title-row">
                      <span className="fragile-icon">⚠</span>
                      <strong>Fragile</strong>
                    </div>
                    <p>{selectedPkg.fragileNote || 'Handle with care. Shock-absorbing packaging required.'}</p>
                  </div>
                )}
              </div>

              {/* Other Package Items in Inventory */}
              {packages
                .filter((p) => p.id !== 'SHP-8841' && p.id !== 'SHP-4574')
                .map((pkg) => {
                  const isSelected = pkg.id === selectedPkgId;
                  return (
                    <div
                      key={pkg.id}
                      className={`haulix-pkg-summary-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPkgId(pkg.id)}
                    >
                      <div className="pkg-card-top-row">
                        <div className="pkg-mini-cube-thumb">
                          <Box size={16} />
                        </div>
                        <div className="pkg-title-area">
                          <div className="pkg-code-row">
                            <strong className="pkg-code-text">{pkg.id}</strong>
                            <span className={`status-badge-chip ${pkg.status.toLowerCase()}-chip`}>
                              {pkg.status}
                            </span>
                          </div>
                          <span className="pkg-subtitle-text">{pkg.name}</span>
                        </div>
                      </div>

                      <div className="pkg-tags-row">
                        <span className="pkg-pill-tag">{pkg.weightLbs.toLocaleString()} lbs</span>
                        <span className="pkg-pill-tag">{pkg.volumeFt3} ft³</span>
                        {pkg.fragile && <span className="pkg-pill-tag warning-tag">⚠ Fragile</span>}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="packages-bottom-actions">
              <button className="pkg-action-btn" onClick={() => navigate('/control-tower')}>
                <MapPin size={13} />
                <span>View Route</span>
              </button>
              <button className="pkg-action-btn" onClick={() => setShowReassignModal(true)}>
                <CornerDownRight size={13} />
                <span>Reassign to Another Truck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ===================================================================
          TAB 1: OVERVIEW (VEHICLE TELEMETRICS & COLD CHAIN SENSOR MATRIX)
          =================================================================== */}
      {activeTab === 'Overview' && (
        <div className="haulix-tab-content-grid">
          {/* 1. Quick Stats 4-Card Hero Strip */}
          <div className="haulix-overview-kpi-grid">
            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Route Corridor</span>
                <Navigation size={14} className="kpi-icon cyan-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val">{vehicle.origin} → {vehicle.destination}</strong>
                <span className="kpi-sub"><Clock size={11} /> ETA: <b>{vehicle.eta}</b> (482 mi total)</span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Reefer Thermal Unit</span>
                <Thermometer size={14} className="kpi-icon cyan-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val" style={{ color: '#08B5E5' }}>-18.4°C <small style={{ fontSize: 12, color: '#64748b' }}>(-1.1°F)</small></strong>
                <span className="kpi-sub"><ShieldCheck size={11} style={{ color: '#22c55e' }} /> Setpoint -20.0°C · 100% In-Spec</span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Cargo Capacity</span>
                <Box size={14} className="kpi-icon amber-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val">{vehicle.totalWeightLbs.toLocaleString()} lbs</strong>
                <span className="kpi-sub"><b>{weightPct}% Weight</b> · {volumePct}% Vol ({packages.length} Packages)</span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Powertrain & Fuel</span>
                <Gauge size={14} className="kpi-icon green-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val">{vehicle.fuelPct}% <small style={{ fontSize: 12, color: '#64748b' }}>Diesel</small></strong>
                <span className="kpi-sub"><Battery size={11} /> 610 mi Range · 13.8V Alternator</span>
              </div>
            </div>
          </div>

          {/* 2. Main 2-Column Overview Split */}
          <div className="haulix-overview-main-split">
            {/* Left Column: Cold Chain Matrix & Waypoints */}
            <div className="overview-left-col">
              {/* Cold-Chain IoT Probes */}
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <Activity size={14} className="cyan-icon" />
                    <h3>Real-Time IoT Cold Chain Telematics Matrix</h3>
                  </div>
                  <span className="telematics-live-pulse"><i className="dot green" /> Telematics Live</span>
                </div>

                <div className="telematics-probes-grid">
                  <div className="probe-box">
                    <small>Probe A (Front Top)</small>
                    <strong>-18.6°C</strong>
                    <span className="probe-status good">Nominal</span>
                  </div>
                  <div className="probe-box">
                    <small>Probe B (Center Bay)</small>
                    <strong>-18.4°C</strong>
                    <span className="probe-status good">Nominal</span>
                  </div>
                  <div className="probe-box">
                    <small>Probe C (Rear Door)</small>
                    <strong>-17.9°C</strong>
                    <span className="probe-status good">Nominal</span>
                  </div>
                  <div className="probe-box">
                    <small>Ambient Outside</small>
                    <strong>+32.4°C</strong>
                    <span className="probe-status alert">Warm Ambient</span>
                  </div>
                  <div className="probe-box">
                    <small>Reefer Duty Cycle</small>
                    <strong>44%</strong>
                    <span className="probe-status good">Eco Pulse</span>
                  </div>
                  <div className="probe-box">
                    <small>Door E-Seal</small>
                    <strong>SEALED</strong>
                    <span className="probe-status good">#ES-88319</span>
                  </div>
                </div>

                {/* 12-Hour Cold Chain Stability Visual */}
                <div className="temp-log-timeline-box">
                  <div className="temp-log-head">
                    <h4>12-Hour Thermal Stability Trend (-22°C to -15°C Range)</h4>
                    <span className="variance-tag">±0.4°C Max Variance</span>
                  </div>
                  <div className="temp-bars-strip">
                    {[
                      { time: '04:00', temp: '-18.2' },
                      { time: '05:00', temp: '-18.3' },
                      { time: '06:00', temp: '-18.5' },
                      { time: '07:00', temp: '-18.4' },
                      { time: '08:00', temp: '-18.6' },
                      { time: '09:00', temp: '-18.4' },
                      { time: '10:00', temp: '-18.1' },
                      { time: '11:00', temp: '-18.0' },
                      { time: '12:00', temp: '-18.3' },
                      { time: '13:00', temp: '-18.4' },
                      { time: '14:00', temp: '-18.5' },
                      { time: 'Now', temp: '-18.4' },
                    ].map((item, idx) => (
                      <div key={idx} className="temp-bar-col">
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: '74%' }} />
                        </div>
                        <span className="bar-temp">{item.temp}°</span>
                        <small className="bar-time">{item.time}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Route Corridor Progress Timeline */}
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <MapPin size={14} className="cyan-icon" />
                    <h3>Corridor Waypoint Schedule (Dallas → Memphis)</h3>
                  </div>
                  <span className="on-time-tag"><CheckCircle2 size={12} /> On Schedule</span>
                </div>

                <div className="waypoint-timeline-list">
                  <div className="waypoint-row passed">
                    <div className="waypoint-dot-col">
                      <div className="wp-dot done" />
                      <div className="wp-line" />
                    </div>
                    <div className="waypoint-info">
                      <div className="wp-title-row">
                        <strong>Dallas Central Terminal (TX)</strong>
                        <span className="wp-time">08:30 AM · Departed</span>
                      </div>
                      <p>Departure inspection complete. Electronic door seal #ES-88319 verified.</p>
                    </div>
                  </div>

                  <div className="waypoint-row passed">
                    <div className="waypoint-dot-col">
                      <div className="wp-dot done" />
                      <div className="wp-line" />
                    </div>
                    <div className="waypoint-info">
                      <div className="wp-title-row">
                        <strong>Mount Pleasant Intermodal Gate</strong>
                        <span className="wp-time">10:45 AM · Passed (65 mph)</span>
                      </div>
                      <p>Nominal transit on I-30 East corridor. Cold chain stability 100%.</p>
                    </div>
                  </div>

                  <div className="waypoint-row active">
                    <div className="waypoint-dot-col">
                      <div className="wp-dot active-pulse" />
                      <div className="wp-line dashed" />
                    </div>
                    <div className="waypoint-info">
                      <div className="wp-title-row">
                        <strong>Texarkana DOT Rest & Staging Area (AR)</strong>
                        <span className="wp-time" style={{ color: '#E2F952' }}>12:00 PM · Active Staging</span>
                      </div>
                      <p>Mandatory 30-min DOT rest break. Auxiliary reefer power generator nominal.</p>
                    </div>
                  </div>

                  <div className="waypoint-row upcoming">
                    <div className="waypoint-dot-col">
                      <div className="wp-dot upcoming-dot" />
                      <div className="wp-line dashed" />
                    </div>
                    <div className="waypoint-info">
                      <div className="wp-title-row">
                        <strong>Little Rock Cold Hub (AR)</strong>
                        <span className="wp-time">14:15 PM · Scheduled</span>
                      </div>
                      <p>Highway transit bypass waypoint (145 miles remaining).</p>
                    </div>
                  </div>

                  <div className="waypoint-row upcoming">
                    <div className="waypoint-dot-col">
                      <div className="wp-dot upcoming-dot" />
                    </div>
                    <div className="waypoint-info">
                      <div className="wp-title-row">
                        <strong>Memphis Logistics Terminal (TN)</strong>
                        <span className="wp-time">16:45 PM · Final Destination</span>
                      </div>
                      <p>Scheduled dock arrival and temperature-controlled cross-dock transfer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Driver, Powertrain, Quick Actions */}
            <div className="overview-right-col">
              {/* Driver Profile */}
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <User size={14} className="cyan-icon" />
                    <h3>Assigned Driver</h3>
                  </div>
                  <span className="status-pill active-pill">On Duty</span>
                </div>

                <div className="driver-profile-body">
                  <div className="driver-avatar-row">
                    <div className="driver-big-avatar">MV</div>
                    <div className="driver-names">
                      <h4>{vehicle.driver}</h4>
                      <span>Kenworth Master Certified Operator</span>
                      <small>{vehicle.driverPhone}</small>
                    </div>
                  </div>

                  <div className="driver-stats-grid">
                    <div className="d-stat">
                      <small>HOS Driving</small>
                      <strong>4.5 / 11.0 hrs</strong>
                    </div>
                    <div className="d-stat">
                      <small>HOS Duty</small>
                      <strong>6.2 / 14.0 hrs</strong>
                    </div>
                    <div className="d-stat">
                      <small>Safety Score</small>
                      <strong style={{ color: '#22c55e' }}>98 / 100</strong>
                    </div>
                    <div className="d-stat">
                      <small>On-Time Rate</small>
                      <strong>{vehicle.onTimePct}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Powertrain Diagnostics */}
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <Wrench size={14} className="cyan-icon" />
                    <h3>Powertrain Diagnostics</h3>
                  </div>
                  <span className="good-badge">Grade A</span>
                </div>

                <div className="powertrain-metrics-list">
                  <div className="pt-row">
                    <span>Engine Oil Pressure</span>
                    <b>44.2 PSI · Optimal</b>
                  </div>
                  <div className="pt-row">
                    <span>Coolant Temperature</span>
                    <b>188°F · Nominal</b>
                  </div>
                  <div className="pt-row">
                    <span>Diesel Exhaust Fluid (DEF)</span>
                    <b>82% · Full Range</b>
                  </div>
                  <div className="pt-row">
                    <span>Battery Alternator Voltage</span>
                    <b>13.8V · Charging</b>
                  </div>
                  <div className="pt-row">
                    <span>Transmission Fluid Temp</span>
                    <b>165°F · Normal</b>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <Zap size={14} className="amber-icon" />
                    <h3>Operations Actions</h3>
                  </div>
                </div>

                <div className="overview-action-buttons">
                  <button className="ov-btn cyan" onClick={() => notify && notify('Telematics pulse ping transmitted to truck ECU', 'success')}>
                    <Radio size={13} />
                    <span>Ping Telematics Pulse</span>
                  </button>
                  <button className="ov-btn dark" onClick={() => notify && notify(`Connecting driver ${vehicle.driver}...`, 'success')}>
                    <Phone size={13} />
                    <span>Call Driver ({vehicle.driver})</span>
                  </button>
                  <button className="ov-btn dark" onClick={() => notify && notify('Cold chain compliance PDF audit report exported', 'success')}>
                    <FileText size={13} />
                    <span>Export Compliance PDF</span>
                  </button>
                  <button className="ov-btn dark" onClick={() => setActiveTab('Cargo')}>
                    <Box size={13} />
                    <span>Switch to 3D Cargo View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: TRIPS (ACTIVE DISPATCH & PAST TRIP ARCHIVE)
          =================================================================== */}
      {activeTab === 'Trips' && (
        <div className="haulix-tab-content-grid">
          {/* Active Trip Header */}
          <div className="overview-section-card">
            <div className="sec-head">
              <div className="sec-head-left">
                <Truck size={15} className="cyan-icon" />
                <h3>Active Dispatch #TRP-9021 — Dallas Central (TX) to Memphis Depot (TN)</h3>
              </div>
              <span className="status-pill active-pill"><i className="dot green" /> In Transit</span>
            </div>

            <div className="trip-active-summary-row">
              <div className="trip-summary-metric">
                <small>Total Route Distance</small>
                <strong>495 miles</strong>
              </div>
              <div className="trip-summary-metric">
                <small>Elapsed Distance</small>
                <strong>210 miles (42%)</strong>
              </div>
              <div className="trip-summary-metric">
                <small>Average Speed</small>
                <strong>64.5 mph</strong>
              </div>
              <div className="trip-summary-metric">
                <small>Fuel Efficiency</small>
                <strong>7.8 MPG (Optimal)</strong>
              </div>
              <div className="trip-summary-metric">
                <small>Protected Cargo Value</small>
                <strong style={{ color: '#08B5E5' }}>$1,250,000</strong>
              </div>
            </div>

            <div className="trip-progress-bar-wrap">
              <div className="trip-progress-track">
                <div className="trip-progress-fill" style={{ width: '42%' }} />
              </div>
              <div className="trip-progress-labels">
                <span>Dallas (0 mi)</span>
                <span>Texarkana (210 mi · Current)</span>
                <span>Little Rock (355 mi)</span>
                <span>Memphis (495 mi · ETA 16:45)</span>
              </div>
            </div>
          </div>

          {/* Past Trip Archive Table */}
          <div className="overview-section-card">
            <div className="sec-head">
              <div className="sec-head-left">
                <Clock size={15} className="cyan-icon" />
                <h3>Vehicle Trip History Archive ({vehicle.plate})</h3>
              </div>
              <button className="pkg-filter-icon-btn" title="Export History">
                <Filter size={13} />
              </button>
            </div>

            <div className="haulix-table-responsive">
              <table className="haulix-data-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route Corridor</th>
                    <th>Date</th>
                    <th>Distance</th>
                    <th>Driver</th>
                    <th>Cargo Value</th>
                    <th>Cold Chain Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'TRP-8812', route: 'Houston (TX) → Dallas (TX)', date: '2026-09-12', dist: '240 mi', driver: 'Marcus Vance', val: '$840,000', score: '99.8%', status: 'Completed' },
                    { id: 'TRP-8640', route: 'Atlanta (GA) → Nashville (TN)', date: '2026-09-08', dist: '250 mi', driver: 'Marcus Vance', val: '$1,200,000', score: '100%', status: 'Completed' },
                    { id: 'TRP-8419', route: 'Chicago (IL) → Indianapolis (IN)', date: '2026-09-03', dist: '185 mi', driver: 'Marcus Vance', val: '$650,000', score: '99.4%', status: 'Completed' },
                    { id: 'TRP-8102', route: 'Memphis (TN) → St. Louis (MO)', date: '2026-08-28', dist: '280 mi', driver: 'Marcus Vance', val: '$920,000', score: '100%', status: 'Completed' },
                  ].map((trip) => (
                    <tr key={trip.id}>
                      <td><strong style={{ color: '#08B5E5' }}>{trip.id}</strong></td>
                      <td><b>{trip.route}</b></td>
                      <td>{trip.date}</td>
                      <td>{trip.dist}</td>
                      <td>{trip.driver}</td>
                      <td><b>{trip.val}</b></td>
                      <td><span className="good-badge">{trip.score}</span></td>
                      <td><span className="status-badge-chip normal-chip">{trip.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: MAINTENANCE (HEALTH DIAGNOSTICS & TPMS TIRE MATRIX)
          =================================================================== */}
      {activeTab === 'Maintenance' && (
        <div className="haulix-tab-content-grid">
          {/* Top Diagnostics Hero */}
          <div className="haulix-overview-kpi-grid">
            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Overall Fleet Health</span>
                <Award size={14} className="kpi-icon green-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val" style={{ color: '#22c55e' }}>94% · Grade A</strong>
                <span className="kpi-sub">Next Service in <b>4,200 mi</b></span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Thermo-King Reefer</span>
                <Thermometer size={14} className="kpi-icon cyan-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val" style={{ color: '#08B5E5' }}>98% Compressor</strong>
                <span className="kpi-sub">R-452A Pressure 220 PSI (Nominal)</span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Braking Lining</span>
                <ShieldCheck size={14} className="kpi-icon green-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val">8.2 mm <small style={{ fontSize: 12, color: '#64748b' }}>Avg</small></strong>
                <span className="kpi-sub">Air System: 120 PSI (Nominal)</span>
              </div>
            </div>

            <div className="overview-kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Engine Oil Life</span>
                <Gauge size={14} className="kpi-icon amber-icon" />
              </div>
              <div className="kpi-body">
                <strong className="kpi-val">84% Life</strong>
                <span className="kpi-sub">Synthesized 15W-40 · 6,800 mi left</span>
              </div>
            </div>
          </div>

          {/* TPMS 10-Wheel Diagram & Subsystems */}
          <div className="haulix-overview-main-split">
            {/* Left: 10-Wheel TPMS Tire Pressure Visual Layout */}
            <div className="overview-left-col">
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <Truck size={14} className="cyan-icon" />
                    <h3>Tire Pressure Monitoring System (TPMS 10-Wheel Matrix)</h3>
                  </div>
                  <span className="good-badge">All 10 Tires In-Spec</span>
                </div>

                <div className="tpms-truck-diagram">
                  {/* Steer Axle */}
                  <div className="tpms-axle-group">
                    <span className="axle-label">Steer Axle</span>
                    <div className="axle-wheels-row">
                      <div className="tpms-tire-card nominal">
                        <small>Steer L</small>
                        <strong>110 PSI</strong>
                        <span>14/32" Tread</span>
                      </div>
                      <div className="axle-beam" />
                      <div className="tpms-tire-card nominal">
                        <small>Steer R</small>
                        <strong>110 PSI</strong>
                        <span>14/32" Tread</span>
                      </div>
                    </div>
                  </div>

                  {/* Drive Tandem 1 */}
                  <div className="tpms-axle-group">
                    <span className="axle-label">Drive Tandem Front</span>
                    <div className="axle-wheels-row">
                      <div className="tpms-dual-tires">
                        <div className="tpms-tire-card nominal"><small>DL1 Outer</small><strong>105 PSI</strong></div>
                        <div className="tpms-tire-card nominal"><small>DL1 Inner</small><strong>105 PSI</strong></div>
                      </div>
                      <div className="axle-beam" />
                      <div className="tpms-dual-tires">
                        <div className="tpms-tire-card nominal"><small>DR1 Inner</small><strong>105 PSI</strong></div>
                        <div className="tpms-tire-card nominal"><small>DR1 Outer</small><strong>105 PSI</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Drive Tandem 2 */}
                  <div className="tpms-axle-group">
                    <span className="axle-label">Drive Tandem Rear</span>
                    <div className="axle-wheels-row">
                      <div className="tpms-dual-tires">
                        <div className="tpms-tire-card nominal"><small>DL2 Outer</small><strong>105 PSI</strong></div>
                        <div className="tpms-tire-card nominal"><small>DL2 Inner</small><strong>105 PSI</strong></div>
                      </div>
                      <div className="axle-beam" />
                      <div className="tpms-dual-tires">
                        <div className="tpms-tire-card nominal"><small>DR2 Inner</small><strong>105 PSI</strong></div>
                        <div className="tpms-tire-card nominal"><small>DR2 Outer</small><strong>105 PSI</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Service History Log */}
            <div className="overview-right-col">
              <div className="overview-section-card">
                <div className="sec-head">
                  <div className="sec-head-left">
                    <Calendar size={14} className="cyan-icon" />
                    <h3>Service History Records</h3>
                  </div>
                </div>

                <div className="service-records-list">
                  <div className="service-record-item">
                    <div className="rec-top">
                      <strong>50k Mile PM Comprehensive</strong>
                      <span className="rec-date">2026-08-10</span>
                    </div>
                    <p>Engine oil, oil filter, fuel water separator replaced. Full chassis lube.</p>
                    <span className="rec-tech">Kenworth Dallas Terminal · Certified</span>
                  </div>

                  <div className="service-record-item">
                    <div className="rec-top">
                      <strong>Reefer Compressor Inspection</strong>
                      <span className="rec-date">2026-07-02</span>
                    </div>
                    <p>Thermo-King S-600 drive belt tension calibrated and refrigerant charged.</p>
                    <span className="rec-tech">Thermo-King Authorized Dealer</span>
                  </div>

                  <div className="service-record-item">
                    <div className="rec-top">
                      <strong>Drive Axle Brake Pad Service</strong>
                      <span className="rec-date">2026-05-18</span>
                    </div>
                    <p>Installed heavy-duty ceramic brake pads on tandem drive axles.</p>
                    <span className="rec-tech">Fleet Depot Maintenance</span>
                  </div>
                </div>

                <button
                  className="ov-btn cyan"
                  style={{ marginTop: 14, width: '100%' }}
                  onClick={() => notify && notify('Maintenance inspection booked with Dallas Service Depot', 'success')}
                >
                  <Wrench size={13} />
                  <span>Schedule Preventive Maintenance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 5: ALERTS (EXCEPTION STREAM & TELEMETRICS WARNINGS)
          =================================================================== */}
      {activeTab === 'Alerts' && (
        <div className="haulix-tab-content-grid">
          <div className="overview-section-card">
            <div className="sec-head">
              <div className="sec-head-left">
                <AlertTriangle size={15} className="amber-icon" />
                <h3>Active Telematics Exceptions & Incident Logs</h3>
              </div>
              <button className="ov-btn dark" onClick={() => notify && notify('All active alerts acknowledged and logged', 'success')}>
                <Check size={13} />
                <span>Acknowledge All</span>
              </button>
            </div>

            <div className="haulix-alerts-stream">
              <div className="haulix-alert-item warning">
                <div className="alert-badge-icon warning-icon"><AlertTriangle size={16} /></div>
                <div className="alert-content">
                  <div className="alert-title-row">
                    <strong>Ambient Heat Wave Corridor Alert (+38°C External)</strong>
                    <span className="alert-time">Today 11:15 AM</span>
                  </div>
                  <p>Ambient road temperature reached 38°C on I-30 East corridor. Reefer compressor automatically increased output (+12%) to maintain internal setpoint of -18.4°C.</p>
                  <div className="alert-tags-line">
                    <span className="alert-tag">Auto-Mitigated</span>
                    <span className="alert-tag">0 Thermal Excursions</span>
                    <span className="alert-tag">Reefer Load: 56%</span>
                  </div>
                </div>
              </div>

              <div className="haulix-alert-item info">
                <div className="alert-badge-icon info-icon"><Navigation size={16} /></div>
                <div className="alert-content">
                  <div className="alert-title-row">
                    <strong>Geofence Interstate Corridor Entry</strong>
                    <span className="alert-time">Today 10:48 AM</span>
                  </div>
                  <p>Vehicle TX-9913-HX entered Arkansas State Highway Corridor. Electronic logbook automatically updated state tax transit record.</p>
                  <div className="alert-tags-line">
                    <span className="alert-tag">GPS Geofence</span>
                    <span className="alert-tag">Speed: 64.2 mph</span>
                  </div>
                </div>
              </div>

              <div className="haulix-alert-item resolved">
                <div className="alert-badge-icon resolved-icon"><CheckCircle2 size={16} /></div>
                <div className="alert-content">
                  <div className="alert-title-row">
                    <strong>Electronic Door E-Seal #ES-88319 Verification</strong>
                    <span className="alert-time">Today 08:30 AM</span>
                  </div>
                  <p>Pre-departure hermetic door latch scan verified 100% sealed. Nitrogen purge integrity nominal.</p>
                  <div className="alert-tags-line">
                    <span className="alert-tag">Verified at Origin</span>
                    <span className="alert-tag">Tamper-Proof</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* REASSIGN MODAL */}
      {showReassignModal && (
        <div className="haulix-modal-backdrop" onClick={() => setShowReassignModal(false)}>
          <div className="haulix-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Reassign {selectedPkg.id}</h3>
              <button className="modal-close-btn" onClick={() => setShowReassignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Transfer <b>{selectedPkg.id} ({selectedPkg.name})</b> to another active fleet vehicle:</p>
              <select
                value={reassignTargetTruck}
                onChange={(e) => setReassignTargetTruck(e.target.value)}
                className="modal-select"
              >
                <option value="TX-4821-HX">TX-4821-HX · Available Capacity 12,400 lbs</option>
                <option value="TX-7712-KL">TX-7712-KL · Available Capacity 9,800 lbs</option>
                <option value="TX-3309-MN">TX-3309-MN · Available Capacity 16,500 lbs</option>
              </select>
            </div>
            <div className="modal-foot">
              <button className="haulix-btn dark-pill" onClick={() => setShowReassignModal(false)}>Cancel</button>
              <button className="haulix-btn activate-btn" onClick={handleReassignPackage}>Confirm Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   CRISP AUTOMOTIVE 4K TEXTURE GENERATOR FOR CRATES
   ========================================================================== */


function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function generateRealisticCrateTexture(pkg: CargoPackageItem, isSelected: boolean, isHovered: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark Industrial Reinforced Matte Box
  ctx.fillStyle = isSelected ? '#332714' : isHovered ? '#23303d' : '#182028';
  ctx.fillRect(0, 0, 512, 512);

  // Surface texture / brushed metal line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 10; y < 500; y += 8) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(492, y);
    ctx.stroke();
  }

  // 2. Heavy Corner Steel Reinforcements
  ctx.strokeStyle = isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#475569';
  ctx.lineWidth = isSelected ? 12 : 6;
  ctx.strokeRect(12, 12, 488, 488);

  // Steel Corner Brackets
  const cornerSize = 48;
  ctx.fillStyle = isSelected ? '#f59e0b' : '#334155';
  [[12, 12], [500 - cornerSize, 12], [12, 500 - cornerSize], [500 - cornerSize, 500 - cornerSize]].forEach(([bx, by]) => {
    ctx.fillRect(bx, by, cornerSize, cornerSize);
  });

  // Hex bolts
  [[32, 32], [480, 32], [32, 480], [480, 480]].forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 3. Stenciled Package ID
  ctx.fillStyle = isSelected ? '#ffffff' : '#f8fafc';
  ctx.font = '900 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(pkg.id, 256, 115);

  // 4. Status Indicator Pill
  const statusColor =
    pkg.status === 'Critical' ? '#FF4D6D' :
    pkg.status === 'High' ? '#F59E0B' :
    pkg.status === 'Normal' ? '#08B5E5' : '#3B82F6';

  const statusBg =
    pkg.status === 'Critical' ? 'rgba(255, 77, 109, 0.28)' :
    pkg.status === 'High' ? 'rgba(245, 158, 11, 0.28)' :
    pkg.status === 'Normal' ? 'rgba(8, 181, 229, 0.28)' : 'rgba(59, 130, 246, 0.28)';

  ctx.fillStyle = statusBg;
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  drawRoundedRect(ctx, 256 - 90, 152, 180, 52, 26);
  ctx.fill();
  ctx.stroke();

  // Status dot
  ctx.beginPath();
  ctx.arc(256 - 54, 178, 8, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  ctx.fillStyle = statusColor;
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(pkg.status, 256 - 36, 188);

  // 5. Package Title
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  const displayTitle = pkg.name.length > 24 ? pkg.name.substring(0, 22) + '...' : pkg.name;
  ctx.fillText(displayTitle, 256, 268);

  // 6. Client Name
  ctx.fillStyle = '#7c8e9f';
  ctx.font = '500 23px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Client: ${pkg.client}`, 256, 312);

  // 7. Weight & Volume Bar
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${pkg.weightLbs.toLocaleString()} lbs  ·  ${pkg.volumeFt3} ft³`, 256, 365);

  // 8. Fragile tag
  if (pkg.fragile) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    drawRoundedRect(ctx, 256 - 85, 410, 170, 42, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚠ FRAGILE', 256, 439);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

/* ==========================================================================
   REALISTIC AUTOMOTIVE 3D TRUCK & REEFER TRAILER (PBR SHOWROOM)
   ========================================================================== */

interface RealisticAutomotiveTruck3DProps {
  packages: CargoPackageItem[];
  selectedPkgId: string;
  hoveredPkgId: string | null;
  isAutoRotating: boolean;
  zoomLevel: number;
  onSelectPkg: (id: string) => void;
  onHoverPkg: (id: string | null) => void;
}

const RealisticAutomotiveTruck3D: React.FC<RealisticAutomotiveTruck3DProps> = ({
  packages,
  selectedPkgId,
  hoveredPkgId,
  isAutoRotating,
  zoomLevel,
  onSelectPkg,
  onHoverPkg
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationRef = useRef<{ y: number; x: number }>({ y: -0.45, x: 0.16 });
  const velocityRef = useRef<{ y: number; x: number }>({ y: 0, x: 0 });
  const crateMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 14.2 / zoomLevel);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Realistic Automotive Studio 5-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Main Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(15, 20, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-15, 10, 10);
    scene.add(fillLight);

    // Electric Cyan Rim Silhouette Light
    const cyanRim = new THREE.DirectionalLight(0x08b5e5, 3.0);
    cyanRim.position.set(-16, 12, -16);
    scene.add(cyanRim);

    // Amber Rim Accent Light
    const amberRim = new THREE.DirectionalLight(0xf59e0b, 1.4);
    amberRim.position.set(16, 8, -14);
    scene.add(amberRim);

    // Overhead Light Strip
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 24, 0);
    scene.add(topLight);

    // 3. Center Root Group (Positioned at 0, 0, 0)
    const truckRoot = new THREE.Group();
    truckRoot.position.set(-0.55, -0.45, 0);
    scene.add(truckRoot);

    // ==========================================
    // PBR REALISTIC MATERIALS
    // ==========================================
    // POLAR PEARL WHITE & GLACIER METALLIC PALETTE
    const automotivePaintMat = new THREE.MeshStandardMaterial({
      color: 0xf3f6fb, // High-Sheen Polar Pearl White
      roughness: 0.12,
      metalness: 0.38
    });

    const glacierAeroMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Glacier Silver Metallic Aero Skirts & Roof Crown
      roughness: 0.22,
      metalness: 0.85
    });

    const chassisSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark Slate Chassis Steel
      roughness: 0.45,
      metalness: 0.75
    });

    const polishedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Mirror Polished Chrome Grille & Stacks
      roughness: 0.04,
      metalness: 0.98
    });

    const automotiveGlassMat = new THREE.MeshStandardMaterial({
      color: 0x091424, // Smoked Ice Tint Glass
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.84
    });

    const corrugatedContainerMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Glacier Slate Insulated Reefer Wall
      roughness: 0.30,
      metalness: 0.65
    });

    const interiorBayMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep Contrast Cold Bay Interior
      roughness: 0.55,
      metalness: 0.35
    });

    const darkCabTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.5
    });

    const realTireMat = new THREE.MeshStandardMaterial({
      color: 0x11161a,
      roughness: 0.88,
      metalness: 0.12
    });

    // 4. Ground Studio Shadow & Turntable Base
    const turntableGeo = new THREE.CylinderGeometry(8.4, 8.6, 0.12, 64);
    const turntableMat = new THREE.MeshStandardMaterial({ color: 0x10151a, roughness: 0.7, metalness: 0.2 });
    const turntable = new THREE.Mesh(turntableGeo, turntableMat);
    turntable.position.y = -1.68;
    turntable.receiveShadow = true;
    truckRoot.add(turntable);

    // Glowing Neon Cyan Showroom Ring
    const neonRing = new THREE.Mesh(
      new THREE.RingGeometry(8.0, 8.2, 64),
      new THREE.MeshBasicMaterial({ color: 0x08b5e5, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    );
    neonRing.rotation.x = -Math.PI / 2;
    neonRing.position.y = -1.61;
    truckRoot.add(neonRing);

    // 5. CHASSIS FRAME RAILS & UNDERCARRIAGE
    const frameRailGeo = new THREE.BoxGeometry(11.8, 0.24, 1.4);
    const frameRail = new THREE.Mesh(frameRailGeo, chassisSteelMat);
    frameRail.position.set(-0.2, -0.7, 0);
    truckRoot.add(frameRail);

    // Fuel Tanks with Chrome Straps (Both sides of Cab)
    [-1.0, 1.0].forEach((zSide) => {
      const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 24), polishedChromeMat);
      fuelTank.rotation.z = Math.PI / 2;
      fuelTank.position.set(-3.2, -0.65, zSide * 1.42);
      truckRoot.add(fuelTank);

      // Chrome Straps
      [-0.6, 0.6].forEach((xOff) => {
        const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 24), darkCabTrimMat);
        strap.rotation.z = Math.PI / 2;
        strap.position.set(-3.2 + xOff, -0.65, zSide * 1.42);
        truckRoot.add(strap);
      });
    });

    // 6. DETAILED KENWORTH CABIN (Left, Center x = -3.75)
    const cabGroup = new THREE.Group();
    cabGroup.position.set(-3.75, 0.4, 0);

    // Main Cab Hood & Body
    const cabLower = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.8), automotivePaintMat);
    cabLower.position.set(0, 0, 0);
    cabLower.castShadow = true;
    cabGroup.add(cabLower);

    // Sleeper Cab Upper Roof & Crown
    const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 2.8), automotivePaintMat);
    cabUpper.position.set(0.4, 1.6, 0);
    cabGroup.add(cabUpper);

    // Aerodynamic Sloped Roof Fairing
    const roofFairing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.7), glacierAeroMat);
    roofFairing.position.set(0.2, 2.45, 0);
    roofFairing.rotation.z = -0.15;
    cabGroup.add(roofFairing);

    // Sloped Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 2.5), automotiveGlassMat);
    windshield.position.set(-0.95, 1.25, 0);
    windshield.rotation.z = -0.2;
    cabGroup.add(windshield);

    // Side Windows
    [-1.42, 1.42].forEach((zSide) => {
      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.04), automotiveGlassMat);
      sideWin.position.set(-0.2, 1.2, zSide);
      cabGroup.add(sideWin);

      // Dual-Arm Side Mirrors
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.35), chassisSteelMat);
      mirror.position.set(-1.1, 1.15, zSide * 1.18);
      cabGroup.add(mirror);
    });

    // Front Chrome Radiator Grille
    const grilleBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 2.1), chassisSteelMat);
    grilleBase.position.set(-1.42, -0.1, 0);
    cabGroup.add(grilleBase);

    for (let g = 0; g < 6; g++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 1.95), polishedChromeMat);
      slat.position.set(-1.43, -0.65 + g * 0.22, 0);
      cabGroup.add(slat);
    }

    // High-Output LED Projector Headlights
    [-0.92, 0.92].forEach((zLight) => {
      const headlightHousing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.45), chassisSteelMat);
      headlightHousing.position.set(-1.41, -0.55, zLight);
      cabGroup.add(headlightHousing);

      const headlightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      headlightBulb.position.set(-1.46, -0.55, zLight);
      cabGroup.add(headlightBulb);
    });

    // Front Heavy Aerodynamic Bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 2.95), glacierAeroMat);
    bumper.position.set(-1.25, -0.9, 0);
    cabGroup.add(bumper);

    // Front Steer Axle Wheels (Wheel Rims with Lug Nuts)
    [-0.8].forEach((xPos) => {
      [1.5, -1.5].forEach((zPos) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.44, 36), realTireMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(xPos, -0.95, zPos);
        cabGroup.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.46, 24), polishedChromeMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(xPos, -0.95, zPos);
        cabGroup.add(rim);

        // Center hubcap
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 16), chassisSteelMat);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(xPos, -0.95, zPos);
        cabGroup.add(hub);
      });
    });

    truckRoot.add(cabGroup);

    // 7. DETAILED REFRIGERATED CONTAINER TRAILER (Center x = 1.35)
    const trailerGroup = new THREE.Group();
    trailerGroup.position.set(1.35, 0.4, 0);

    const trailerW = 7.4;
    const trailerH = 3.6;
    const trailerD = 3.0;

    // Back Corrugated Interior Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(trailerW, trailerH, 0.2), interiorBayMat);
    backWall.position.set(0, 0.5, -trailerD / 2);
    trailerGroup.add(backWall);

    // Trailer Floor (Heavy Aluminum T-Duct Deck)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(trailerW, 0.32, trailerD), chassisSteelMat);
    floor.position.set(0, -trailerH / 2 + 0.5, 0);
    trailerGroup.add(floor);

    // Trailer Roof Structure
    const roof = new THREE.Mesh(new THREE.BoxGeometry(trailerW, 0.32, trailerD), corrugatedContainerMat);
    roof.position.set(0, trailerH / 2 + 0.5, 0);
    trailerGroup.add(roof);

    // Front Refrigeration Unit (Thermo-King Unit on front wall of trailer)
    const reeferUnit = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 2.2), polishedChromeMat);
    reeferUnit.position.set(-trailerW / 2 - 0.15, 0.6, 0);
    trailerGroup.add(reeferUnit);

    // 4 Heavy Corner Casting Columns
    [-trailerW / 2, trailerW / 2].forEach((xPost) => {
      [-trailerD / 2, trailerD / 2].forEach((zPost) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, trailerH + 0.35, 0.25), chassisSteelMat);
        post.position.set(xPost, 0.5, zPost);
        trailerGroup.add(post);
      });
    });

    // 4 Overhead Industrial LED Fixtures (Illuminates Cargo Bay)
    for (let l = 0; l < 4; l++) {
      const lx = -2.6 + l * 1.75;
      const lightHousing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.45), chassisSteelMat);
      lightHousing.position.set(lx, trailerH / 2 + 0.32, 0);
      trailerGroup.add(lightHousing);

      const lightBulb = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.4), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
      lightBulb.position.set(lx, trailerH / 2 + 0.28, 0);
      trailerGroup.add(lightBulb);

      const bayLight = new THREE.PointLight(0xffffff, 2.0, 7.5);
      bayLight.position.set(lx, trailerH / 2 + 0.12, 0.3);
      trailerGroup.add(bayLight);
    }

    // Rear Container Open Swing Doors (Folded back cleanly on the right)
    const doorRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, trailerH, 1.4), corrugatedContainerMat);
    doorRight.position.set(trailerW / 2 + 0.08, 0.5, trailerD / 2 - 0.7);
    doorRight.rotation.y = 0.42;
    trailerGroup.add(doorRight);

    // Hydraulic Drop-Down Loading Ramp (Diamond Steel Plate)
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 2.4), corrugatedContainerMat);
    ramp.position.set(0, -trailerH / 2 + 0.15, trailerD / 2 + 1.1);
    ramp.rotation.x = 0.36;
    trailerGroup.add(ramp);

    // Steel Grip Treads on Ramp
    for (let r = 0; r < 5; r++) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 0.1), polishedChromeMat);
      ridge.position.set(0, 0.08, -0.9 + r * 0.45);
      ramp.add(ridge);
    }

    // Hydraulic Cylinders supporting ramp
    [-1.6, 1.6].forEach((xPiston) => {
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 16), polishedChromeMat);
      piston.rotation.x = 0.55;
      piston.position.set(xPiston, -trailerH / 2 + 0.3, trailerD / 2 + 0.6);
      trailerGroup.add(piston);
    });

    // Tandem Dual-Wheel Axles (4 Double-Wheels on Trailer)
    [1.8, 3.1].forEach((xPos) => {
      [1.5, -1.5].forEach((zPos) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.44, 36), realTireMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(xPos, -0.95, zPos);
        trailerGroup.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.46, 24), polishedChromeMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(xPos, -0.95, zPos);
        trailerGroup.add(rim);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 16), chassisSteelMat);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(xPos, -0.95, zPos);
        trailerGroup.add(hub);
      });
    });

    truckRoot.add(trailerGroup);

    // 8. 12 MODULAR ILLUMINATED CARGO CRATES (Ultra-Crisp 4K Front Face)
    crateMeshesRef.current.clear();

    packages.forEach((pkg) => {
      const colX = -2.55 + pkg.col * 1.7;
      const rowY = 1.6 - pkg.row * 0.95;
      const boxW = 1.5;
      const boxH = 0.86;
      const boxD = 1.85;

      const isSelected = pkg.id === selectedPkgId;
      const isHovered = pkg.id === hoveredPkgId;

      const texture4K = generateRealisticCrateTexture(pkg, isSelected, isHovered);

      const sideMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x332612 : isHovered ? 0x222d38 : 0x1a222a,
        roughness: 0.35,
        metalness: 0.65
      });
      const frontMat = new THREE.MeshStandardMaterial({
        map: texture4K,
        roughness: 0.25,
        metalness: 0.5,
        emissive: isSelected ? 0xf59e0b : isHovered ? 0x38bdf8 : 0x000000,
        emissiveIntensity: isSelected ? 0.25 : isHovered ? 0.12 : 0
      });

      const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat];
      const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
      const crateMesh = new THREE.Mesh(boxGeo, materials);
      crateMesh.position.set(colX, rowY, -0.3);
      crateMesh.userData = { id: pkg.id, name: pkg.name };

      if (isSelected) {
        const wireGeo = new THREE.WireframeGeometry(boxGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
        const wireframe = new THREE.LineSegments(wireGeo, wireMat);
        crateMesh.add(wireframe);
      }

      trailerGroup.add(crateMesh);
      crateMeshesRef.current.set(pkg.id, crateMesh);
    });

    // 9. BUTTERY FLUID 360° DRAG ORBIT WITH INERTIA DAMPING
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      velocityRef.current = { x: 0, y: 0 };
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        const crates = Array.from(crateMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(crates, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const hitId = hit.userData?.id;
          if (hitId && hitId !== hoveredPkgId) {
            onHoverPkg(hitId);
          }
        } else if (hoveredPkgId) {
          onHoverPkg(null);
        }
        return;
      }

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      velocityRef.current = { y: deltaX * 0.007, x: deltaY * 0.005 };

      rotationRef.current.y += velocityRef.current.y;
      rotationRef.current.x = Math.max(-0.35, Math.min(0.65, rotationRef.current.x + velocityRef.current.x));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const crates = Array.from(crateMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(crates, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData?.id) {
          onSelectPkg(hit.userData.id);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        velocityRef.current = { x: 0, y: 0 };
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      velocityRef.current = { y: deltaX * 0.007, x: deltaY * 0.005 };

      rotationRef.current.y += velocityRef.current.y;
      rotationRef.current.x = Math.max(-0.35, Math.min(0.65, rotationRef.current.x + velocityRef.current.x));

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // 10. Animation Render Loop with Inertia Damping
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotating && !isDraggingRef.current) {
        rotationRef.current.y += 0.006;
      } else if (!isDraggingRef.current) {
        // Damping physics
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x = Math.max(-0.35, Math.min(0.65, rotationRef.current.x + velocityRef.current.x));
        velocityRef.current.y *= 0.92;
        velocityRef.current.x *= 0.92;
      }

      truckRoot.rotation.y = rotationRef.current.y;
      truckRoot.rotation.x = rotationRef.current.x;
      camera.position.z = 14.2 / zoomLevel;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [packages, selectedPkgId, hoveredPkgId, isAutoRotating, zoomLevel]);

  return (
    <div className="three-truck-canvas-container" ref={mountRef} style={{ cursor: 'grab' }} />
  );
};
