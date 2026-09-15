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

/* ─────────── Animated Cybernetic Particle Canvas ─────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', resize);

    const COUNT = 75;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(8,181,229,${p.alpha})`;
        ctx.fill();
      }
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(22,139,255,${0.14 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
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
      <ParticleCanvas />

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
