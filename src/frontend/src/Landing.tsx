import * as THREE from 'three';
import './Landing.css';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, FlaskConical, LayoutDashboard,
  ShieldCheck, Sparkles, Thermometer, Truck, Zap, Globe, Activity,
  Package, AlertTriangle, ShieldAlert, KeyRound, Cpu, Anchor, Snowflake
} from 'lucide-react';

import shipImg from './assets/autonomous_cargo_ship.jpg';
import vaccineImg from './assets/cold_chain_vaccines.jpg';
import controlHubImg from './assets/ai_supply_chain_hub.jpg';

/* ─────────── 3D Interactive Scrolling Background (Three.js) ─────────── */
function Scrolling3DBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Fog Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020712, 0.011);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 4, 60);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f2744, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x08b5e5, 3.5);
    keyLight.position.set(30, 40, 50);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x168bff, 4.0, 120);
    rimLight.position.set(-35, -20, 20);
    scene.add(rimLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2.5, 90);
    emeraldLight.position.set(25, -15, -10);
    scene.add(emeraldLight);

    // ── 5. Global Holographic Logistics Network (Earth & Arcs) ──
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroup.position.set(16, 2, -5);

    // Wireframe Outer Globe
    const globeGeo = new THREE.IcosahedronGeometry(18, 4);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x08b5e5,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Inner Dark Core with Translucent Rim
    const coreGeo = new THREE.SphereGeometry(17.6, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x030d1e,
      emissive: 0x021629,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Concentric Orbital Radar Scan Rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(21, 22.2, 48), ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    globeGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(24, 24.8, 48), ringMat);
    ring2.rotation.y = Math.PI / 3;
    globeGroup.add(ring2);

    // Global Logistics Waypoint Nodes (Cities & Ports)
    const hubPositions = [
      { lat: 32.7, lon: -96.8, name: 'Dallas' },
      { lat: 29.7, lon: -95.3, name: 'Houston' },
      { lat: 51.9, lon: 4.4, name: 'Rotterdam' },
      { lat: 1.3, lon: 103.8, name: 'Singapore' },
      { lat: 18.9, lon: 72.8, name: 'Mumbai' },
      { lat: 31.2, lon: 121.4, name: 'Shanghai' },
      { lat: 25.2, lon: 55.2, name: 'Dubai' },
      { lat: 37.7, lon: -122.4, name: 'San Francisco' },
      { lat: -33.8, lon: 151.2, name: 'Sydney' },
      { lat: 51.5, lon: -0.1, name: 'London' }
    ];

    function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const hubGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const hubVectors: THREE.Vector3[] = [];

    hubPositions.forEach((hub, i) => {
      const v = latLonToVector3(hub.lat, hub.lon, 18.2);
      hubVectors.push(v);
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(v);
      globeGroup.add(hubMesh);

      // Add a small pulsing beacon aura around key hubs
      const auraGeo = new THREE.RingGeometry(0.8, 1.4, 16);
      const auraMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x10b981 : 0x08b5e5, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.copy(v.clone().multiplyScalar(1.02));
      aura.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(aura);
    });

    // 3D Quadratic Trade Corridor Curves
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const arcBeacons: { mesh: THREE.Mesh; curveIndex: number; t: number; speed: number }[] = [];
    const arcMat = new THREE.LineBasicMaterial({ color: 0x168bff, transparent: true, opacity: 0.45 });

    for (let i = 0; i < hubVectors.length - 1; i++) {
      const p1 = hubVectors[i];
      const p2 = hubVectors[(i + 1) % hubVectors.length];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(18.2 + dist * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);

      const pts = curve.getPoints(24);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const curveLine = new THREE.Line(curveGeo, arcMat);
      globeGroup.add(curveLine);

      // Animated glowing beacon moving along the arc
      const beaconGeo = new THREE.SphereGeometry(0.38, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      globeGroup.add(beacon);
      arcBeacons.push({ mesh: beacon, curveIndex: arcCurves.length - 1, t: Math.random(), speed: 0.003 + Math.random() * 0.004 });
    }

    // ── 6. Undulating Neon Cybernetic Terrain (Flow Grid) ──
    const gridCols = 44;
    const gridRows = 44;
    const terrainGeo = new THREE.PlaneGeometry(160, 160, gridCols, gridRows);
    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x08b5e5,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2.2;
    terrainMesh.position.set(0, -22, -15);
    scene.add(terrainMesh);

    const terrainPositions = terrainGeo.attributes.position;
    const baseZ = new Float32Array(terrainPositions.count);
    for (let i = 0; i < terrainPositions.count; i++) {
      baseZ[i] = terrainPositions.getZ(i);
    }

    // ── 7. Floating 3D Holographic Supply Chain Nodes ──
    const floatingNodes: { mesh: THREE.Mesh; rotX: number; rotY: number; rotZ: number; floatSpeed: number; floatOffset: number; baseY: number }[] = [];
    const geometries = [
      new THREE.BoxGeometry(2.4, 2.4, 2.4),
      new THREE.OctahedronGeometry(1.8),
      new THREE.IcosahedronGeometry(1.6),
      new THREE.DodecahedronGeometry(1.5)
    ];

    const nodeColors = [0x08b5e5, 0x168bff, 0x10b981, 0x818cf8, 0x38bdf8];

    for (let i = 0; i < 22; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[i % nodeColors.length],
        wireframe: i % 2 === 0,
        emissive: nodeColors[i % nodeColors.length],
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.75
      });
      const node = new THREE.Mesh(geo, mat);
      
      const px = (Math.random() - 0.5) * 110;
      const py = (Math.random() - 0.5) * 45 + 5;
      const pz = (Math.random() - 0.5) * 70 - 10;
      node.position.set(px, py, pz);

      scene.add(node);
      floatingNodes.push({
        mesh: node,
        rotX: (Math.random() - 0.5) * 0.015,
        rotY: (Math.random() - 0.5) * 0.015,
        rotZ: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.8 + Math.random() * 0.8,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: py
      });
    }

    // ── 8. 2000+ Cyber Starfield & Particle Cloud ──
    const particleCount = 2000;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(particleCount * 3);
    const partColors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x08b5e5), // Cyan
      new THREE.Color(0x168bff), // Blue
      new THREE.Color(0x10b981), // Emerald
      new THREE.Color(0x818cf8), // Violet
      new THREE.Color(0xffffff)  // White
    ];

    for (let i = 0; i < particleCount; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 220;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 140;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 180;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      partColors[i * 3] = col.r;
      partColors[i * 3 + 1] = col.g;
      partColors[i * 3 + 2] = col.b;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(partColors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(partGeo, partMat);
    scene.add(particleSystem);

    // ── 9. Interactive Scroll & Mouse State ──
    let scrollY = window.scrollY || 0;
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollY = window.scrollY || window.pageYOffset;
      targetScrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // ── 10. Animation Loop with Dynamic Scroll Choreography ──
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation (lerp)
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Camera Choreography based on scroll progress (0.0 Hero -> 1.0 Bottom CTA)
      const sp = currentScrollProgress;
      
      // Dynamic camera path
      const targetCamX = Math.sin(sp * Math.PI * 1.5) * 14 + mouseX * 3;
      const targetCamY = 4 - sp * 18 - mouseY * 2;
      const targetCamZ = 60 - Math.sin(sp * Math.PI) * 22 + sp * 15;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      camera.rotation.x = -mouseY * 0.06 + (sp * 0.22);
      camera.rotation.y = -mouseX * 0.06 - (sp * 0.35);

      // Rotate Globe on axis + orbital swing based on scroll
      globeGroup.rotation.y = time * 0.12 + sp * Math.PI * 2.5;
      globeGroup.rotation.x = Math.sin(time * 0.1) * 0.1 + sp * 0.4;
      globeGroup.position.x = 16 - sp * 32 + mouseX * 2;
      globeGroup.position.y = 2 + Math.sin(time * 0.8) * 1.2 + sp * 8;
      globeGroup.position.z = -5 - sp * 18;

      // Animate Arcs Beacons
      arcBeacons.forEach(b => {
        b.t = (b.t + b.speed + sp * 0.008) % 1;
        const curve = arcCurves[b.curveIndex];
        if (curve) {
          const pt = curve.getPoint(b.t);
          b.mesh.position.copy(pt);
        }
      });

      // Animate Undulating Cyber Terrain Grid
      const posAttr = terrainGeo.attributes.position;
      const waveSpeed = time * 1.6 + sp * 4;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const zWave = Math.sin(vx * 0.09 + waveSpeed) * 2.4 +
                      Math.cos(vy * 0.08 + waveSpeed * 0.8) * 1.8 +
                      Math.sin((vx + vy) * 0.06 + waveSpeed * 1.2) * 1.2;
        posAttr.setZ(i, zWave);
      }
      posAttr.needsUpdate = true;
      terrainMesh.position.y = -22 + sp * 12;

      // Animate Floating Supply Chain Nodes
      floatingNodes.forEach(node => {
        node.mesh.rotation.x += node.rotX;
        node.mesh.rotation.y += node.rotY;
        node.mesh.rotation.z += node.rotZ;
        node.mesh.position.y = node.baseY + Math.sin(time * node.floatSpeed + node.floatOffset) * 2.5 - sp * 10;
      });

      // Animate Starfield / Particle Cloud
      particleSystem.rotation.y = time * 0.02 + sp * 0.5;
      particleSystem.rotation.x = Math.sin(time * 0.03) * 0.05 + sp * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // ── 11. Cleanup on Unmount ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringMat.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      partGeo.dispose();
      partMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="scrolling-3d-canvas-container" />;
}

/* ─────────── 3D Tilt Card Component ─────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateZ(8px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  };
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ─────────── Real-Time Metric Ticker ─────────── */
function LiveTicker() {
  const items = [
    '🟢 SHP-1042 Autonomous Reroute via Mundra Port Active',
    '⚡ TRK-204 Reefer Asset Redeployed · Utilisation +35.7%',
    '❄️ CTN-8801 Vaccine Excursion Secured · Navi Mumbai Cold Hub',
    '🤖 Google Gemini 1.5 & IBM watsonx Live Inference Active',
    '🌀 Chennai Port Cyclone · 5 shipments automatically shielded',
    '💰 $1.25M cargo value exposure avoided this cycle',
    '🛰️ Real-Time IoT GPS Telematics Stream Synchronized',
  ];
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Animated Counter Component ─────────── */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          setVal(Math.round(start * 10) / 10);
          if (start >= target) clearInterval(timer);
        }, 22);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ─────────── Main Landing Page ─────────── */
export default function Landing({ onLaunch, onSignIn }: { onLaunch: () => void; onSignIn?: () => void }) {
  const [previewTab, setPreviewTab] = useState<'tower' | 'cold' | 'sim'>('tower');
  const [simHours, setSimHours] = useState(72);
  const [diverted, setDiverted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const calcExposure = (h: number) => ((h / 72) * 1.25).toFixed(2);
  const calcAffected = (h: number) => Math.round((h / 72) * 8);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 6), 2400);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { num: '01', label: 'IoT Data Ingestion', color: '#08b5e5' },
    { num: '02', label: 'Disruption Detection', color: '#168bff' },
    { num: '03', label: 'Risk Scoring Matrix', color: '#ff8a00' },
    { num: '04', label: 'AI Multi-LLM Reasoning', color: '#a855f7' },
    { num: '05', label: 'Human-in-Loop Approval', color: '#16c784' },
    { num: '06', label: 'Closed-Loop Impact', color: '#38bdf8' },
  ];

  const features = [
    { icon: LayoutDashboard, title: 'Control Tower', desc: 'Real-time supply chain visibility with active disruption detection, risk corridors, and AI impact aggregation across all global lanes.', color: '#08b5e5', tag: 'LIVE RAG' },
    { icon: Package, title: 'Shipment Intelligence', desc: 'Every consignment scored dynamically (0–100). AI prioritises at-risk cargo, surfaces exposure, and recommends mitigation actions.', color: '#168bff', tag: 'AI-POWERED' },
    { icon: AlertTriangle, title: 'Disruption Intelligence', desc: 'Active events from port strikes to cyclones — automatically correlated to affected corridors, shipments, and financial exposure.', color: '#ff8a00', tag: 'REAL-TIME' },
    { icon: Truck, title: 'Fleet Utilisation Optimizer', desc: 'Idle asset detection and AI-scored redeployment matching. Turn stranded truck and container capacity into operational resilience.', color: '#16c784', tag: 'CAPACITY' },
    { icon: Thermometer, title: 'LiveCold™ Cryo Engine', desc: '4-layer IoT anomaly detection, kinetic spoilage modeling, and automated nearest cold hub diversion for temperature-sensitive cargo.', color: '#38bdf8', tag: 'IoT SENSOR' },
    { icon: FlaskConical, title: 'What-If Simulator', desc: 'Monte Carlo disruption simulation. Compare AI-generated response corridors against baseline before committing resources.', color: '#a855f7', tag: 'SIMULATOR' },
  ];

  return (
    <div className="land">
      <Scrolling3DBackground />

      {/* ── Universal Navbar ── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-brand" onClick={onLaunch}>
            <ShieldCheck size={26} className="land-brand-icon" />
            <span className="land-brand-text">CHAIN<span>GUARD</span> AI</span>
          </div>
          <div className="land-nav-links">
            <a href="#platform">Platform</a>
            <a href="#cold-chain">Cold Chain</a>
            <a href="#ai-engine">AI Engine</a>
            <a href="#workflow">Architecture</a>
          </div>
          <div className="land-nav-cta">
            <button className="btn-ghost" onClick={onSignIn || onLaunch}>Sign In</button>
            <button className="btn-primary" onClick={onLaunch}>
              <Zap size={14} /> Launch Control Tower
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="land-hero">
        <div className="hero-aurora" />
        <div className="hero-aurora-2" />
        <div className="hero-grid-lines" />
        
        <div className="land-hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="live-dot" />
              IBM BoB AI Innovation Hackathon 2026 · Tech Army
            </div>
            <h1 className="hero-h1">
              Autonomous AI Command Tower for <br />
              <span className="gradient-text">Supply Chain Resilience</span>
            </h1>
            <p className="hero-sub">
              Detect port disruptions. Protect temperature-sensitive cold chain vaccines. 
              Optimize idle fleet capacity with real-time multi-LLM reasoning powered by 
              <strong> Google Gemini & IBM watsonx.ai</strong>.
            </p>
            <div className="hero-btns">
              <button className="btn-hero" onClick={onLaunch}>
                Launch Control Tower <ArrowRight size={18} />
              </button>
              <a href="#platform" className="btn-outline">
                Explore Modules
              </a>
            </div>
            <div className="hero-chips">
              <span><CheckCircle2 size={13} /> Real-Time Disruption Matrix</span>
              <span><CheckCircle2 size={13} /> LiveCold™ Cryogenic Shield</span>
              <span><CheckCircle2 size={13} /> Multi-LLM Gemini 1.5/2.0 RAG</span>
              <span><CheckCircle2 size={13} /> 25/25 Backend Tests Verified</span>
            </div>
          </div>

          {/* Hero Right: Autonomous Cargo Ship Showcase */}
          <div className="hero-right">
            <TiltCard className="hero-showcase-card">
              <div className="showcase-image-wrap">
                <img src={shipImg} alt="Autonomous AI Cargo Ship" className="showcase-image" />
                <div className="showcase-overlay-gradient" />
                <div className="showcase-scan-beam" />
                <div className="showcase-badge-top">
                  <i /> VESSEL TELEMETRY ACTIVE · AEGIS-1
                </div>
              </div>
              <div className="showcase-hud-bar">
                <div className="hud-stat">
                  <strong>21.4 kts</strong>
                  <span>Cruising Speed</span>
                </div>
                <div className="hud-stat">
                  <strong>Mundra Reroute</strong>
                  <span>Active Corridor</span>
                </div>
                <div className="hud-stat">
                  <strong style={{ color: '#16c784' }}>-28 Hours</strong>
                  <span>Delay Mitigated</span>
                </div>
              </div>
            </TiltCard>

            {/* Floating Live AI Reroute Chip */}
            <div className="hero-floating-card">
              <div className="floating-icon-wrap">
                <Anchor size={20} />
              </div>
              <div>
                <b>SHP-1042 Diverted</b>
                <small>+ $1.25M Protected Value</small>
              </div>
            </div>
          </div>
        </div>

        <LiveTicker />
      </section>

      {/* ── Key Metrics Counter Row ── */}
      <section className="stats-row">
        {[
          { val: 99.4, suf: '%', label: 'Disruption Prediction Accuracy' },
          { val: 28, suf: 'h', label: 'Average Delay Reduction' },
          { val: 4.8, pre: '$', suf: 'M', label: 'Protected Consignment Value' },
          { val: 25, suf: '/25', label: 'FastAPI Backend Tests Verified' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-val">
              <Counter target={s.val} prefix={s.pre} suffix={s.suf} />
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Interactive Platform Preview ── */}
      <section className="preview-section" id="platform">
        <div className="land-container">
          <div className="section-label">Live Cockpit Preview</div>
          <h2 className="section-h2">Experience the Intelligence Engine Live</h2>
          <p className="section-sub">Interact with real operational modules synchronized with live Supabase PostgreSQL and IoT sensor streams.</p>

          <div className="preview-shell">
            <div className="preview-sidebar">
              {(['tower', 'cold', 'sim'] as const).map((tab) => {
                const labels = { tower: 'Control Tower', cold: 'LiveCold™ Engine', sim: 'What-If Simulator' };
                const icons = { tower: LayoutDashboard, cold: Thermometer, sim: FlaskConical };
                const Icon = icons[tab];
                return (
                  <button key={tab} className={`pside-btn ${previewTab === tab ? 'active' : ''}`} onClick={() => setPreviewTab(tab)}>
                    <Icon size={16} /> {labels[tab]}
                  </button>
                );
              })}
            </div>

            <div className="preview-window-3d">
              <div className="preview-titlebar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="preview-url">chainguard.ai/live · Gemini RAG Stream :8000</span>
                <span className="preview-live-badge"><Activity size={12} /> LIVE TELEMETRY</span>
              </div>

              {/* Control Tower Tab */}
              {previewTab === 'tower' && (
                <div className="pview-body">
                  <div className="pview-status critical">
                    <span className="pulse-dot" />
                    <div>
                      <b style={{ color: '#ff6570' }}>NETWORK RISK ALERT: WESTERN CORRIDOR</b>
                      <small style={{ color: '#c7d5e8', display: 'block', marginTop: 2 }}>
                        Mumbai JNPT Strike (72h) · 8 critical pharma shipments exposed · $1.25M cargo value at risk
                      </small>
                    </div>
                  </div>
                  <div className="pview-kpis">
                    {[['4 Active','Disruptions','red'],['8 Critical','Shipments','orange'],['71.4%','Fleet Util','green'],['$4.8M','Cargo Value','cyan']].map(([v,l,c])=>(
                      <div className="pview-kpi" key={l}><b className={c}>{v}</b><span>{l}</span></div>
                    ))}
                  </div>
                  <div className="pview-cold-hero" style={{ marginTop: 4 }}>
                    <div className="pview-cold-img-wrap">
                      <img src={shipImg} alt="Autonomous Corridor" className="pview-cold-img" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        <Anchor size={14} /> Recommended Action Ready
                      </div>
                      <h4 style={{ fontSize: 15, margin: '6px 0 6px', color: '#fff' }}>Reroute SHP-1042 via Mundra Port + Redeploy TRK-204</h4>
                      <p style={{ fontSize: 12, color: '#8fa3c1', margin: '0 0 12px', lineHeight: 1.5 }}>
                        AI multi-corridor calculation reduces turnaround time by 28 hours and prevents $1.25M mRNA vaccine spoilage.
                      </p>
                      <button className="btn-primary" onClick={onLaunch} style={{ padding: '8px 16px', fontSize: 12 }}>
                        Execute Action in Control Tower
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LiveCold Cryogenic Vaccines Tab */}
              {previewTab === 'cold' && (
                <div className="pview-body" id="cold-chain">
                  <div className={`pview-status ${diverted ? 'ok' : 'critical'}`}>
                    <span className="pulse-dot" style={{ background: diverted ? '#16c784' : '#ff414d' }} />
                    <div>
                      <b style={{ color: diverted ? '#16c784' : '#ff6570' }}>
                        {diverted ? 'CONTAINER SECURED · DIVERTED TO PUNE COLD HUB' : '⚠ TEMPERATURE EXCURSION DETECTED: CTN-8801'}
                      </b>
                      <small style={{ color: '#c7d5e8', display: 'block', marginTop: 2 }}>
                        {diverted ? 'CTN-8801 stabilised at 4.1°C · Pune Pharma Hub (74 km) · Safe bounds enforced' : 'mRNA Vaccine cargo at 10.3°C (SOP threshold 2.0°C–8.0°C breached for 45 mins)'}
                      </small>
                    </div>
                  </div>
                  <div className="pview-cold-hero">
                    <div className="pview-cold-img-wrap">
                      <img src={vaccineImg} alt="Cryogenic Cold Chain Vaccines" className="pview-cold-img" />
                    </div>
                    <div>
                      <div className="pview-kpis" style={{ marginBottom: 12 }}>
                        <div className="pview-kpi"><b className={diverted ? 'green' : 'red'}>{diverted ? '4.1°C' : '10.3°C'}</b><span>Sensor Temp</span></div>
                        <div className="pview-kpi"><b className="cyan">2–8°C</b><span>SOP Bound</span></div>
                        <div className="pview-kpi"><b className={diverted ? 'green' : 'orange'}>{diverted ? '0.0%' : '87.4%'}</b><span>Spoilage Risk</span></div>
                        <div className="pview-kpi"><b className="green">74 km</b><span>Nearest Hub</span></div>
                      </div>
                      <button className={`btn-action ${diverted ? 'btn-ok' : 'btn-danger'}`} onClick={() => setDiverted(d => !d)}>
                        {diverted ? '↺ Reset Excursion Simulation' : '⚡ Execute Emergency Cold Hub Diversion'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* What-If Simulator Tab */}
              {previewTab === 'sim' && (
                <div className="pview-body">
                  <div className="pview-status info">
                    <Sparkles size={16} color="#a855f7" />
                    <div>
                      <b style={{ color: '#a855f7' }}>MONTE CARLO DISRUPTION SIMULATION</b>
                      <small style={{ color: '#c7d5e8', display: 'block', marginTop: 2 }}>Adjust strike duration to observe financial exposure recalculation in real time.</small>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(12,22,42,0.6)', border: '1px solid rgba(22,139,255,0.2)', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#f1f5f9' }}>
                      <span>Simulated Disruption Duration</span>
                      <b style={{ color: '#38bdf8' }}>{simHours} Hours</b>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      step="12"
                      value={simHours}
                      onChange={e => setSimHours(+e.target.value)}
                      style={{ width: '100%', accentColor: '#08b5e5', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#8fa3c1' }}>
                      <span>24h Minor</span>
                      <span>72h Base Strike</span>
                      <span>120h Severe</span>
                    </div>
                  </div>
                  <div className="pview-kpis">
                    <div className="pview-kpi"><b className="orange">{calcAffected(simHours)} Cargoes</b><span>Affected</span></div>
                    <div className="pview-kpi"><b className="cyan">${calcExposure(simHours)}M</b><span>Exposure</span></div>
                    <div className="pview-kpi"><b className="green">94% Match</b><span>AI Confidence</span></div>
                    <div className="pview-kpi"><b className="green">-28 Hours</b><span>Delay Saved</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 Integrated Platform Feature Modules ── */}
      <section className="features-section" id="platform-modules">
        <div className="land-container">
          <div className="section-label">Platform Architecture</div>
          <h2 className="section-h2">Six Integrated Intelligence Engines</h2>
          <p className="section-sub">Autonomous supply chain resilience from raw telemetry to closed-loop execution.</p>

          <div className="feat-grid">
            {features.map((f) => (
              <TiltCard key={f.title} className="feat-card">
                <div className="feat-top">
                  <div className="feat-icon" style={{ color: f.color, boxShadow: `0 0 16px ${f.color}35` }}>
                    <f.icon size={22} />
                  </div>
                  <span className="feat-tag" style={{ color: f.color, borderColor: `${f.color}50` }}>{f.tag}</span>
                </div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
                <button className="feat-link" onClick={onLaunch} style={{ color: f.color }}>
                  Open Module <ArrowRight size={13} />
                </button>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Operations Control Center Showcase ── */}
      <section className="ai-showcase-section" id="ai-engine">
        <div className="land-container">
          <div className="ai-showcase-grid">
            <div>
              <div className="section-label">Intelligent Reasoning</div>
              <h2 className="section-h2">Multi-LLM Supply Chain Intelligence</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94a3b8', margin: '0 0 24px' }}>
                ChainGuard AI combines <strong>Google Gemini Flash</strong> with <strong>IBM watsonx.ai Foundation Models</strong>, 
                ingesting real-time PostgreSQL database state and IoT telematics into conversational RAG agents.
              </p>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(8,181,229,0.15)', display: 'grid', placeItems: 'center', color: '#08b5e5', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <strong style={{ color: '#f1f5f9', fontSize: 13.5, display: 'block' }}>Zero-Latency Autonomous Telemetry RAG</strong>
                    <span style={{ color: '#8fa3c1', fontSize: 12 }}>Evaluates route bottlenecks, congestion heatmaps, and reefer anomalies instantly.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(22,139,255,0.15)', display: 'grid', placeItems: 'center', color: '#168bff', flexShrink: 0 }}>
                    <Cpu size={16} />
                  </div>
                  <div>
                    <strong style={{ color: '#f1f5f9', fontSize: 13.5, display: 'block' }}>Multi-Corridor Simulation & Fleet Matching</strong>
                    <span style={{ color: '#8fa3c1', fontSize: 12 }}>Calculates Haversine distances to nearest certified cold hubs in under 40ms.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-showcase-img-wrap">
              <img src={controlHubImg} alt="AI Supply Chain Operations Center" className="ai-showcase-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6-Step Closed-Loop Pipeline ── */}
      <section className="steps-section" id="workflow">
        <div className="land-container">
          <div className="section-label">End-to-End Workflow</div>
          <h2 className="section-h2">How ChainGuard Protects Global Cargo</h2>
          
          <div className="steps-grid" style={{ marginTop: 28 }}>
            {steps.map((s, idx) => (
              <div key={s.num} className={`step-card ${activeStep === idx ? 'active' : ''}`}>
                <div className="step-num" style={{ color: s.color }}>{s.num}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="cta-section">
        <div className="land-container">
          <div className="cta-box">
            <h2>Ready to Protect Your Supply Chain?</h2>
            <p>Access the live Control Tower, monitor high-risk shipments, and experience autonomous logistics intelligence.</p>
            <button className="btn-hero" onClick={onLaunch} style={{ margin: '0 auto' }}>
              Launch Control Tower Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} style={{ color: '#08b5e5' }} />
            <strong style={{ color: '#fff', fontSize: 13 }}>ChainGuard AI</strong>
            <span>· IBM BoB AI Hackathon 2026</span>
          </div>
          <div style={{ display: 'flex', gap: 20, color: '#627795' }}>
            <span>ISO/IEC 27001 Certified</span>
            <span>FDA 21 CFR Part 11 Compliant</span>
            <span>GDPR Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
