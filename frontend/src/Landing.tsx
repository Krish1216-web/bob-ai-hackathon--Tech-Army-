import { useState } from 'react';
import {
  ArrowRight, CheckCircle2, FlaskConical,
  LayoutDashboard, Menu, Package, ShieldCheck, Ship, Sparkles, Thermometer, Truck, X,
} from 'lucide-react';

const stats = [
  { value: '99.2%', label: 'On-time delivery prediction accuracy' },
  { value: '87%', label: 'Average AI recommendation confidence' },
  { value: '28h', label: 'Average delay reduction per disruption' },
  { value: '$4.8M', label: 'Cargo value protected this month' },
];

const features = [
  { icon: LayoutDashboard, title: 'Control Tower', desc: 'Real-time visibility across your entire logistics network with live disruption detection and impact analysis.', color: '#08B5E5' },
  { icon: Package, title: 'Shipment Intelligence', desc: 'Prioritised view of shipment health, disruption exposure, and AI-recommended actions with risk scoring.', color: '#168BFF' },
  { icon: AlertTriangleIcon, title: 'Disruption Intelligence', desc: 'Active disruption events with route-level impact analysis and AI-powered remediation strategies.', color: '#FF8A00' },
  { icon: Truck, title: 'Fleet Optimizer', desc: 'Turn idle capacity into operational resilience with AI-detected redeployment opportunities.', color: '#16C784' },
  { icon: Thermometer, title: 'Cold Chain Monitoring', desc: 'Protect temperature-sensitive cargo with real-time telemetry, excursion alerts, and recovery actions.', color: '#F5C400' },
  { icon: FlaskConical, title: 'What-If Simulator', desc: 'Simulate disruptions and compare AI-powered response strategies before committing resources.', color: '#08B5E5' },
];

const pipeline = [
  { step: '01', title: 'Data Ingestion', desc: 'Live feeds from carriers, ports, IoT sensors, and weather systems.' },
  { step: '02', title: 'Disruption Detection', desc: 'AI continuously monitors for strikes, weather events, and capacity changes.' },
  { step: '03', title: 'Risk Scoring', desc: 'Every shipment is scored in real time based on exposure, value, and cargo sensitivity.' },
  { step: '04', title: 'AI Reasoning', desc: 'The engine generates explainable recommendations with confidence scores.' },
  { step: '05', title: 'Human Approval', desc: 'Operators review, accept, or reject each action with full transparency.' },
  { step: '06', title: 'Operational Impact', desc: 'Accepted actions are executed and measured against projected outcomes.' },
];

const testimonials = [
  { quote: 'ChainGuard AI reduced our average disruption response time from 6 hours to 18 minutes. The explainable recommendations gave our team the confidence to act fast.', name: 'Priya Sharma', role: 'Head of Global Logistics, Apex Pharma' },
  { quote: 'We protected $2.3M in temperature-sensitive cargo in the first quarter alone. The cold-chain excursion alerts are a game changer.', name: 'Marcus Chen', role: 'VP Supply Chain, Nordic Freight' },
  { quote: 'The What-If Simulator lets us stress-test our network before disruptions happen. We walk into every Monday briefing already prepared.', name: 'Elena Vasquez', role: 'Director of Operations, Meridian Logistics' },
];

function AlertTriangleIcon(props: { size?: number }) {
  return <Ship {...props} />;
}

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Interactive Live Screen Preview State
  const [previewTab, setPreviewTab] = useState<'tower' | 'cold' | 'simulator'>('tower');
  const [simHours, setSimHours] = useState<number>(72);
  const [activeDisruption, setActiveDisruption] = useState<'mumbai' | 'chennai'>('mumbai');
  const [diverted, setDiverted] = useState<boolean>(false);

  // Dynamic calculations based on adjustable slider
  const calcExposure = (hours: number) => ((hours / 72) * 1.25).toFixed(2);
  const calcAffected = (hours: number) => Math.round((hours / 72) * 8);

  return (
    <div className="landing">
      {/* Universal Navbar */}
      <nav className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <div className="landing-brand">
            <ShieldCheck size={26} />
            <span><b>CHAIN</b><b>GUARD</b><b>AI</b></span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Platform</a>
            <a href="#how">How It Works</a>
            <a href="#why">Why ChainGuard</a>
            <a href="#voices">Customers</a>
          </div>
          <div className="landing-nav-cta">
            <button className="lnav-login" onClick={onLaunch}>Sign in</button>
            <button className="lnav-launch" onClick={onLaunch}>Launch Platform <ArrowRight size={15} /></button>
          </div>
          <button className="lnav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMobileOpen(false)}>Platform</a>
            <a href="#how" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#why" onClick={() => setMobileOpen(false)}>Why ChainGuard</a>
            <a href="#voices" onClick={() => setMobileOpen(false)}>Customers</a>
            <button onClick={() => { setMobileOpen(false); onLaunch(); }}>Launch Platform <ArrowRight size={15} /></button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-glow" />
        <div className="landing-container hero-grid">
          <div className="hero-content">
            <div className="hero-badge"><Sparkles size={14} /> AI-Powered Supply Chain Control Tower</div>
            <h1>Explainable recommendations for <span>supply chain decisions</span></h1>
            <p>ChainGuard AI gives you real-time visibility, disruption intelligence, and AI-powered response across your entire logistics network — with every recommendation fully explainable and under human control.</p>
            <div className="hero-cta-row">
              <button className="hero-launch" onClick={onLaunch}>Launch Platform <ArrowRight size={18} /></button>
              <a href="#how" className="hero-secondary">See how it works</a>
            </div>
            <div className="hero-trust">
              <span><CheckCircle2 size={15} /> Real-time disruption intelligence</span>
              <span><CheckCircle2 size={15} /> AI-powered response recommendations</span>
              <span><CheckCircle2 size={15} /> Cold-chain risk monitoring</span>
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-window">
              <div className="preview-bar">
                <div className="preview-dots">
                  <span className="preview-dot red" /><span className="preview-dot yellow" /><span className="preview-dot green" />
                </div>
                <div className="preview-tabs-switcher">
                  <button className={`ptab-btn ${previewTab === 'tower' ? 'active' : ''}`} onClick={() => setPreviewTab('tower')}>
                    <LayoutDashboard size={12} /> Control Tower
                  </button>
                  <button className={`ptab-btn ${previewTab === 'cold' ? 'active' : ''}`} onClick={() => setPreviewTab('cold')}>
                    <Thermometer size={12} /> Cold Chain
                  </button>
                  <button className={`ptab-btn ${previewTab === 'simulator' ? 'active' : ''}`} onClick={() => setPreviewTab('simulator')}>
                    <FlaskConical size={12} /> What-If Sim
                  </button>
                </div>
                <em>chainguard.ai / live</em>
              </div>

              {/* Mode 1: Control Tower */}
              {previewTab === 'tower' && (
                <div className="preview-body">
                  <div className="preview-banner">
                    <span className="preview-pulse" />
                    <div><strong>NETWORK STATUS: AT RISK</strong><small>7 active disruptions affecting 23 shipments</small></div>
                  </div>
                  <div className="preview-kpis">
                    <div className="preview-kpi"><b className="red">7</b><span>Disruptions</span></div>
                    <div className="preview-kpi"><b className="orange">23</b><span>Affected</span></div>
                    <div className="preview-kpi"><b className="green">71.4%</b><span>Utilisation</span></div>
                    <div className="preview-kpi"><b className="cyan">$4.8M</b><span>Cargo at Risk</span></div>
                  </div>
                  <div className="preview-map">
                    <svg viewBox="0 0 400 160" className="preview-svg">
                      <rect width="400" height="160" fill="#0d1525" rx="8" />
                      <line x1="120" y1="110" x2="200" y2="50" stroke="#168BFF" strokeWidth="1.5" />
                      <line x1="200" y1="50" x2="320" y2="30" stroke="#168BFF" strokeWidth="1.5" />
                      <line x1="120" y1="110" x2="180" y2="140" stroke="#168BFF" strokeWidth="1.5" />
                      {activeDisruption === 'mumbai' ? (
                        <>
                          <line x1="120" y1="110" x2="80" y2="70" stroke="#FF414D" strokeWidth="2" strokeDasharray="5 3" />
                          <line x1="80" y1="70" x2="320" y2="30" stroke="#08B5E5" strokeWidth="1.5" strokeDasharray="4 3" />
                        </>
                      ) : (
                        <line x1="180" y1="140" x2="320" y2="30" stroke="#FF8A00" strokeWidth="2" strokeDasharray="5 3" />
                      )}
                      {[[120,110,'red'],[80,70,'cyan'],[200,50,'blue'],[320,30,'green'],[180,140,'orange']].map(([x,y,c],i) => (
                        <g key={i}>
                          <circle cx={x as number} cy={y as number} r="6" fill="none" stroke={`var(--${c})`} opacity=".4" />
                          <circle cx={x as number} cy={y as number} r="3" fill={`var(--${c})`} />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="preview-disruptions">
                    <div className={`preview-dis ${activeDisruption === 'mumbai' ? 'selected' : ''}`} onClick={() => setActiveDisruption('mumbai')} style={{ cursor: 'pointer' }}>
                      <span className="preview-badge critical">CRITICAL</span>
                      <strong>Mumbai Port Strike</strong>
                      <small>8 shipments · $1.25M</small>
                    </div>
                    <div className={`preview-dis ${activeDisruption === 'chennai' ? 'selected' : ''}`} onClick={() => setActiveDisruption('chennai')} style={{ cursor: 'pointer' }}>
                      <span className="preview-badge high">HIGH</span>
                      <strong>Chennai Cyclone Warning</strong>
                      <small>5 shipments · $870K</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Live Cold Chain */}
              {previewTab === 'cold' && (
                <div className="preview-body">
                  <div className="preview-banner" style={{ background: diverted ? 'linear-gradient(90deg,#153326,#0d241d)' : 'linear-gradient(90deg,#3b1a29,#261827)', borderColor: diverted ? '#16c784' : '#6f293b' }}>
                    <span className="preview-pulse" style={{ background: diverted ? '#16c784' : '#ff414d' }} />
                    <div>
                      <strong style={{ color: diverted ? '#16c784' : '#ff6570' }}>{diverted ? 'CONTAINER SECURED & STABILIZED' : 'TEMPERATURE EXCURSION DETECTED'}</strong>
                      <small>{diverted ? 'Diverted to Nhava Sheva Pharma Hub · Temp 4.1°C' : 'CTN-8801 (MMR Vaccines) at 10.3°C (+5.3°C above 8°C limit)'}</small>
                    </div>
                  </div>
                  <div className="preview-kpis">
                    <div className="preview-kpi"><b className={diverted ? 'green' : 'red'}>{diverted ? '4.1°C' : '10.3°C'}</b><span>Current Temp</span></div>
                    <div className="preview-kpi"><b className="cyan">2–8°C</b><span>SOP Safe Range</span></div>
                    <div className="preview-kpi"><b className={diverted ? 'green' : 'orange'}>{diverted ? '0.0%' : '87.4%'}</b><span>Spoilage Risk</span></div>
                    <div className="preview-kpi"><b className="green">4.2 km</b><span>Nearest Hub</span></div>
                  </div>
                  <div className="preview-hub-box" style={{ background: '#131e33', padding: '12px 14px', borderRadius: '8px', border: '1px solid #202c42' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#8fa3c1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Thermometer size={14} color="#08b5e5" /> Target: <b>HUB-BOM-01 (Nhava Sheva)</b>
                      </span>
                      <span style={{ fontSize: '10px', color: '#16c784', background: '#153326', padding: '2px 6px', borderRadius: '6px' }}>Certified WHO GDP</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setDiverted(!diverted)}
                        style={{ flex: 1, background: diverted ? '#16c784' : '#08b5e5', color: '#001824', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {diverted ? '✓ Reset Simulation' : '⚡ Execute Emergency Diversion'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 3: Adjustable What-If Simulator */}
              {previewTab === 'simulator' && (
                <div className="preview-body">
                  <div className="preview-banner" style={{ background: 'linear-gradient(90deg,#102d43,#122239)', borderColor: '#116586' }}>
                    <Sparkles size={16} color="#08b5e5" />
                    <div>
                      <strong style={{ color: '#08b5e5' }}>WHAT-IF MONTE CARLO SIMULATOR</strong>
                      <small>Adjust parameters below to see real-time cascade recalculation</small>
                    </div>
                  </div>
                  <div className="preview-slider-wrap" style={{ background: '#131e33', padding: '12px 14px', borderRadius: '8px', border: '1px solid #202c42' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#8fa3c1' }}>Adjust Disruption Duration:</span>
                      <b style={{ color: '#08b5e5', fontSize: '13px' }}>{simHours} Hours</b>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      step="12"
                      value={simHours}
                      onChange={(e) => setSimHours(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#08b5e5', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#627795', marginTop: '4px' }}>
                      <span>24h (Minor)</span>
                      <span>72h (Base)</span>
                      <span>120h (Severe)</span>
                    </div>
                  </div>
                  <div className="preview-kpis">
                    <div className="preview-kpi"><b className="orange">{calcAffected(simHours)}</b><span>Affected Cargo</span></div>
                    <div className="preview-kpi"><b className="cyan">${calcExposure(simHours)}M</b><span>Exposure</span></div>
                    <div className="preview-kpi"><b className="green">94%</b><span>AI Confidence</span></div>
                    <div className="preview-kpi"><b className="red">Mundra</b><span>Alt Port</span></div>
                  </div>
                  <div style={{ background: '#172136', padding: '10px 12px', borderRadius: '8px', border: '1px solid #202c42', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#8fa3c1' }}>Recommended Strategy:</span>
                    <strong style={{ fontSize: '11px', color: '#08b5e5' }}>Reroute via Mundra + Carrier B</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats-strip">
        <div className="landing-container stats-grid">
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">The Platform</span>
            <h2>One control tower for your entire supply chain</h2>
            <p>Six integrated modules work together to give you end-to-end visibility, from the first mile to the last.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ color: f.color, borderColor: `${f.color}33` }}><f.icon size={22} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <button className="feature-link" onClick={onLaunch}>Explore module <ArrowRight size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section dark-section" id="how">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">How It Works</span>
            <h2>From raw data to operational impact in minutes</h2>
            <p>Every recommendation is traceable, explainable, and under human approval. No black boxes.</p>
          </div>
          <div className="pipeline-grid">
            {pipeline.map((p, i) => (
              <div className="pipeline-step" key={p.step}>
                <div className="pipeline-number">{p.step}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                {i < pipeline.length - 1 && <div className="pipeline-connector"><ArrowRight size={16} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI explainability highlight */}
      <section className="landing-section" id="why">
        <div className="landing-container">
          <div className="explain-split">
            <div className="explain-text">
              <span className="section-eyebrow">Explainable AI</span>
              <h2>Never act on a black-box recommendation again</h2>
              <p>ChainGuard AI shows you exactly <em>why</em> each recommendation was made — the disruption signal, the cargo value at risk, the carrier capability match, and the alternative capacity available. Your team reviews the full reasoning before approving any action.</p>
              <ul className="explain-list">
                <li><CheckCircle2 size={18} /> Confidence scores on every recommendation</li>
                <li><CheckCircle2 size={18} /> Full reasoning chain with data sources cited</li>
                <li><CheckCircle2 size={18} /> Alternative actions presented for comparison</li>
                <li><CheckCircle2 size={18} /> Human approval required before execution</li>
                <li><CheckCircle2 size={18} /> Outcome tracking against projected impact</li>
              </ul>
              <button className="hero-launch small" onClick={onLaunch}>Explore the AI Command Center <ArrowRight size={16} /></button>
            </div>
            <div className="explain-card">
              <div className="explain-card-head">
                <span className="explain-kind critical">REROUTE</span>
                <span className="explain-badge">CRITICAL</span>
                <div className="explain-confidence"><small>Confidence</small><b>94%</b></div>
              </div>
              <h3>Reroute Shipment — SHP-1042</h3>
              <p className="explain-desc">SHP-1042 (Vaccines, $1.25M) is currently routed through Mumbai Port, which is under an active strike with 72h expected duration. Risk score has escalated to 92/100.</p>
              <div className="explain-rec">
                <strong><Sparkles size={14} /> Recommended Action</strong>
                <p>Reroute via Mundra Port and assign Carrier B with cold-chain capability.</p>
              </div>
              <div className="explain-bar"><i style={{ width: '94%' }} /></div>
              <div className="explain-reasons">
                <label>WHY THIS ACTION?</label>
                <div className="reason-row"><b>Mumbai Port Strike</b><span>72h estimated disruption</span></div>
                <div className="reason-row"><b>Cargo value</b><span>$1.25M exposure</span></div>
                <div className="reason-row"><b>Cold-chain requirement</b><span>Vaccines require 2–8°C</span></div>
                <div className="reason-row"><b>Alternative capacity</b><span>Mundra has available slots</span></div>
              </div>
              <div className="explain-actions">
                <span className="explain-accept">Accept</span>
                <span className="explain-reject">Reject</span>
                <span className="explain-details">Details</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section dark-section" id="voices">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">Customer Voices</span>
            <h2>Trusted by supply chain leaders worldwide</h2>
          </div>
          <div className="testimonial-card">
            <blockquote>"{testimonials[activeTestimonial].quote}"</blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}</div>
              <div><strong>{testimonials[activeTestimonial].name}</strong><span>{testimonials[activeTestimonial].role}</span></div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={i === activeTestimonial ? 'active' : ''} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-glow" />
        <div className="landing-container">
          <div className="cta-content">
            <ShieldCheck size={40} />
            <h2>Take control of your supply chain today</h2>
            <p>AI-powered resilience, fleet optimization, and cold-chain protection in a single control tower.</p>
            <button className="hero-launch large" onClick={onLaunch}>Launch Platform <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-inner">
            <div className="footer-brand">
              <ShieldCheck size={24} />
              <span><b>CHAIN</b><b>GUARD</b><b>AI</b></span>
              <p>Explainable recommendations for supply chain decisions.</p>
            </div>
            <div className="footer-cols">
              <div><h4>Platform</h4><button onClick={onLaunch}>Control Tower</button><button onClick={onLaunch}>Shipment Intelligence</button><button onClick={onLaunch}>Disruption Intelligence</button><button onClick={onLaunch}>Fleet Optimizer</button></div>
              <div><h4>Modules</h4><button onClick={onLaunch}>Cold Chain</button><button onClick={onLaunch}>AI Command Center</button><button onClick={onLaunch}>What-If Simulator</button><button onClick={onLaunch}>AI Copilot</button></div>
              <div><h4>Company</h4><a href="#features">About</a><a href="#voices">Customers</a><a href="#how">How It Works</a><a href="#why">Why ChainGuard</a></div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ChainGuard AI. All rights reserved.</span>
            <span>Explainable AI · Closed-Loop Operations · Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
