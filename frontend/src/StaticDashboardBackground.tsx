import React from 'react';
import shipBg from './assets/autonomous_cargo_ship.jpg';
import hubBg from './assets/ai_supply_chain_hub.jpg';
import coldBg from './assets/cold_chain_vaccines.jpg';

export interface StaticDashboardBackgroundProps {
  activeRoute?: string;
}

export function StaticDashboardBackground({ activeRoute = '/app' }: StaticDashboardBackgroundProps) {
  const getImageConfig = (route: string) => {
    switch (route) {
      case '/cold-chain':
        return {
          img: coldBg,
          tag: 'LIVECOLD™ CRYO & PHARMA COLD-CHAIN ENGINE',
          coords: 'TEMP SOP: 2.0°C TO 8.0°C · 4-LAYER IOT SENSORS',
          accent: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.22)'
        };
      case '/command-center':
      case '/copilot':
      case '/what-if':
        return {
          img: hubBg,
          tag: 'AI COMMAND TOWER · MULTI-LLM LIVE RAG ENGINE',
          coords: 'WATSONX + GEMINI FLASH · 18MS INFERENCE',
          accent: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.22)'
        };
      case '/shipments':
        return {
          img: shipBg,
          tag: 'GLOBAL MARITIME SHIPMENT TELEMETRY · 23 ACTIVE LANES',
          coords: 'DYNAMIC RISK SCORING · HAVERSINE ROUTE SOLVER',
          accent: '#168bff',
          glow: 'rgba(22, 139, 255, 0.25)'
        };
      case '/disruptions':
        return {
          img: shipBg,
          tag: 'INCIDENT INTELLIGENCE & CORRIDOR SHIELD',
          coords: 'MUMBAI JNPT STRIKE · MUNDRA REROUTE ACTIVE',
          accent: '#ff414d',
          glow: 'rgba(255, 65, 77, 0.22)'
        };
      case '/fleet':
        return {
          img: shipBg,
          tag: 'INTERMODAL FLEET UTILIZATION & RECOVERY MATRIX',
          coords: '186 ASSETS · 71.4% CAPACITY UTILIZATION',
          accent: '#10b981',
          glow: 'rgba(16, 185, 129, 0.22)'
        };
      case '/app':
      case '/control-tower':
      default:
        return {
          img: shipBg,
          tag: 'CHAIN GUARD AI CONTROL TOWER · AUTONOMOUS MARITIME NETWORK',
          coords: 'LIVE NETWORK TELEMETRY · ISO/IEC 27001 · FDA 21 CFR',
          accent: '#08b5e5',
          glow: 'rgba(8, 181, 229, 0.25)'
        };
    }
  };

  const config = getImageConfig(activeRoute);

  return (
    <div
      className="static-dashboard-background"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: '#030814',
      }}
    >
      {/* 1. High-Resolution Vivid Static Background Artwork */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${config.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.48,
          filter: 'saturate(1.35) contrast(1.2) brightness(0.88)',
          transform: 'scale(1.02)',
          transition: 'background-image 0.4s ease, opacity 0.4s ease',
        }}
      />

      {/* 2. Cybernetic Gradient Lighting & Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 80% 15%, ${config.glow} 0%, transparent 60%),
            radial-gradient(ellipse at 20% 85%, rgba(22, 139, 255, 0.15) 0%, transparent 60%),
            linear-gradient(180deg, rgba(3, 8, 20, 0.55) 0%, rgba(3, 8, 20, 0.4) 50%, rgba(3, 8, 20, 0.75) 100%),
            linear-gradient(90deg, rgba(3, 8, 20, 0.7) 0%, rgba(3, 8, 20, 0.25) 30%, rgba(3, 8, 20, 0.35) 100%)
          `,
        }}
      />

      {/* 3. Static High-Tech Telemetry Dot Matrix Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px',
          opacity: 0.75,
        }}
      />

      {/* 4. Static SVG Tactical Blueprint Arcs & Target Reticles */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.45,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="staticLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#08b5e5" stopOpacity="0" />
            <stop offset="30%" stopColor="#08b5e5" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#168bff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#168bff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Global Logistics Blueprint Arcs */}
        <path
          d="M 260,340 Q 700,90 1250,260"
          fill="none"
          stroke="#08b5e5"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <path
          d="M 500,600 Q 980,180 1520,440"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Tactical Crosshair Reticles */}
        <g transform="translate(700, 180)">
          <circle r="16" fill="none" stroke="#08b5e5" strokeWidth="1.2" strokeDasharray="4 2" />
          <circle r="5" fill="#08b5e5" />
          <line x1="-24" y1="0" x2="24" y2="0" stroke="#08b5e5" strokeWidth="1" />
          <line x1="0" y1="-24" x2="0" y2="24" stroke="#08b5e5" strokeWidth="1" />
        </g>
        <g transform="translate(1250, 260)">
          <circle r="14" fill="none" stroke="#168bff" strokeWidth="1.2" />
          <circle r="4" fill="#10b981" />
        </g>
        <g transform="translate(980, 390)">
          <circle r="12" fill="none" stroke="#38bdf8" strokeWidth="1" />
          <circle r="3" fill="#38bdf8" />
        </g>

        {/* Tactical Corner Tech Brackets */}
        <path d="M 260,85 L 285,85 L 285,110" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <path d="M calc(100% - 25px),85 L calc(100% - 50px),85 L calc(100% - 50px),110" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <path d="M 260,calc(100% - 25px) L 285,calc(100% - 25px) L 285,calc(100% - 50px)" fill="none" stroke="#38bdf8" strokeWidth="2" />
      </svg>

      {/* 5. Static HUD Telemetry Stamp (Bottom-Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          background: 'rgba(6, 12, 28, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${config.accent}55`,
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: config.accent, boxShadow: `0 0 8px ${config.accent}` }} />
          <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.8px' }}>
            {config.tag}
          </span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#8fa3c1', letterSpacing: '0.5px' }}>
          {config.coords}
        </span>
      </div>
    </div>
  );
}

export default StaticDashboardBackground;
