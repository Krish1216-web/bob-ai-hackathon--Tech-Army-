import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowRight, BarChart3, Bell, Check, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, CircleDollarSign, Clock3, Container, Download, ExternalLink, Filter,
  FlaskConical, Gauge, LayoutDashboard, MapPin, Package, Search, Send, Settings2, ShieldCheck,
  Ship, Sparkles, Thermometer, Truck, X, XCircle, Zap, Warehouse, ShieldAlert, Snowflake, Activity,
  Plus, RefreshCw, Sliders, FileText, Printer, CheckCheck, Award,
  type LucideIcon,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { actions as defaultActions, disruptions as defaultDisruptions, opportunities as defaultOpportunities, shipments as defaultShipments, type AIAction, type Severity, type Shipment } from './data';
import { api } from './api';
import { LiveColdMap, type ColdContainerMapItem, type ColdHubMapItem, type ColdRouteMapItem } from './LiveColdMap';
import { MapboxControlTower3D } from './MapboxControlTower3D';

const cyan = '#08B5E5';
const defaultTrendData = [{ t: '00:00', v: 68 }, { t: '02:00', v: 67.8 }, { t: '04:00', v: 66.5 }, { t: '06:00', v: 67 }, { t: '08:00', v: 69.2 }, { t: '10:00', v: 70.8 }, { t: '12:00', v: 72 }, { t: '14:00', v: 71.8 }, { t: '16:00', v: 73 }, { t: '18:00', v: 72.5 }, { t: '20:00', v: 71.2 }, { t: '22:00', v: 70.8 }];
const defaultAssetData = [{ name: 'Trucks', value: 76 }, { name: 'Containers', value: 73 }, { name: 'Vessels', value: 64 }];

const routePages: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Supply Chain Control Tower', subtitle: 'Real-time visibility, disruption intelligence and AI-powered response.' },
  '/shipments': { title: 'Shipment Intelligence', subtitle: 'Prioritised view of shipment health, disruption exposure and AI actions.' },
  '/disruptions': { title: 'Disruption Intelligence', subtitle: 'Active disruption events with impact analysis, affected shipments, and AI-powered remediation.' },
  '/fleet': { title: 'Fleet Utilisation Optimizer', subtitle: 'Turn idle capacity into operational resilience.' },
  '/cold-chain': { title: 'Cold Chain Intelligence', subtitle: 'Protect temperature-sensitive cargo with real-time exception monitoring.' },
  '/command-center': { title: 'AI Command Center', subtitle: 'Explainable recommendations for supply chain decisions.' },
  '/what-if': { title: 'What-If Simulator', subtitle: 'Simulate disruptions and compare AI-powered response strategies.' },
};

type Toast = { message: string; tone: 'success' | 'danger' };

function App() {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/landing');
  const [collapsed, setCollapsed] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);

  // Dynamic Live State Connected to FastAPI Backend
  const [accepted, setAccepted] = useState(4);
  const [actionList, setActionList] = useState<AIAction[]>(defaultActions);
  const [shipmentList, setShipmentList] = useState<Shipment[]>(defaultShipments);
  const [disruptionList, setDisruptionList] = useState<any[]>(defaultDisruptions);
  const [opportunityList, setOpportunityList] = useState<any[]>(defaultOpportunities);
  const [fleetUtilisationPct, setFleetUtilisationPct] = useState('71.4%');
  const [dashboardKpis, setDashboardKpis] = useState<any>(null);

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || '/landing');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Sync state from live backend API on mount & path changes
  useEffect(() => {
    async function fetchAllLiveData() {
      try {
        const [dbDashboard, dbShipments, dbDisruptions, dbRecs, dbFleet, dbIdle] = await Promise.all([
          api.getDashboard(),
          api.getShipments(),
          api.getDisruptions(),
          api.getRecommendations(),
          api.getFleetUtilisation(),
          api.getIdleOpportunities()
        ]);

        if (dbDashboard && dbDashboard.kpis) {
          setDashboardKpis(dbDashboard.kpis);
        }
        if (dbShipments && dbShipments.length > 0) {
          setShipmentList(dbShipments);
        }
        if (dbDisruptions && dbDisruptions.length > 0) {
          setDisruptionList(
            dbDisruptions.map((d: any) => ({
              name: d.title,
              level: d.severity,
              location: d.location,
              duration: `${d.duration_hours}h expected`,
              shipments: d.affected_shipments_count,
              exposure: d.exposure_amount,
              color: d.color
            }))
          );
        }
        if (dbRecs && dbRecs.length > 0) {
          setActionList(dbRecs);
        }
        if (dbFleet && dbFleet.overall_utilisation_pct) {
          setFleetUtilisationPct(`${dbFleet.overall_utilisation_pct}%`);
        }
        if (dbIdle && dbIdle.length > 0) {
          setOpportunityList(dbIdle);
        }
      } catch (err) {
        console.warn('Backend sync failed, maintaining resilient local cache:', err);
      }
    }
    fetchAllLiveData();
  }, [path]);

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, [toast]);

  const navigate = (to: string) => { window.location.hash = to; setSearch(''); };
  const page = routePages[path] || routePages['/'];
  const notify = (message: string, tone: Toast['tone'] = 'success') => setToast({ message, tone });

  // Handle recommendation action (Accept / Reject) with real backend execution
  const handleAction = async (id: string, didAccept: boolean) => {
    await api.executeAction(id, didAccept);
    setActionList((current) => current.filter((item) => item.id !== id));
    if (didAccept) {
      setAccepted((val) => val + 1);
      if (id === 'a1' || id === 'REC-a1') {
        setShipmentList((prev) =>
          prev.map((s) =>
            s.id === 'SHP-1042'
              ? { ...s, route: 'Mumbai → Mundra → Frankfurt', risk: 28, action: 'Monitor', disruption: 'Rerouted (Mundra)' }
              : s
          )
        );
      } else if (id === 'a3') {
        setOpportunityList((prev) => prev.filter((o) => o.asset !== 'TRK-204'));
        setFleetUtilisationPct('74.8%');
      }
    }

    notify(
      didAccept ? 'Action accepted and executed. Shipment & Fleet records updated.' : 'Action rejected and archived.',
      didAccept ? 'success' : 'danger'
    );
  };

  // Handle redeployment with real backend execution
  const handleRedeploy = async (assetId: string) => {
    await api.redeployAsset(assetId, 'SHP-1042');
    setOpportunityList((prev) => prev.filter((o) => o.asset !== assetId));
    if (assetId === 'TRK-204') {
      setFleetUtilisationPct('74.8%');
    }
    notify(`${assetId} redeployment executed. Utilisation increased to 54.2%.`);
  };

  if (path === '/landing') {
    return (
      <div className="landing-page-wrapper">
        <Landing onLaunch={() => navigate('/')} />
        {copilot && <Copilot onClose={() => setCopilot(false)} />}
        {toast && (
          <div className={`toast ${toast.tone}`}>
            <span>{toast.tone === 'success' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}</span>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} path={path} navigate={navigate} onToggle={() => setCollapsed((v) => !v)} />
      <main className={`main-area ${collapsed ? 'expanded' : ''}`}>
        <Header
          page={page}
          search={search}
          setSearch={setSearch}
          onCopilot={() => setCopilot(true)}
          notifications={notifications}
          setNotifications={setNotifications}
          profile={profile}
          setProfile={setProfile}
        />
        <div className="content-area">
          {search ? (
            <SearchResults query={search} navigate={navigate} shipments={shipmentList} />
          ) : (
            <>
              {path === '/' && (
                <ControlTower
                  navigate={navigate}
                  fleetUtilisation={fleetUtilisationPct}
                  pendingActions={actionList.length}
                  disruptions={disruptionList}
                  kpis={dashboardKpis}
                />
              )}
              {path === '/shipments' && (
                <ShipmentsPage navigate={navigate} notify={notify} shipments={shipmentList} />
              )}
              {path === '/disruptions' && (
                <DisruptionsPage navigate={navigate} disruptions={disruptionList} />
              )}
              {path === '/command-center' && (
                <CommandCenter
                  actionList={actionList}
                  accepted={accepted}
                  onAction={handleAction}
                  opportunities={opportunityList}
                  onRedeploy={handleRedeploy}
                  notify={notify}
                />
              )}
              {path === '/fleet' && (
                <FleetPage
                  opportunities={opportunityList}
                  onRedeploy={handleRedeploy}
                  notify={notify}
                  fleetUtilisation={fleetUtilisationPct}
                />
              )}
              {path === '/cold-chain' && <ColdChainPage notify={notify} />}
              {path === '/what-if' && <WhatIfPage notify={notify} />}
            </>
          )}
        </div>
      </main>
      {copilot && <Copilot onClose={() => setCopilot(false)} />}
      {toast && (
        <div className={`toast ${toast.tone}`}>
          <span>{toast.tone === 'success' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function Sidebar({ collapsed, path, navigate, onToggle }: { collapsed: boolean; path: string; navigate: (to: string) => void; onToggle: () => void }) {
  const items: { label: string; path: string; icon: LucideIcon; badge?: string }[] = [
    { label: 'Control Tower', path: '/', icon: LayoutDashboard },
    { label: 'Shipments', path: '/shipments', icon: Package, badge: '8' },
    { label: 'Disruptions', path: '/disruptions', icon: AlertTriangle, badge: '7' },
    { label: 'Fleet Optimizer', path: '/fleet', icon: Truck },
    { label: 'Cold Chain', path: '/cold-chain', icon: Thermometer, badge: '5' },
    { label: 'AI Command Center', path: '/command-center', icon: Sparkles },
    { label: 'What-If Simulator', path: '/what-if', icon: FlaskConical },
  ];
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><ShieldCheck size={28} /></div>
        <div className="brand-name"><b>CHAIN</b><b>GUARD</b><b>AI</b></div>
      </div>
      {!collapsed && <div className="nav-label">NAVIGATION</div>}
      <nav>
        {items.map(({ label, path: itemPath, icon: Icon, badge }) => (
          <button key={itemPath} className={`nav-item ${path === itemPath ? 'active' : ''}`} onClick={() => navigate(itemPath)} title={label}>
            <Icon size={18} />
            <span>{label}</span>
            {badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-status">
        <div><i className="dot green" />{!collapsed && 'All Systems Operational'}</div>
        <div><i className="dot cyan" />{!collapsed && 'AI Engine: watsonx.ai'}</div>
        <div><i className="dot muted" />{!collapsed && 'Live DB Synchronized'}</div>
        {!collapsed && <small>⌁ IBM Hackathon 2026</small>}
      </div>
      <button className="collapse-btn" onClick={onToggle}>{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button>
    </aside>
  );
}

function Header({ page, search, setSearch, onCopilot, notifications, setNotifications, profile, setProfile }: { page: { title: string; subtitle: string }; search: string; setSearch: (value: string) => void; onCopilot: () => void; notifications: boolean; setNotifications: (value: boolean) => void; profile: boolean; setProfile: (value: boolean) => void }) {
  return (
    <header className="topbar">
      <div className="page-heading">
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="header-actions">
        <label className="searchbox">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search shipments, assets, disruptions..." />
          <kbd>⌘K</kbd>
        </label>
        <div className="engine"><span className="dot green" /> AI Engine: IBM watsonx.ai <b>•</b></div>
        <div className="header-popover-wrap">
          <button className="icon-btn notification" onClick={() => setNotifications(!notifications)}>
            <Bell size={17} />
            <i>4</i>
          </button>
          {notifications && (
            <div className="popover notifications">
              <strong>Live Alerts</strong>
              <p><span className="dot red" />2 critical shipments need review</p>
              <p><span className="dot orange" />Mumbai Port Strike active (72h)</p>
              <p><span className="dot cyan" />AI has 4 recommendations ready</p>
            </div>
          )}
        </div>
        <button className="copilot-btn" onClick={onCopilot}><Sparkles size={15} /> AI Copilot</button>
        <div className="header-popover-wrap">
          <button className="profile-btn" onClick={() => setProfile(!profile)}>
            <span className="avatar">CG</span>
            <span>Operations Lead</span>
            <ChevronDown size={14} />
          </button>
          {profile && (
            <div className="popover profile-pop">
              <strong>Operations Control Tower</strong>
              <small>IBM Hackathon Edition</small>
              <button><Settings2 size={14} /> Preferences</button>
              <button><ExternalLink size={14} /> Status: Online</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PageIntro({ icon: Icon, title, subtitle, right }: { icon?: LucideIcon; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="page-intro">
      <div>
        <h2>{Icon && <Icon size={18} />}{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function KPI({ icon: Icon, value, label, note, tone = 'cyan' }: { icon?: LucideIcon; value: string; label: string; note?: string; tone?: string }) {
  return (
    <div className="kpi">
      <div className={`kpi-icon ${tone}`}>{Icon && <Icon size={16} />}</div>
      <div>
        <strong className={tone}>{value}</strong>
        <span>{label}</span>
        {note && <small className={tone}>{note}</small>}
      </div>
    </div>
  );
}

function SeverityBadge({ level }: { level: Severity }) {
  return <span className={`badge ${level.toLowerCase()}`}><i />{level}</span>;
}

function Panel({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`panel ${className}`} style={style}>{children}</section>;
}

function ControlTower({ navigate, fleetUtilisation, pendingActions, disruptions, kpis }: { navigate: (to: string) => void; fleetUtilisation: string; pendingActions: number; disruptions: any[]; kpis: any }) {
  return (
    <div className="page-stack">
      <div className="risk-banner">
        <div>
          <span className="pulse" />
          <div>
            <strong>NETWORK STATUS: AT RISK</strong>
            <p>Active disruptions are currently affecting shipments across the Western corridor.</p>
          </div>
        </div>
        <button className="outline-btn" onClick={() => navigate('/disruptions')}>
          View Critical Events <ArrowRight size={14} />
        </button>
      </div>

      <div className="kpi-grid six">
        <KPI icon={AlertTriangle} value={kpis?.active_disruptions?.value || "4"} label="Active Disruptions" note={kpis?.active_disruptions?.note || "Critical: 1"} tone="red" />
        <KPI icon={Package} value={kpis?.affected_shipments?.value || "23"} label="Affected Shipments" note={kpis?.affected_shipments?.note || "8 critical"} tone="orange" />
        <KPI icon={Gauge} value={fleetUtilisation} label="Fleet Utilisation" note="133 of 186 assets active" tone="green" />
        <KPI icon={Clock3} value={kpis?.idle_assets?.value || "12"} label="Idle Assets" note="4 redeployment opportunities" tone="orange" />
        <KPI icon={Thermometer} value={kpis?.cold_chain_alerts?.value || "5"} label="Cold Chain Alerts" note="2 critical excursions" tone="yellow" />
        <KPI icon={CircleDollarSign} value={kpis?.cargo_at_risk?.value || "$4.8M"} label="Cargo at Risk" note="Across critical shipments" tone="red" />
      </div>

      <div className="tower-grid">
        <Panel className="map-panel">
          <PageIntro title="Network Risk Map" subtitle="India · Asia · Europe logistics network" right={<span className="live-label"><i className="dot green" /> Live network</span>} />
          <RiskMap />
          <div className="map-legend">
            <span><i className="line red-line" />Disrupted (Mumbai)</span>
            <span><i className="line cyan-line" />Alternative (Mundra)</span>
            <span><i className="line blue-line" />Active</span>
            <span><i className="node yellow-node" />Warning</span>
          </div>
        </Panel>

        <Panel className="disruptions-panel">
          <PageIntro title="Live Disruptions" right={<span className="count-badge">4 Active</span>} />
          {disruptions.map((item) => (
            <button className="mini-disruption" key={item.name} onClick={() => navigate('/disruptions')}>
              <div className="mini-top">
                <strong>{item.name}</strong>
                <SeverityBadge level={item.level} />
              </div>
              <p>{item.duration}</p>
              <div className="mini-bottom">
                <span>{item.shipments} shipments</span>
                <b>{item.exposure}</b>
                {item.level !== 'MEDIUM' && <span className="ai-ready"><Sparkles size={11} />AI Ready</span>}
              </div>
            </button>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function RiskMap() {
  const nodes = [
    { name: 'Mumbai', x: 95, y: 160, tone: 'red' },
    { name: 'Mundra', x: 75, y: 113, tone: 'cyan' },
    { name: 'Ahmedabad', x: 123, y: 100, tone: 'yellow' },
    { name: 'Delhi', x: 190, y: 50, tone: 'blue' },
    { name: 'Dubai', x: 16, y: 82, tone: 'blue' },
    { name: 'Frankfurt', x: 218, y: 16, tone: 'green' },
    { name: 'Chennai', x: 147, y: 202, tone: 'orange' },
    { name: 'Singapore', x: 245, y: 218, tone: 'blue' },
  ];
  return (
    <div className="risk-map">
      <svg viewBox="0 0 280 240" role="img" aria-label="Network risk map">
        <defs>
          <radialGradient id="mapfade"><stop stopColor="#16233a" /><stop offset="1" stopColor="#101827" /></radialGradient>
        </defs>
        <rect width="280" height="240" fill="url(#mapfade)" rx="10" />
        <path className="route active-route" d="M95 160 L123 100 L190 50 L218 16" />
        <path className="route active-route" d="M95 160 L147 202 L245 218" />
        <path className="route alt-route" d="M75 113 L218 16" />
        <path className="route alt-route" d="M75 113 L245 218" />
        <path className="route warning-route" d="M123 100 L147 202" />
        <path className="route disrupted-route" d="M95 160 L75 113" />
        {nodes.map((node) => (
          <g key={node.name} className="map-node" transform={`translate(${node.x},${node.y})`}>
            <circle className={`node-ring ${node.tone}`} r="7" />
            <circle className={`node-core ${node.tone}`} r="3" />
            <text x="10" y="4">{node.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ShipmentsPage({ navigate, notify, shipments }: { navigate: (to: string) => void; notify: (message: string, tone?: Toast['tone']) => void; shipments: Shipment[] }) {
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = shipments.filter((shipment) => {
    const matchesQuery = Object.values(shipment).join(' ').toLowerCase().includes(query.toLowerCase());
    if (tab === 'Critical') return matchesQuery && shipment.risk >= 85;
    if (tab === 'At Risk') return matchesQuery && shipment.risk >= 65 && shipment.risk < 85;
    if (tab === 'On Track') return matchesQuery && shipment.risk < 50;
    if (tab === 'Delayed') return matchesQuery && shipment.disruption !== 'None';
    return matchesQuery;
  });

  const exportCsv = () => {
    const csv = ['Shipment,Route,Cargo,Value,ETA,Risk,Disruption,Carrier,Asset,AI Action', ...filtered.map((item) => Object.values(item).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'chainguard-shipments.csv';
    link.click();
    notify('Shipment data exported as CSV.');
  };

  return (
    <div className="page-stack">
      <div className="kpi-grid four">
        <KPI value={String(shipments.length)} label="Total Shipments" tone="cyan" />
        <KPI value={String(shipments.filter(s => s.risk >= 85).length)} label="Critical" tone="red" />
        <KPI value={String(shipments.filter(s => s.risk >= 65 && s.risk < 85).length)} label="At Risk" tone="orange" />
        <KPI value={String(shipments.filter(s => s.risk < 50).length)} label="On Track" tone="green" />
      </div>

      <Panel className="table-panel">
        <div className="table-toolbar">
          <div className="tabs">
            {['All', 'Critical', 'At Risk', 'Delayed', 'On Track'].map((name) => (
              <button key={name} className={tab === name ? 'selected' : ''} onClick={() => setTab(name)}>
                {name}
                <b>
                  {name === 'All' ? shipments.length :
                   name === 'Critical' ? shipments.filter(s => s.risk >= 85).length :
                   name === 'At Risk' ? shipments.filter(s => s.risk >= 65 && s.risk < 85).length :
                   name === 'Delayed' ? shipments.filter(s => s.disruption !== 'None').length :
                   shipments.filter(s => s.risk < 50).length}
                </b>
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <label className="searchbox compact">
              <Search size={14} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shipments..." />
            </label>
            <button className="small-btn"><Filter size={14} />Filter</button>
            <button className="small-btn" onClick={exportCsv}><Download size={14} />Export</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Value</th>
                <th>ETA</th>
                <th>Risk</th>
                <th>Disruption</th>
                <th>Carrier</th>
                <th>Asset</th>
                <th>AI Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shipment) => (
                <ShipmentRow key={shipment.id} shipment={shipment} onClick={() => navigate('/disruptions')} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No shipments match your filters.</div>}
        </div>
      </Panel>
    </div>
  );
}

function ShipmentRow({ shipment, onClick }: { shipment: Shipment; onClick: () => void }) {
  return (
    <tr onClick={onClick}>
      <td>
        <strong className="shipment-id">
          <i className={shipment.risk >= 80 ? 'risk-dot' : ''} />
          {shipment.id}
        </strong>
      </td>
      <td>{shipment.route}</td>
      <td>{shipment.cargo}</td>
      <td><strong>{shipment.value}</strong></td>
      <td>{shipment.eta}</td>
      <td>
        <strong className={`risk-score ${shipment.risk >= 80 ? 'critical' : shipment.risk >= 60 ? 'high' : shipment.risk >= 40 ? 'medium' : 'low'}`}>
          {shipment.risk}
        </strong>
      </td>
      <td>
        <span className={`disruption-tag ${shipment.risk >= 80 ? 'critical' : shipment.risk >= 60 ? 'high' : 'medium'}`}>
          {shipment.disruption}
        </span>
      </td>
      <td>{shipment.carrier}</td>
      <td>{shipment.asset}</td>
      <td>
        <span className={`action-tag ${shipment.action.toLowerCase()}`}>
          <Zap size={11} />
          {shipment.action}
        </span>
      </td>
    </tr>
  );
}

function DisruptionsPage({ navigate, disruptions }: { navigate: (to: string) => void; disruptions: any[] }) {
  const [filter, setFilter] = useState('All Events');
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string>('DIS-01');
  const [impactData, setImpactData] = useState<any>(null);

  const visible = disruptions.filter((item) => filter === 'All Events' || item.level === filter.toUpperCase());

  useEffect(() => {
    async function loadImpact() {
      const activeId = selectedDisruptionId || disruptions[0]?.id || 'DIS-01';
      const data = await api.getDisruptionImpact(activeId);
      if (data) {
        setImpactData(data);
      }
    }
    loadImpact();
  }, [selectedDisruptionId, disruptions]);

  const activeDisruption = impactData?.disruption || disruptions.find(d => d.id === selectedDisruptionId || d.name === selectedDisruptionId) || disruptions[0] || {
    title: 'Mumbai Port Strike',
    severity: 'CRITICAL',
    location: 'Mumbai, India — Jawaharlal Nehru Port',
    duration_hours: 72,
    affected_shipments_count: 8,
    exposure_amount: '$1.25M'
  };

  const durationHours = activeDisruption.duration_hours || 72;
  const exposureVal = impactData?.total_exposure || activeDisruption.exposure_amount || '$1.25M';
  const affectedCount = impactData?.affected_shipments?.length || activeDisruption.affected_shipments_count || 8;
  const criticalCount = impactData?.critical_count || 3;
  const delayReductionHours = impactData?.delay_reduction_possible_hours || 28;

  return (
    <div className="page-stack">
      <div className="kpi-grid four">
        <KPI icon={AlertTriangle} value={String(disruptions.length || 4)} label="Active Events" note={`${disruptions.filter(d => d.level === 'CRITICAL').length || 1} critical`} tone="red" />
        <KPI icon={Package} value={String(disruptions.reduce((acc, d) => acc + (d.shipments || 0), 0) || 23)} label="Affected Shipments" note="across all events" tone="orange" />
        <KPI icon={CircleDollarSign} value="$3.28M" label="Financial Exposure" note="operational risk" tone="yellow" />
        <KPI icon={Zap} value="3" label="AI Responses Ready" note={`of ${disruptions.length || 4} events`} tone="cyan" />
      </div>

      <div className="filter-row">
        <span><Filter size={14} />Filter:</span>
        {['All Events', 'Critical', 'High', 'Medium'].map((name) => (
          <button className={filter === name ? 'selected' : ''} key={name} onClick={() => setFilter(name)}>{name}</button>
        ))}
      </div>

      <Panel className="event-detail">
        <div className="event-header">
          <div className="event-title">
            <div className="event-icon"><Ship size={18} /></div>
            <div>
              <h3>{activeDisruption.title || activeDisruption.name} <SeverityBadge level={(activeDisruption.severity || activeDisruption.level || 'CRITICAL') as Severity} /> <span className="ai-ready"><Sparkles size={11} /> AI Ready</span></h3>
              <p><MapPin size={12} /> {activeDisruption.location} <span>·</span> {durationHours}h Expected Duration</p>
            </div>
          </div>
          <button className="small-btn">⌃ Active Analysis</button>
        </div>

        <div className="event-summary">
          <strong>{durationHours}h expected</strong>
          <span>{affectedCount} shipments affected</span>
          <b>{exposureVal} exposure</b>
          <span>{criticalCount} critical</span>
        </div>

        <div className="event-body">
          <div className="detail-stat-grid">
            <div><strong>{durationHours}h expected</strong><span>Expected Duration</span></div>
            <div><strong>{affectedCount} shipments</strong><span>Affected Shipments</span></div>
            <div><strong>{exposureVal}</strong><span>Financial Exposure</span></div>
            <div><strong>{delayReductionHours}h</strong><span>Delay Reduction Possible</span></div>
          </div>

          <div className="situation">
            <label>SITUATION &amp; CORRIDOR IMPACT</label>
            <p>{impactData?.situation || `Active disruption '${activeDisruption.title || activeDisruption.name}' at ${activeDisruption.location}. All operations suspended along the affected corridor.`}</p>
            <div className="route-pills">
              {impactData?.affected_shipments && impactData.affected_shipments.length > 0 ? (
                impactData.affected_shipments.map((s: any) => (
                  <span key={s.id}>{s.origin} → {s.destination} ({s.id})</span>
                ))
              ) : (
                <>
                  <span>Mumbai → Frankfurt (SHP-1042)</span>
                  <span>Mumbai → Dubai (SHP-1067)</span>
                  <span>Mumbai → Singapore (SHP-1082)</span>
                </>
              )}
            </div>
          </div>

          <div className="route-analysis">
            <div>
              <label><Send size={14} /> ROUTE ANALYSIS</label>
              <div className="route-box">
                <small>CURRENT ROUTE <b className="critical-text">BLOCKED</b></small>
                <strong>{activeDisruption.location?.split(',')[0] || 'Origin'} <ArrowRight size={14} /> <span>via Disrupted Corridor</span> <ArrowRight size={14} /> Destination</strong>
                <em>◷ {durationHours}h+ delay</em>
              </div>
              <div className="ai-divider">AI RECOMMENDED</div>
              <div className="route-box recommended">
                <small>RECOMMENDED ROUTE <b className="green-text">AVAILABLE</b></small>
                <strong>{impactData?.recommended_route || 'Mundra → Frankfurt'}</strong>
                <em>◷ {Math.max(12, durationHours - delayReductionHours)}h total transit (-{delayReductionHours}h)</em>
              </div>
            </div>

            <div className="recommendation">
              <div className="recommendation-head">
                <span><Sparkles size={15} /> AI RECOMMENDATION</span>
                <b>94% confidence</b>
              </div>
              <h3>Reroute via alternative corridor and assign cold-chain certified carrier</h3>
              <p>Carrier: <strong>{impactData?.recommended_carrier || 'Carrier B (Cold-Chain Certified)'}</strong></p>
              <label>AI Confidence</label>
              <div className="progress"><i style={{ width: '94%' }} /></div>
              <label>WHY THIS ACTION?</label>
              <ol>
                {impactData?.why_reasons && impactData.why_reasons.length > 0 ? (
                  impactData.why_reasons.map((r: any, idx: number) => (
                    <li key={idx}><b>{r.title}:</b><span>{r.detail}</span></li>
                  ))
                ) : (
                  <>
                    <li><b>Disruption Signal:</b><span>{durationHours}h estimated disruption blocking corridor.</span></li>
                    <li><b>Cargo Value:</b><span>{exposureVal} exposure across sensitive shipments.</span></li>
                    <li><b>Cold-Chain Requirement:</b><span>Carrier maintains certified 2–8°C telemetry.</span></li>
                    <li><b>Alternative Route:</b><span>Alternative corridor has open capacity.</span></li>
                  </>
                )}
              </ol>
            </div>
          </div>
        </div>
      </Panel>

      {visible.map((item) => (
        <button
          className={`event-list-row ${item.name === (activeDisruption.title || activeDisruption.name) ? 'selected-event' : ''}`}
          key={item.name}
          onClick={() => setSelectedDisruptionId(item.id || item.name)}
        >
          <div>
            <strong>{item.name}</strong>
            <p>{item.location}</p>
          </div>
          <SeverityBadge level={item.level} />
          <span>{item.shipments} shipments</span>
          <b>{item.exposure}</b>
          <ChevronRight size={16} />
        </button>
      ))}
    </div>
  );
}

function CommandCenter({
  actionList,
  accepted,
  onAction,
  opportunities,
  onRedeploy,
  notify
}: {
  actionList: AIAction[];
  accepted: number;
  onAction: (id: string, accept: boolean) => void;
  opportunities: any[];
  onRedeploy: (assetId: string) => void;
  notify: (message: string, tone?: Toast['tone']) => void;
}) {
  return (
    <div className="page-stack">
      <div className="kpi-grid four">
        <KPI icon={Clock3} value={String(actionList.length)} label="Pending Actions" tone="orange" />
        <KPI icon={Zap} value="2" label="Priority Alerts" tone="red" />
        <KPI icon={CheckCircle2} value={String(accepted)} label="Accepted Today" tone="green" />
        <KPI icon={BarChart3} value="91%" label="Avg Confidence" tone="cyan" />
      </div>

      <div className="section-heading">
        <div>
          <h2><Sparkles size={18} />Priority Actions <span className="count-badge">{actionList.length} pending</span></h2>
          <p>Requires operational decision</p>
        </div>
      </div>

      {actionList.length === 0 ? (
        <Panel className="empty-actions">
          <CheckCircle2 size={34} />
          <h3>All recommendations reviewed</h3>
          <p>Your pending action queue is clear. All actions executed in database.</p>
        </Panel>
      ) : (
        <div className="action-grid">
          {actionList.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onAction={onAction}
              onDetails={() => notify(`Opening operational data for ${action.title}.`)}
            />
          ))}
        </div>
      )}

      <Redeployments opportunities={opportunities} onRedeploy={onRedeploy} notify={notify} />
    </div>
  );
}

function ActionCard({ action, onAction, onDetails }: { action: AIAction; onAction: (id: string, accept: boolean) => void; onDetails: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Panel className={`action-card ${action.level.toLowerCase()}`}>
      <div className="action-meta">
        <span className={`action-kind ${action.level.toLowerCase()}`}>{action.kind}</span>
        <strong>{action.subject}</strong>
        <SeverityBadge level={action.level} />
        <div className="confidence">
          <small>Confidence</small>
          <b>{action.confidence}%</b>
        </div>
      </div>
      <h3>{action.title}</h3>
      <p className="action-description">{action.description}</p>
      <div className="recommended">
        <strong><Sparkles size={14} /> Recommended Action</strong>
        <p>{action.recommendation}</p>
      </div>
      <div className="confidence-bar">
        <i style={{ width: `${action.confidence}%` }} />
        <span>{action.confidence}% AI confidence</span>
      </div>
      <button className="reasoning-toggle" onClick={() => setExpanded(!expanded)}>
        <BarChart3 size={14} /> View AI Reasoning &amp; Data Sources <ChevronDown size={14} className={expanded ? 'rotate' : ''} />
      </button>
      {expanded && (
        <div className="reasoning">
          <p><b>Why this action?</b></p>
          <span>1. Active disruption signal and route exposure verified across West Coast.</span>
          <span>2. Cargo value and cold-chain sensitivity prioritized ($1.25M Vaccine).</span>
          <span>3. Alternative capacity is currently verified at Mundra Port.</span>
          <span>4. Carrier B capability matches required 2–8°C thermal telemetry.</span>
        </div>
      )}
      <div className="card-actions">
        <button className="accept-btn" onClick={() => onAction(action.id, true)}><Check size={14} />Accept</button>
        <button className="reject-btn" onClick={() => onAction(action.id, false)}><X size={14} />Reject</button>
        <button className="details-btn" onClick={onDetails}>Details</button>
      </div>
    </Panel>
  );
}

function Redeployments({ opportunities, onRedeploy, notify }: { opportunities: any[]; onRedeploy: (assetId: string) => void; notify: (message: string, tone?: Toast['tone']) => void }) {
  return (
    <div className="redeploy-section">
      <div className="section-heading">
        <div>
          <h2><Zap size={18} />AI-Detected Redeployment Opportunities <span className="count-badge">{opportunities.length} active</span></h2>
          <p>AI matches idle assets to disrupted shipments based on capacity, location proximity, and cold-chain compatibility.</p>
        </div>
      </div>
      {opportunities.length > 0 && (
        <div className="opportunity-grid">
          {opportunities.map((item) => (
            <Panel className="opportunity" key={item.asset}>
              <div className="opp-head">
                <div className="asset-icon"><Truck size={16} /></div>
                <div>
                  <h3>{item.asset} <span className="idle-badge">IDLE</span></h3>
                  <p><MapPin size={12} /> {item.location} · {item.idle}</p>
                </div>
                <b className="match-badge">◎ {item.match}% match</b>
              </div>
              <div className="util-line">
                <span>Utilisation</span>
                <b>{item.from || item.from_util} <i>→ {item.to || item.to_util}</i></b>
              </div>
              <div className="util-track"><i style={{ width: `${item.match}%` }} /></div>
              <small className="gain">↗ {item.gain} projected gain</small>
              <div className="match-card">
                <span>Matching Shipment</span>
                <b>{item.shipment}</b>
                <span>{item.route}</span>
                <b className="cyan-text">{item.cargo}</b>
                <span>Projected op. value</span>
                <b className="green-text">{item.value}</b>
              </div>
              <button className="reason-link"><Settings2 size={14} /> AI Reasoning <ChevronRight size={14} /></button>
              <button className="redeploy-btn" onClick={() => onRedeploy(item.asset)}>Redeploy {item.asset}</button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function FleetPage({ opportunities, onRedeploy, notify, fleetUtilisation }: { opportunities: any[]; onRedeploy: (assetId: string) => void; notify: (message: string, tone?: Toast['tone']) => void; fleetUtilisation: string }) {
  const [fleetStats, setFleetStats] = useState<any>(null);

  useEffect(() => {
    async function loadFleet() {
      const data = await api.getFleetUtilisation();
      if (data) {
        setFleetStats(data);
      }
    }
    loadFleet();
  }, [opportunities]);

  const trendData = fleetStats?.hourly_trend && fleetStats.hourly_trend.length > 0 ? fleetStats.hourly_trend : defaultTrendData;
  const assetData = fleetStats?.by_asset_type && fleetStats.by_asset_type.length > 0 ? fleetStats.by_asset_type : defaultAssetData;
  const totalAssets = fleetStats?.total_assets || 186;
  const activeAssets = fleetStats?.active_count || 133;
  const availableAssets = fleetStats?.available_count || 34;
  const idleAssets = fleetStats?.idle_count || opportunities.length || 19;
  const utilPct = fleetStats?.overall_utilisation_pct ? `${fleetStats.overall_utilisation_pct}%` : fleetUtilisation;

  return (
    <div className="page-stack">
      <div className="kpi-grid five">
        <KPI icon={Truck} value={String(totalAssets)} label="Total Assets" note="fleet-wide" tone="cyan" />
        <KPI icon={CheckCircle2} value={String(activeAssets)} label="Active" note={`${Math.round((activeAssets / totalAssets) * 100)}% of fleet`} tone="green" />
        <KPI icon={Container} value={String(availableAssets)} label="Available" note="ready to assign" tone="cyan" />
        <KPI icon={Clock3} value={String(idleAssets)} label="Idle" note={`${opportunities.length} opportunities`} tone="orange" />
        <KPI icon={BarChart3} value={utilPct} label="Utilisation" note="+6.8% vs yesterday" tone="green" />
      </div>

      <Panel className="chart-panel">
        <PageIntro title="Utilisation Trend" subtitle="Fleet-wide utilisation over the last 24 hours" right={<b className="green-text">↗ +6.8% vs yesterday</b>} />
        <div className="chart-wrap large">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="areaCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={cyan} stopOpacity={0.28} />
                  <stop offset="1" stopColor={cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#223047" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" stroke="#627795" tickLine={false} axisLine={false} />
              <YAxis domain={[50, 90]} stroke="#627795" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={{ background: '#172136', border: '1px solid #2a3c57', borderRadius: 8, color: '#fff' }} formatter={(value) => [`${value}%`, 'Utilisation']} />
              <Area type="monotone" dataKey="v" stroke={cyan} strokeWidth={2} fill="url(#areaCyan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-divider" />
        <h3 className="chart-subtitle">Utilisation by Asset Type</h3>
        <div className="chart-wrap bars">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assetData}>
              <CartesianGrid stroke="#223047" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#627795" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#627795" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {assetData.map((entry: any) => (
                  <Cell key={entry.name} fill={entry.name === 'Vessels' ? cyan : '#22C55E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Redeployments opportunities={opportunities} onRedeploy={onRedeploy} notify={notify} />
    </div>
  );
}

function ColdChainPage({ notify }: { notify?: (msg: string) => void }) {
  const [mapData, setMapData] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string>('CTN-8801');
  const [diversionMode, setDiversionMode] = useState<'SAFETY' | 'BALANCED' | 'ECO'>('BALANCED');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [isBulkImporting, setIsBulkImporting] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  // New Container Form State
  const [newContainer, setNewContainer] = useState({
    container_id: 'CTN-8850',
    shipment_id: 'SHP-1049',
    cargo_type: 'Biopharma / Vaccines',
    safe_min_temp: 2.0,
    safe_max_temp: 8.0,
    latitude: 19.07,
    longitude: 72.87,
    cargo_value: 950000,
    initial_temperature: 5.2
  });

  const loadAllColdChainData = async (mode: string = diversionMode) => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        api.getColdChainMap(mode),
        api.getColdChainSummary()
      ]);
      if (mRes) setMapData(mRes);
      if (sRes) setSummary(sRes);
    } catch (e) {
      console.warn('Failed to load cold chain map/summary data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedTelemetry = async (containerId: string = selectedId) => {
    try {
      const telData = await api.getContainerTelemetry(containerId);
      if (telData) {
        setTelemetry(telData);
      } else {
        const fallbackTel = await api.getShipmentColdChain('SHP-1042');
        if (fallbackTel) setTelemetry(fallbackTel);
      }
    } catch (e) {
      console.warn('Failed to load container telemetry:', e);
    }
  };

  useEffect(() => {
    loadAllColdChainData(diversionMode);
    loadSelectedTelemetry(selectedId);

    const timer = setInterval(() => {
      loadAllColdChainData(diversionMode);
    }, 8000);

    return () => clearInterval(timer);
  }, [diversionMode]);

  const containers: ColdContainerMapItem[] = mapData?.containers || [];
  const hubs: ColdHubMapItem[] = mapData?.hubs || [];
  const routes: ColdRouteMapItem[] = mapData?.routes || [];

  const selectedContainer = containers.find(c => c.id === selectedId) || containers[0] || {
    id: 'CTN-8801',
    container_id: 'CTN-8801',
    shipment_id: 'SHP-1042',
    cargo: 'mRNA Vaccines',
    product: 'mRNA Vaccines',
    asset: 'TRK-204',
    lat: 18.95,
    lng: 72.82,
    origin: 'Mumbai Port',
    destination: 'Delhi NCR Terminal',
    origin_coords: [18.95, 72.82] as [number, number],
    dest_coords: [28.61, 77.20] as [number, number],
    temp: '10.3°C',
    temp_val: 10.3,
    peak_temp: '11.2°C',
    peak_temp_val: 11.2,
    safe_min_temp: 2.0,
    safe_max_temp: 8.0,
    required_range: '2°C - 8°C',
    sop_range: '2°C - 8°C',
    excursion_duration_mins: 45,
    status: 'CRITICAL' as const,
    severity: 'CRITICAL' as const,
    risk_probability: 0.94,
    is_anomaly: true,
    anomaly_layer: 'L2_RATE_OF_CHANGE',
    nearest_hub: {
      id: 'HUB-MUMBAI-01',
      name: 'Navi Mumbai Central Cold Logistics Hub',
      location: 'Navi Mumbai (JNPT Area)',
      lat: 18.98,
      lng: 73.02,
      distance_km: 14.2,
      eta_minutes: 25,
      available_tons: 180.0,
      status: 'OPERATIONAL'
    },
    recommended_action: 'DIVERT_HUB',
    action_description: 'Divert immediately to Navi Mumbai Central Cold Logistics Hub. Active compressor thermal breach.',
    cargo_value: '$1.25M'
  };

  const handleSelectContainer = (cid: string) => {
    setSelectedId(cid);
    loadSelectedTelemetry(cid);
  };

  const handleModeChange = (mode: 'SAFETY' | 'BALANCED' | 'ECO') => {
    setDiversionMode(mode);
    loadAllColdChainData(mode);
    if (notify) notify(`Switched Economic Diversion Mode to ${mode}`);
  };

  const handleOpenAuditModal = async (cid: string = selectedId) => {
    setLoadingAudit(true);
    setShowAuditModal(true);
    try {
      const data = await api.getAuditReport(cid);
      if (data) {
        setAuditData(data);
      }
    } catch (e) {
      console.warn('Failed to load audit report:', e);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const handleDownloadAuditJson = () => {
    if (!auditData) return;
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${auditData.certificate_id || 'audit-certificate'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (notify) notify(`Downloaded audit certificate JSON for ${auditData.consignment?.container_id || selectedId}`);
  };

  const handleExecuteAction = async (cid: string, actionType: string) => {
    setActionInProgress(true);
    try {
      const res = await api.executeColdChainAction(cid, actionType);
      await Promise.all([
        loadAllColdChainData(diversionMode),
        loadSelectedTelemetry(cid)
      ]);
      if (notify) {
        notify(res?.message || `Action ${actionType} executed for container ${cid}.`);
      }
    } catch (e) {
      console.warn('Action execution error:', e);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSimulateExcursion = async (targetTemp: number, durationMins: number, desc?: string) => {
    setIsSimulating(true);
    try {
      const res = await api.simulateExcursion({
        container_id: selectedContainer.id,
        target_temp: targetTemp,
        duration_mins: durationMins,
        description: desc
      });
      await Promise.all([
        loadAllColdChainData(diversionMode),
        loadSelectedTelemetry(selectedContainer.id)
      ]);
      if (notify) {
        notify(res?.message || `Simulated excursion: ${targetTemp}°C on ${selectedContainer.id}`);
      }
    } catch (e) {
      console.warn('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateNewContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createContainer(newContainer);
      if (res && res.container) {
        setSelectedId(res.container.container_id);
      }
      setShowAddModal(false);
      await loadAllColdChainData(diversionMode);
      if (notify) notify(`Successfully onboarded new Reefer Container ${newContainer.container_id}`);
    } catch (e) {
      console.warn('Failed to create container:', e);
    }
  };

  const handleBulkImport = async () => {
    setIsBulkImporting(true);
    try {
      const res = await api.bulkImportContainers(5);
      await loadAllColdChainData(diversionMode);
      if (notify) notify(res?.message || 'Successfully onboarded 5 live test containers to fleet.');
    } catch (e) {
      console.warn('Bulk import failed:', e);
    } finally {
      setIsBulkImporting(false);
    }
  };

  const tempData = telemetry?.readings?.map((r: any) => ({ t: r.t, v: r.v })) || [
    { t: '06:00', v: 5.8 }, { t: '08:00', v: 6.1 }, { t: '10:00', v: 6.5 },
    { t: '12:00', v: 8.2 }, { t: '14:00', v: selectedContainer.temp_val || 10.3 }, { t: '16:00', v: 7.1 }, { t: '18:00', v: 6.4 }
  ];

  const isCritical = selectedContainer.status === 'CRITICAL';
  const isWarning = selectedContainer.status === 'MEDIUM';
  const kpis = mapData?.kpis || {};

  return (
    <div className="page-stack">
      {/* 1. TOP TOOLBAR & CONTROLS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 18px',
        background: '#111827',
        border: '1px solid #202c42',
        borderRadius: 11
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Snowflake size={20} style={{ color: '#08b5e5' }} />
          <div>
            <h2 style={{ fontSize: 15, margin: 0, fontWeight: 700, color: '#f1f5f9' }}>
              LiveCold — Cold Chain Intelligence &amp; Multi-Mode Diversion
            </h2>
            <p style={{ fontSize: 11, color: '#7185a3', margin: 0 }}>
              4-Layer Sensor Anomaly Engine · Sigmoid Spoilage Modeling · Haversine Hub Routing
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Multi-Mode Economic Diversion Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#8fa3c1', fontWeight: 600 }}>Mode:</span>
            <div className="mode-toggle-group">
              <button
                className={`mode-toggle-btn safety ${diversionMode === 'SAFETY' ? 'active' : ''}`}
                onClick={() => handleModeChange('SAFETY')}
                title="SAFETY: 0.30 Risk Threshold (Zero Biopharma Spoilage)"
              >
                <ShieldAlert size={12} /> SAFETY
              </button>
              <button
                className={`mode-toggle-btn ${diversionMode === 'BALANCED' ? 'active' : ''}`}
                onClick={() => handleModeChange('BALANCED')}
                title="BALANCED: 0.50 Risk Threshold + Net Positive Savings"
              >
                <Sliders size={12} /> BALANCED
              </button>
              <button
                className={`mode-toggle-btn eco ${diversionMode === 'ECO' ? 'active' : ''}`}
                onClick={() => handleModeChange('ECO')}
                title="ECO: 0.65 Risk Threshold + >$2,000 Net Savings"
              >
                <Activity size={12} /> ECO
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            className="small-btn"
            style={{ background: '#1c283d', borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 700 }}
            onClick={() => handleOpenAuditModal()}
            title="Generate FDA 21 CFR Part 11 & WHO GDP Regulatory Compliance Audit Certificate"
          >
            <FileText size={13} /> Audit PDF (WHO/FDA)
          </button>
          <button
            className="small-btn"
            style={{ background: '#102d46', borderColor: '#075879', color: '#08b5e5', fontWeight: 600 }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={13} /> Add Container
          </button>
          <button
            className="small-btn"
            disabled={isBulkImporting}
            style={{ background: '#172136', borderColor: '#243550', color: '#d9e5f5' }}
            onClick={handleBulkImport}
          >
            <Download size={13} /> {isBulkImporting ? 'Importing...' : 'Bulk Import (5 Reefers)'}
          </button>
        </div>
      </div>

      {/* 2. TOP COMMAND CENTER KPIS */}
      <div className="kpi-grid five">
        <KPI
          icon={Thermometer}
          value={kpis.compliance_pct ? `${kpis.compliance_pct}%` : summary?.compliance_pct ? `${summary.compliance_pct}%` : "98.2%"}
          label="Temperature Compliance"
          note="network-wide 24h"
          tone={kpis.critical_count > 0 ? "yellow" : "green"}
        />
        <KPI
          icon={Container}
          value={String(kpis.active_containers || containers.length || 3)}
          label="Monitored Reefers"
          note="live IoT telemetry"
          tone="cyan"
        />
        <KPI
          icon={AlertTriangle}
          value={String(kpis.active_excursions ?? (isCritical ? 1 : 0))}
          label="Active Excursions"
          note={`${kpis.critical_count || (isCritical ? 1 : 0)} critical alert`}
          tone={kpis.critical_count > 0 ? "red" : "green"}
        />
        <KPI
          icon={CircleDollarSign}
          value={kpis.value_at_risk || (isCritical ? "$1.25M" : "$0")}
          label="Value At Risk"
          note={kpis.total_value_monitored ? `of ${kpis.total_value_monitored} total` : "active shipments"}
          tone={kpis.critical_count > 0 ? "red" : "green"}
        />
        <KPI
          icon={Activity}
          value={kpis.avg_temperature || selectedContainer.temp || "6.2°C"}
          label="Network Avg Temp"
          note="SOP standard 2–8°C"
          tone="cyan"
        />
      </div>

      {/* 3. MAIN LIVE COLD CHAIN NETWORK MAP */}
      <Panel className="map-panel" style={{ padding: 18 }}>
        <PageIntro
          title="Live Cold Chain Network Map &amp; Corridor Tracking"
          subtitle={`Real-time IoT reefer telemetry, cold storage hub availability, and emergency diversion corridors (${diversionMode} Mode active)`}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="live-label"><i className="dot green" /> Live GPS &amp; Sensor Sync</span>
            </div>
          }
        />
        <LiveColdMap
          containers={containers.length > 0 ? containers : [selectedContainer]}
          hubs={hubs}
          routes={routes}
          selectedContainerId={selectedId}
          onSelectContainer={handleSelectContainer}
          onRefresh={() => loadAllColdChainData(diversionMode)}
          loading={loading}
        />
      </Panel>

      {/* 4. SELECTED REEFER DIAGNOSTICS & TELEMETRY */}
      <div className="cold-grid">
        {/* Left: Telemetry Chart & Anomaly Layers */}
        <Panel className="chart-panel">
          <PageIntro
            title={`Temperature Telemetry — ${selectedContainer.id} (${selectedContainer.cargo})`}
            subtitle={`Shipment: ${selectedContainer.shipment_id} · Assigned Asset: ${selectedContainer.asset} · Route: ${selectedContainer.origin} → ${selectedContainer.destination}`}
            right={<span className="range-label"><i />SOP Range {selectedContainer.sop_range}</span>}
          />
          <div className="chart-wrap cold-chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid stroke="#223047" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke="#627795" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 14]} stroke="#627795" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}°C`} />
                <Tooltip contentStyle={{ background: '#172136', border: '1px solid #2a3c57', borderRadius: 8, color: '#fff' }} formatter={(val) => [`${val}°C`, 'Temperature']} />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={isCritical ? "#EF4444" : isWarning ? "#F5C400" : "#22C55E"}
                  strokeWidth={3}
                  dot={{ fill: isCritical ? "#EF4444" : isWarning ? "#F5C400" : "#22C55E", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 4-Layer Sensor Anomaly Filter Status */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #202c42'
          }}>
            <div style={{ background: '#172136', padding: '8px 10px', borderRadius: 6 }}>
              <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>L1 PHYSICAL BOUNDS</small>
              <b style={{ color: selectedContainer.temp_val > 50 || selectedContainer.temp_val < -30 ? '#EF4444' : '#10B981', fontSize: 11 }}>
                {selectedContainer.temp_val > 50 || selectedContainer.temp_val < -30 ? 'BREACHED' : 'VALID [-50..70°C]'}
              </b>
            </div>
            <div style={{ background: '#172136', padding: '8px 10px', borderRadius: 6 }}>
              <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>L2 RATE OF CHANGE</small>
              <b style={{ color: isCritical ? '#EF4444' : '#10B981', fontSize: 11 }}>
                {isCritical ? 'SPIKE > 2.5°C/15m' : 'STABLE < 1.0°C/15m'}
              </b>
            </div>
            <div style={{ background: '#172136', padding: '8px 10px', borderRadius: 6 }}>
              <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>L3 Z-SCORE FILTER</small>
              <b style={{ color: isCritical ? '#F59E0B' : '#10B981', fontSize: 11 }}>
                {isCritical ? '2.9σ DEVIATION' : '0.4σ BASELINE'}
              </b>
            </div>
            <div style={{ background: '#172136', padding: '8px 10px', borderRadius: 6 }}>
              <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>L4 STUCK SENSOR</small>
              <b style={{ color: '#10B981', fontSize: 11 }}>ACTIVE STREAM</b>
            </div>
          </div>
        </Panel>

        {/* Right: AI Recovery & Nearest Cold Hub Actions */}
        <Panel className="excursions">
          <PageIntro
            title="Cold-Chain AI Decision &amp; Diversion"
            right={
              <span className="count-badge" style={{
                background: isCritical ? '#3b1b2b' : '#153326',
                color: isCritical ? '#ff414d' : '#16c784',
                borderColor: isCritical ? '#ff414d' : '#16c784'
              }}>
                {isCritical ? "CRITICAL EXCURSION" : isWarning ? "WARNING" : "NORMAL MONITORING"}
              </span>
            }
          />

          {isCritical ? (
            <div className="alert-item critical">
              <AlertTriangle size={18} />
              <div>
                <strong>{selectedContainer.id} · {selectedContainer.temp} (Peak {selectedContainer.peak_temp})</strong>
                <p>Above configured {selectedContainer.sop_range} range for {selectedContainer.excursion_duration_mins} minutes</p>
                <small>{selectedContainer.origin} → {selectedContainer.destination} · Value {selectedContainer.cargo_value}</small>
              </div>
            </div>
          ) : (
            <div className="alert-item" style={{ borderLeft: '3px solid #22C55E' }}>
              <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
              <div>
                <strong>{selectedContainer.id} · {selectedContainer.temp} (Integrity Verified)</strong>
                <p>Thermal stability within safe {selectedContainer.sop_range} SOP limits</p>
                <small>{selectedContainer.origin} → {selectedContainer.destination} · Normal Transit</small>
              </div>
            </div>
          )}

          {/* Spoilage Risk Probability Indicator */}
          <div style={{
            background: '#172136',
            border: '1px solid #243550',
            borderRadius: 8,
            padding: 10,
            marginTop: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: '#8fa3c1' }}>Sigmoid Spoilage Risk ({diversionMode}):</span>
              <b style={{ color: isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' }}>
                {Math.round(selectedContainer.risk_probability * 100)}% Probability
              </b>
            </div>
            <div style={{ height: 6, background: '#202c42', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.round(selectedContainer.risk_probability * 100)}%`,
                height: '100%',
                background: isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                borderRadius: 3
              }} />
            </div>
          </div>

          {/* AI Recommended Action Card */}
          <div className="ai-note" style={{ marginTop: 10 }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <div>
              <b>AI Prescriptive Remediation ({diversionMode} Matrix)</b>
              <p>{selectedContainer.action_description || selectedContainer.recommended_action}</p>
            </div>
          </div>

          {/* Nearest Qualified Cold Hub */}
          {selectedContainer.nearest_hub && (
            <div style={{
              background: '#0e1829',
              border: '1px solid #202c42',
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
              fontSize: 11
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontWeight: 600, marginBottom: 4 }}>
                <Warehouse size={14} />
                <span>Nearest Qualified Facility: {selectedContainer.nearest_hub.name}</span>
              </div>
              <div style={{ color: '#8fa3c1', display: 'flex', justifyContent: 'space-between' }}>
                <span>Distance: <b style={{ color: '#f1f5f9' }}>{selectedContainer.nearest_hub.distance_km} km</b></span>
                <span>ETA: <b style={{ color: '#f1f5f9' }}>{selectedContainer.nearest_hub.eta_minutes} min</b></span>
                <span>Available: <b style={{ color: '#10B981' }}>{selectedContainer.nearest_hub.available_tons} Tons</b></span>
              </div>
            </div>
          )}

          {/* Corrective Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <button
              className="small-btn"
              disabled={actionInProgress}
              style={{ justifyContent: 'center', background: '#08b5e5', color: '#001824', fontWeight: 700 }}
              onClick={() => handleExecuteAction(selectedContainer.id, 'RECOVER_REEFER')}
            >
              <Zap size={13} /> {actionInProgress ? 'Executing...' : 'Reefer Reset'}
            </button>
            <button
              className="small-btn"
              disabled={actionInProgress}
              style={{ justifyContent: 'center', background: '#1d3557', color: '#38bdf8', borderColor: '#38bdf8' }}
              onClick={() => handleExecuteAction(selectedContainer.id, 'DIVERT_HUB')}
            >
              <Snowflake size={13} /> Divert To Hub
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <button
              className="small-btn"
              disabled={actionInProgress}
              style={{ justifyContent: 'center', borderColor: '#202c42' }}
              onClick={() => handleExecuteAction(selectedContainer.id, 'THERMAL_BLANKET')}
            >
              <ShieldCheck size={13} /> Blanket Insulation
            </button>
            <button
              className="small-btn"
              style={{ justifyContent: 'center', background: '#17253b', borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 600 }}
              onClick={() => handleOpenAuditModal(selectedContainer.id)}
            >
              <Award size={13} /> Audit Certificate
            </button>
          </div>

          {/* Quick Interactive Excursion Simulator Controls */}
          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #202c42',
            fontSize: 11
          }}>
            <span style={{ color: '#7185a3', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              🧪 Live Excursion Injection Simulator ({selectedContainer.id}):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              <button
                className="small-btn"
                disabled={isSimulating}
                style={{ padding: '5px 6px', fontSize: 10, justifyContent: 'center', background: '#3b1b2b', color: '#ff414d', borderColor: '#6f293b' }}
                onClick={() => handleSimulateExcursion(10.3, 45, 'Simulated reefer compressor breakdown')}
              >
                🚨 Excursion 10.3°C
              </button>
              <button
                className="small-btn"
                disabled={isSimulating}
                style={{ padding: '5px 6px', fontSize: 10, justifyContent: 'center', background: '#382619', color: '#ff8a00', borderColor: '#99530d' }}
                onClick={() => handleSimulateExcursion(11.8, 60, 'Escalated secondary thermal breach')}
              >
                🔥 Escalate 11.8°C
              </button>
              <button
                className="small-btn"
                disabled={isSimulating}
                style={{ padding: '5px 6px', fontSize: 10, justifyContent: 'center', background: '#153326', color: '#16c784', borderColor: '#208d62' }}
                onClick={() => handleSimulateExcursion(4.8, 0, 'Reefer power restored - normal temperature')}
              >
                ✅ Restore 4.8°C
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {/* 5. COLD CHAIN ASSET TABLE */}
      <Panel className="table-panel">
        <PageIntro
          title="Monitored Cold-Chain Fleet Telemetry"
          subtitle="Real-time multi-sensor status and thermal compliance verification across all operational containers"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CONTAINER</th>
                <th>SHIPMENT</th>
                <th>PRODUCT / CARGO</th>
                <th>LIVE TEMP</th>
                <th>SOP BOUNDS</th>
                <th>PEAK TEMP</th>
                <th>STATUS</th>
                <th>ROUTE</th>
                <th>RISK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(containers.length > 0 ? containers : [selectedContainer]).map((item) => {
                const isItemSel = item.id === selectedId;
                const isCrit = item.status === 'CRITICAL';
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectContainer(item.id)}
                    style={{
                      background: isItemSel ? 'rgba(8, 181, 229, 0.08)' : undefined,
                      borderLeft: isItemSel ? '3px solid #08b5e5' : undefined
                    }}
                  >
                    <td>
                      <b style={{ color: '#f1f5f9' }}>{item.id}</b>
                    </td>
                    <td><span style={{ color: '#38bdf8' }}>{item.shipment_id}</span></td>
                    <td>{item.cargo}</td>
                    <td>
                      <b className={isCrit ? 'critical-text' : item.status === 'NORMAL' ? 'green-text' : 'yellow-text'}>
                        {item.temp}
                      </b>
                    </td>
                    <td><span style={{ color: '#7185a3' }}>{item.sop_range || item.required_range}</span></td>
                    <td>{item.peak_temp}</td>
                    <td><SeverityBadge level={item.status} /></td>
                    <td>{item.origin} → {item.destination}</td>
                    <td>
                      <b style={{ color: isCrit ? '#EF4444' : '#10B981' }}>
                        {Math.round((item.risk_probability || 0.05) * 100)}%
                      </b>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="small-btn"
                          style={{ padding: '4px 8px', fontSize: 10 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectContainer(item.id);
                          }}
                        >
                          {isItemSel ? 'Selected' : 'Focus'}
                        </button>
                        <button
                          className="small-btn"
                          style={{ padding: '4px 8px', fontSize: 10, borderColor: '#38bdf8', color: '#38bdf8' }}
                          title="Generate Regulatory Audit PDF"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAuditModal(item.id);
                          }}
                        >
                          <FileText size={11} /> Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 6. CERTIFIED COLD STORAGE HUBS REGISTRY */}
      <Panel className="table-panel">
        <PageIntro
          title="Certified Cold Storage Hubs Registry"
          subtitle="Pre-qualified cold-storage facilities with temperature zone validation and Haversine routing integration"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FACILITY NAME</th>
                <th>LOCATION</th>
                <th>COORDINATES</th>
                <th>TEMP ZONES</th>
                <th>CAPACITY (TONS)</th>
                <th>AVAILABLE</th>
                <th>OCCUPANCY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {hubs.map((hub) => (
                <tr key={hub.id}>
                  <td><b style={{ color: '#60a5fa' }}>{hub.name}</b></td>
                  <td>{hub.location}</td>
                  <td><span style={{ color: '#7185a3' }}>{hub.lat.toFixed(2)}°N, {hub.lng.toFixed(2)}°E</span></td>
                  <td><span style={{ color: '#38bdf8' }}>{(hub.temp_zones || []).join(', ')}</span></td>
                  <td>{hub.capacity_tons} T</td>
                  <td><b style={{ color: '#10b981' }}>{hub.available_tons} T</b></td>
                  <td>{hub.occupied_pct}%</td>
                  <td>
                    <span style={{
                      color: hub.status === 'OPERATIONAL' ? '#10B981' : '#EF4444',
                      background: hub.status === 'OPERATIONAL' ? '#153326' : '#3b1b2b',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 9,
                      fontWeight: 700
                    }}>
                      {hub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 7. ADD CONTAINER MODAL DIALOG */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Plus size={16} style={{ color: '#08b5e5' }} />
                Onboard New Cold-Chain Reefer Container
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', color: '#7185a3', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateNewContainer}>
              <div className="modal-body">
                <div className="form-row-2">
                  <div className="input-field">
                    <label>Container ID *</label>
                    <input
                      type="text"
                      required
                      value={newContainer.container_id}
                      onChange={(e) => setNewContainer({ ...newContainer, container_id: e.target.value })}
                      placeholder="e.g. CTN-8850"
                    />
                  </div>
                  <div className="input-field">
                    <label>Linked Shipment ID</label>
                    <input
                      type="text"
                      value={newContainer.shipment_id}
                      onChange={(e) => setNewContainer({ ...newContainer, shipment_id: e.target.value })}
                      placeholder="e.g. SHP-1049"
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label>Cargo Type / Product *</label>
                  <select
                    value={newContainer.cargo_type}
                    onChange={(e) => setNewContainer({ ...newContainer, cargo_type: e.target.value })}
                  >
                    <option value="Biopharma / Vaccines">Biopharma / Vaccines (2°C - 8°C)</option>
                    <option value="Specialty Biologics">Specialty Biologics (2°C - 8°C)</option>
                    <option value="Frozen Plasma">Frozen Plasma (-25°C - -15°C)</option>
                    <option value="Fresh Produce">Fresh Produce (4°C - 10°C)</option>
                    <option value="Dairy & Confectionery">Dairy &amp; Confectionery (2°C - 6°C)</option>
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="input-field">
                    <label>Safe Min Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newContainer.safe_min_temp}
                      onChange={(e) => setNewContainer({ ...newContainer, safe_min_temp: parseFloat(e.target.value) || 2.0 })}
                    />
                  </div>
                  <div className="input-field">
                    <label>Safe Max Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newContainer.safe_max_temp}
                      onChange={(e) => setNewContainer({ ...newContainer, safe_max_temp: parseFloat(e.target.value) || 8.0 })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="input-field">
                    <label>Initial Telemetry Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newContainer.initial_temperature}
                      onChange={(e) => setNewContainer({ ...newContainer, initial_temperature: parseFloat(e.target.value) || 5.0 })}
                    />
                  </div>
                  <div className="input-field">
                    <label>Cargo Valuation ($ USD)</label>
                    <input
                      type="number"
                      value={newContainer.cargo_value}
                      onChange={(e) => setNewContainer({ ...newContainer, cargo_value: parseFloat(e.target.value) || 500000 })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="input-field">
                    <label>GPS Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newContainer.latitude}
                      onChange={(e) => setNewContainer({ ...newContainer, latitude: parseFloat(e.target.value) || 19.0 })}
                    />
                  </div>
                  <div className="input-field">
                    <label>GPS Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newContainer.longitude}
                      onChange={(e) => setNewContainer({ ...newContainer, longitude: parseFloat(e.target.value) || 72.8 })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="small-btn"
                  style={{ background: '#08b5e5', color: '#001824', fontWeight: 700 }}
                >
                  <Plus size={13} /> Onboard Container
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FDA / WHO REGULATORY COMPLIANCE AUDIT CERTIFICATE MODAL */}
      {showAuditModal && (
        <div className="modal-backdrop" onClick={() => setShowAuditModal(false)}>
          <div className="audit-modal-card printable-audit-report" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#0d1424' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} style={{ color: '#08b5e5' }} />
                <h3 style={{ margin: 0, fontSize: 14, color: '#f1f5f9' }}>
                  WHO GDP &amp; US FDA 21 CFR Part 11 Regulatory Compliance Audit Certificate
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="small-btn"
                  style={{ background: '#08b5e5', color: '#001824', fontWeight: 700 }}
                  onClick={handlePrintAudit}
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  className="small-btn"
                  style={{ background: '#172136', color: '#8fa3c1' }}
                  onClick={handleDownloadAuditJson}
                >
                  <Download size={13} /> JSON
                </button>
                <button
                  onClick={() => setShowAuditModal(false)}
                  style={{ background: 'transparent', color: '#7185a3', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: 20, maxHeight: '78vh', overflowY: 'auto' }}>
              {loadingAudit ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#08b5e5' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                  <p>Generating cryptographically signed regulatory audit ledger...</p>
                </div>
              ) : auditData ? (
                <div className="audit-certificate">
                  {/* Certificate Header Banner */}
                  <div className="audit-header-banner">
                    <div className="audit-title">
                      <h2>CHAIN GUARD AI — GLOBAL PHARMA COLD-CHAIN AUDIT CERTIFICATE</h2>
                      <p>Standards: WHO Technical Report Series No. 961 Annex 9 · US FDA 21 CFR Part 11</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="stamp-badge">
                        <CheckCheck size={12} /> CERTIFIED AUDIT TRAIL
                      </div>
                      <small style={{ display: 'block', color: '#7185a3', fontSize: 9, marginTop: 4 }}>
                        Issued: {new Date(auditData.generated_at).toLocaleString()}
                      </small>
                    </div>
                  </div>

                  {/* Consignment & Key Metadata */}
                  <div className="audit-meta-grid">
                    <div>
                      <span>Certificate Identifier</span>
                      <strong>{auditData.certificate_id}</strong>
                    </div>
                    <div>
                      <span>Container / Shipment</span>
                      <strong>{auditData.consignment?.container_id} · {auditData.consignment?.shipment_id}</strong>
                    </div>
                    <div>
                      <span>Product Cargo Type</span>
                      <strong style={{ color: '#38bdf8' }}>{auditData.consignment?.product_type}</strong>
                    </div>
                    <div>
                      <span>SOP Temperature Specification</span>
                      <strong>{auditData.consignment?.sop_temperature_range}</strong>
                    </div>
                    <div>
                      <span>Declared Consignment Value</span>
                      <strong style={{ color: '#10b981' }}>${(auditData.consignment?.declared_cargo_value_usd || 1250000).toLocaleString()} USD</strong>
                    </div>
                    <div>
                      <span>Carrier &amp; Corridors</span>
                      <strong>{auditData.consignment?.origin} → {auditData.consignment?.destination}</strong>
                    </div>
                  </div>

                  {/* Thermal Excursion Telemetry & 4-Layer Anomaly Verification */}
                  <div className="audit-section-box">
                    <h4>🌡️ Thermal Excursion Telemetry &amp; Anomaly Engine Log</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>PEAK EXCURSION</small>
                        <b style={{ color: '#ef4444', fontSize: 13 }}>{auditData.thermal_excursion_telemetry?.peak_temperature_c}°C</b>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>TOTAL DURATION</small>
                        <b style={{ color: '#f59e0b', fontSize: 13 }}>{auditData.thermal_excursion_telemetry?.excursion_duration_minutes} Mins</b>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>DEGREE-HOURS BREACH</small>
                        <b style={{ color: '#38bdf8', fontSize: 13 }}>{auditData.thermal_excursion_telemetry?.degree_hours_thermal_breach}°C·h</b>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9, display: 'block' }}>CHAIN STATUS</small>
                        <b style={{ color: auditData.thermal_excursion_telemetry?.status === 'NORMAL' ? '#10b981' : '#ef4444', fontSize: 13 }}>
                          {auditData.thermal_excursion_telemetry?.status}
                        </b>
                      </div>
                    </div>

                    {/* Sensor Table */}
                    <table className="audit-telemetry-table">
                      <thead>
                        <tr>
                          <th>TIMESTAMP (UTC)</th>
                          <th>RECORDED TEMP</th>
                          <th>SOP TOLERANCE</th>
                          <th>TELEMETRY STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(auditData.thermal_excursion_telemetry?.sensor_readings || []).map((sr: any, idx: number) => (
                          <tr key={idx}>
                            <td>{sr.time}</td>
                            <td><b>{sr.temp_c}°C</b></td>
                            <td>2.0°C - 8.0°C</td>
                            <td>
                              <span style={{
                                color: sr.status === 'IN_SPEC' ? '#10b981' : '#ef4444',
                                fontWeight: 700
                              }}>
                                {sr.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* 4-Layer Anomaly Breakdown */}
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 10 }}>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <b style={{ color: '#38bdf8' }}>Layer 1 &amp; 2 (Physics &amp; Spike):</b>
                        <p style={{ margin: '2px 0 0', color: '#94a3b8' }}>
                          {auditData.thermal_excursion_telemetry?.anomaly_engine_verification?.layer1_physical_bounds} · {auditData.thermal_excursion_telemetry?.anomaly_engine_verification?.layer2_rate_of_change}
                        </p>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <b style={{ color: '#38bdf8' }}>Layer 3 &amp; 4 (Z-Score &amp; Stream):</b>
                        <p style={{ margin: '2px 0 0', color: '#94a3b8' }}>
                          {auditData.thermal_excursion_telemetry?.anomaly_engine_verification?.layer3_zscore_baseline} · {auditData.thermal_excursion_telemetry?.anomaly_engine_verification?.layer4_stuck_sensor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corrective Action & Economic CAPA */}
                  <div className="audit-section-box">
                    <h4>🛡️ Corrective &amp; Preventative Action (CAPA) Resolution</h4>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: '#cbd5e1' }}>
                      {auditData.spoilage_and_corrective_action?.auditor_summary}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9 }}>PRE-INTERVENTION SPOILAGE</small>
                        <b style={{ color: '#ef4444', display: 'block', fontSize: 12 }}>
                          {auditData.spoilage_and_corrective_action?.pre_intervention_spoilage_probability}
                        </b>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9 }}>POST-INTERVENTION RISK</small>
                        <b style={{ color: '#10b981', display: 'block', fontSize: 12 }}>
                          {auditData.spoilage_and_corrective_action?.post_intervention_spoilage_probability}
                        </b>
                      </div>
                      <div style={{ background: '#0e1726', padding: 8, borderRadius: 6 }}>
                        <small style={{ color: '#7185a3', fontSize: 9 }}>CARGO VALUE SALVAGED</small>
                        <b style={{ color: '#38bdf8', display: 'block', fontSize: 12 }}>
                          ${(auditData.spoilage_and_corrective_action?.estimated_salvage_value_usd || 950000).toLocaleString()} USD
                        </b>
                      </div>
                    </div>
                  </div>

                  {/* Electronic Signatures & Cryptographic Audit Hash */}
                  <div className="audit-signatures">
                    <div className="signature-block">
                      <span style={{ color: '#7185a3', fontSize: 9, textTransform: 'uppercase', display: 'block' }}>
                        Autonomous AI System Verification
                      </span>
                      <strong style={{ color: '#f1f5f9', display: 'block', margin: '4px 0 2px' }}>
                        {auditData.electronic_signatures?.automated_ai_system}
                      </strong>
                      <small style={{ color: '#10b981', display: 'block', fontSize: 9 }}>
                        Digital SHA-256 Hash: {auditData.verification_hash_sha256?.substring(0, 24)}...
                      </small>
                    </div>

                    <div className="signature-block">
                      <span style={{ color: '#7185a3', fontSize: 9, textTransform: 'uppercase', display: 'block' }}>
                        Qualified Person (QP) / Lead QA Approver
                      </span>
                      <strong style={{ color: '#f1f5f9', display: 'block', margin: '4px 0 2px' }}>
                        {auditData.electronic_signatures?.lead_qualified_person_qp}
                      </strong>
                      <small style={{ color: '#38bdf8', display: 'block', fontSize: 9 }}>
                        Signature ID: CFR21-QP-AUTH-{(auditData.certificate_id || '2026').slice(-8)}
                      </small>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer" style={{ background: '#0d1424' }}>
              <button
                type="button"
                className="small-btn"
                onClick={() => setShowAuditModal(false)}
              >
                Close Certificate
              </button>
              <button
                type="button"
                className="small-btn"
                style={{ background: '#08b5e5', color: '#001824', fontWeight: 700 }}
                onClick={handlePrintAudit}
              >
                <Printer size={13} /> Print Official PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WhatIfPage({ notify }: { notify: (message: string, tone?: Toast['tone']) => void }) {
  const [duration, setDuration] = useState(72);
  const [severity, setSeverity] = useState('Critical');
  const [disruptionType, setDisruptionType] = useState('Mumbai Port Strike');
  const [explanation, setExplanation] = useState(
    'Shipment SHP-1042 is prioritized because it is a critical cold-chain vaccine consignment overlapping the Mumbai Port strike corridor. Rerouting via Mundra Port with Carrier B avoids 28 hours of delay and protects $1.25M in cargo.'
  );

  const reduction = Math.max(14, Math.round(duration * (severity === 'Critical' ? 0.3888 : severity === 'High' ? 0.39 : 0.46)));
  const [simData, setSimData] = useState([
    { name: 'Current', delay: duration, reduction: '—', exposure: '$1.25M', prob: '41%' },
    { name: 'AI Recommended', delay: duration - reduction, reduction: `${reduction}h`, exposure: '$450K', prob: '94%' },
    { name: 'Alternative', delay: duration - Math.round(reduction * 0.72), reduction: `${duration - (duration - Math.round(reduction * 0.72))}h`, exposure: '$760K', prob: '81%' }
  ]);

  const handleRunSimulation = async () => {
    const res = await api.runSimulation({
      disruption_type: disruptionType,
      duration_hours: duration,
      severity
    });

    if (res && res.comparison_data) {
      setSimData(
        res.comparison_data.map((c: any) => ({
          name: c.name,
          delay: c.delay,
          reduction: c.delay_reduction,
          exposure: c.financial_exposure,
          prob: c.success_probability
        }))
      );
      if (res.watsonx_explanation) {
        setExplanation(res.watsonx_explanation);
      }
    } else {
      const red = Math.max(14, Math.round(duration * (severity === 'Critical' ? 0.3888 : 0.4)));
      setSimData([
        { name: 'Current', delay: duration, reduction: '—', exposure: '$1.25M', prob: '41%' },
        { name: 'AI Recommended', delay: duration - red, reduction: `${red}h`, exposure: '$450K', prob: '94%' },
        { name: 'Alternative', delay: duration - Math.round(red * 0.72), reduction: `${duration - (duration - Math.round(red * 0.72))}h`, exposure: '$760K', prob: '81%' }
      ]);
    }
    notify(`Simulation recalculated for ${duration}h ${severity} disruption.`);
  };

  return (
    <div className="page-stack">
      <Panel className="sim-controls">
        <PageIntro title="Scenario Configuration" subtitle="Adjust the inputs to model network impact and compare response strategies." />
        <div className="form-grid">
          <label>
            Disruption event
            <select value={disruptionType} onChange={(e) => setDisruptionType(e.target.value)}>
              <option>Mumbai Port Strike</option>
              <option>Chennai Cyclone Warning</option>
              <option>Carrier Capacity Reduction</option>
            </select>
          </label>
          <label>
            Duration <b>{duration} hours</b>
            <input type="range" min="12" max="120" step="12" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </label>
          <label>
            Affected route
            <select><option>Mumbai → Frankfurt</option><option>Chennai → Singapore</option><option>Delhi → Frankfurt</option></select>
          </label>
          <label>
            Cargo type
            <select><option>Vaccines</option><option>Pharmaceuticals</option><option>Electronics</option></select>
          </label>
          <label>
            Severity
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </select>
          </label>
          <button className="run-btn" onClick={handleRunSimulation}>
            <Zap size={16} /> Run Simulation
          </button>
        </div>
      </Panel>

      <div className="scenario-grid">
        {simData.map((item, index) => (
          <Panel className={`scenario ${index === 1 ? 'recommended-scenario' : ''}`} key={item.name}>
            <div className="scenario-label">{item.name === 'AI Recommended' && <Sparkles size={13} />}{item.name.toUpperCase()}</div>
            <strong>{item.delay}h</strong>
            <span>Expected delay</span>
            <div className="scenario-stats">
              <p><small>Delay reduction</small><b>{item.reduction}</b></p>
              <p><small>Financial exposure</small><b>{item.exposure}</b></p>
              <p><small>Success probability</small><b>{item.prob}</b></p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="chart-panel">
        <PageIntro title="Strategy Comparison" subtitle="Projected delay reduction by response strategy" />
        <div className="chart-wrap comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simData}>
              <CartesianGrid stroke="#223047" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#627795" tickLine={false} axisLine={false} />
              <YAxis stroke="#627795" tickLine={false} axisLine={false} />
              <Bar dataKey="delay" radius={[5, 5, 0, 0]}>
                {simData.map((_, index) => (
                  <Cell key={index} fill={index === 1 ? '#08B5E5' : '#34445f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="route-sim">
        <PageIntro title="Projected Route &amp; AI Decision Analysis" subtitle="Mumbai → Mundra → Frankfurt Leg" />
        <div className="sim-route">
          <span className="route-stop active"><i />Mumbai (Blocked JNPT)</span>
          <div />
          <span className="route-stop recommended"><i />Mundra Port <small>AI Reroute + TRK-204</small></span>
          <div />
          <span className="route-stop"><i />Frankfurt (On-Time Delivery)</span>
        </div>
        <div style={{ marginTop: 16, padding: 14, background: '#131b2e', borderRadius: 8, border: '1px solid #233451' }}>
          <p style={{ fontSize: 13, color: '#c7d5e8', lineHeight: 1.6 }}>
            <Sparkles size={14} style={{ color: '#08B5E5', display: 'inline', marginRight: 6 }} />
            <strong>AI Operational Justification: </strong>
            {explanation}
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Copilot({ onClose }: { onClose: () => void }) {
  const [inputVal, setInputVal] = useState('');
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'Which shipments are at highest risk?',
    'What is the impact of Mumbai Port Strike?',
    'Which idle assets can be redeployed?',
    'What should we do about CTN-8801?'
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    const res = await api.queryCopilot(queryText);
    setLoading(false);
    if (res && res.answer) {
      setAnswer(res.answer);
      setConfidence(Math.round(res.confidence * 100));
      setSources(res.sources || []);
    } else {
      setAnswer(
        'SHP-1042 (Vaccines, $1.25M) is at 92/100 risk due to the Mumbai Port Strike. I recommend rerouting via Mundra Port with Carrier B and redeploying TRK-204.'
      );
      setConfidence(94);
      setSources(['Shipment Risk Engine', 'Fleet Database']);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="copilot-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h2><Sparkles size={18} />AI Copilot</h2>
            <span><i className="dot green" /> AI Decision Engine Online</span>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="copilot-body">
          <div className="copilot-welcome">
            <Sparkles size={19} />
            <p>I can help you understand network risk, identify affected shipments, optimize fleet redeployments, and explain recommendations.</p>
          </div>

          {loading && (
            <div className="ai-response" style={{ opacity: 0.7 }}>
              <strong>AI Analysis in progress...</strong>
            </div>
          )}

          {answer && !loading && (
            <div className="ai-response">
              <strong>AI Analysis {confidence && <span style={{ color: '#08B5E5', float: 'right' }}>{confidence}% confidence</span>}</strong>
              <p>{answer}</p>
              {sources.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#7a8fa8' }}>
                  Sources: {sources.join(' • ')}
                </div>
              )}
            </div>
          )}

          <label className="suggestion-label">SUGGESTED QUESTIONS</label>
          {suggestions.map((question) => (
            <button className="suggestion" key={question} onClick={() => { setInputVal(question); handleAsk(question); }}>
              {question}
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
        <div className="copilot-input">
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk(inputVal)}
            placeholder="Ask about shipments, disruptions, fleet..."
          />
          <button onClick={() => handleAsk(inputVal)}><Send size={15} /></button>
        </div>
      </aside>
    </div>
  );
}

function SearchResults({ query, navigate, shipments }: { query: string; navigate: (to: string) => void; shipments: Shipment[] }) {
  const results = useMemo(
    () => shipments.filter((item) => Object.values(item).join(' ').toLowerCase().includes(query.toLowerCase())),
    [query, shipments]
  );
  return (
    <div className="search-results">
      <PageIntro title={`Search results for “${query}”`} subtitle={`${results.length} shipments found across the network`} />
      {results.map((item) => (
        <button key={item.id} onClick={() => navigate('/shipments')}>
          <Package size={16} />
          <div>
            <strong>{item.id}</strong>
            <span>{item.route} · {item.cargo}</span>
          </div>
          <b className={`risk-score ${item.risk >= 80 ? 'critical' : 'medium'}`}>{item.risk}</b>
          <ChevronRight size={15} />
        </button>
      ))}
      {results.length === 0 && <Panel className="empty-state">No matching shipments found. Try a shipment ID, route, or cargo type.</Panel>}
    </div>
  );
}

export default App;
