# 🚀 ChainGuard AI — AI-Powered Supply Chain Disruption Assistant & Fleet Utilisation Optimizer

> **IBM BoB AI Innovation Hackathon 2026** | **Track:** AI | **Team:** Tech Army



---

## 👥 Team: Tech Army

| Field | Value |
|---|---|
| **Team Name** | **Tech Army** |
| **Track** | **AI** |
| **Team Lead** | Krish Sankhavara — krishsankhavara1216@gmail.com |
| **Members** | Bhavik Rabadiya,Raj Bhut,Hit Barvaliya |

---

## 🎯 Problem Statement

Modern enterprise supply networks lose billions annually to unmitigated port strikes, severe weather corridors, and critical cold-chain failures (e.g. life-saving biopharma excursions). Dispatchers struggle with siloed legacy tools, leading to:
1. **Severe cascading delays** without proactive route or carrier alternatives.
2. **Idle fleet capacity** (assets lingering at <20% utilisation while high-priority corridors starve).
3. **Catastrophic cold-chain spoilage** where thermal breaches go unnoticed until delivery.
4. **Lack of actionable simulation tools** to quantify disruption mitigation before committing capital.

---

## 💡 Solution

**ChainGuard AI** is a unified, full-stack enterprise control tower and AI decision platform combining macroeconomic disruption intelligence, IoT cold-chain physics, and automated fleet optimization into a single cockpit backed authoritatively by **Supabase PostgreSQL**.

```text
                                  CHAINguard AI
                                        │
                                        ▼
                               React 18 + Vite UI
                          (Dark Enterprise Cockpit)
                                        │
                                        ▼
                                 FastAPI REST API
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
Disruption & Network             LiveCold Engine                Fleet Optimizer
  Risk Engine                 (4-Layer Anomaly /             (Idle Asset Match &
 (Corridor Impacts,            Sigmoid Spoilage /              Redeployment)
  Reroute Decisions)          Haversine Cold Hubs)                     │
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                             Supabase PostgreSQL
                            (Authoritative Single
                               Source of Truth)
```

---

## ✨ Key Features

- **🌐 Multi-Corridor Disruption Intelligence**: Detects events (e.g., *Mumbai Port Strike*, *Chennai Cyclone*), computes affected shipments, projected delays ($+48\text{h}$), and aggregates financial exposure.
- **❄️ LiveCold 4-Layer IoT Anomaly Detection**:
  - `L1_BOUNDS`: Physical SOP envelope breach ($>8.0^\circ\text{C}$).
  - `L2_RATE_OF_CHANGE`: Rapid thermal climb ($>+1.5^\circ\text{C}/\text{hr}$).
  - `L3_ZSCORE`: Statistical outlier deviation ($z > 3.0\sigma$).
  - `L4_PERSISTENCE`: Stuck-sensor and duration persistence checks.
- **📈 Sigmoid Dynamic Spoilage & Haversine Hub Diversion**: Computes continuous real-time cargo spoilage probability and automatically calculates the nearest certified cold storage facility (e.g., *Navi Mumbai Cold Hub*, $14.2\,\text{km}$) for 1-click emergency rerouting.
- **🚛 Fleet Utilisation Optimizer**: Identifies underutilized and idle assets (`TRK-204` at $18.5\%$ utilisation) and calculates high-confidence cargo redeployment matches ($91\%$ match with `SHP-1051`), boosting utilisation to $54.2\%$.
- **🔄 Closed-Loop Prescriptive AI Actions**: Dispatcher actions (accept reroute, redeploy fleet, divert to cold hub) execute atomic mutations against Supabase PostgreSQL and persist across browser sessions.
- **🔮 What-If Disruption Simulator**: Parametric Monte Carlo scenario simulator evaluating delay reduction ($-36\text{h}$) and risk avoidance before operational execution.
- **💬 AI Command Center Copilot**: Live contextual assistant powered by IBM Granite / watsonx.ai prompt architectures with deterministic fallback.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, TypeScript 5.5+, SQL |
| **Backend Framework** | FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn |
| **Frontend Framework** | React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet Maps, Recharts |
| **IBM Technologies** | watsonx.ai fallback engine, IBM Granite prompt schemas, IBM Bob |
| **Databases** | Supabase PostgreSQL (10 relational tables, RLS, Foreign Keys, B-Tree Indexes) |
| **Testing & CI/CD** | Pytest (20/20 tests passing), GitHub Actions (`validate.yml`) |

---

## 📁 Repository Structure

```text
bob-ai-hackathon--Tech-Army/
│
├── submission.yaml               # Authoritative hackathon metadata (YAML)
├── README.md                     # Comprehensive project documentation
├── CONTRIBUTING.md               # Hackathon guidelines & contributing info
├── .gitignore                    # Secure gitignore (no .env, no .db)
│
├── .github/
│   ├── workflows/validate.yml    # Automated submission completeness validator
│   └── ISSUE_TEMPLATE/config.yml
│
├── docs/                         # Detailed Technical Documentation
│   ├── problem-statement.md      # In-depth problem analysis & impact
│   ├── solution-overview.md      # Solution design & domain architectures
│   ├── architecture.md           # System diagrams, component flow, data schemas
│   ├── setup-guide.md            # Step-by-step local & production setup guide
│   └── template-guide.md         # Hackathon submission rubric guide
│
├── demo/                         # Demo Artifacts & Media
│   ├── demo-video-link.txt       # Video walkthrough link
│   ├── live-demo-url.txt         # Live deployed application URL
│   └── screenshots/              # High-resolution screenshots of all 11 core views
│       └── README.md
│
├── presentation/                 # Presentation deck & pitch material
│   └── README.md
│
└── src/                          # Full Application Source Code
    ├── .env.example              # Environment variables template
    ├── README.md                 # Source directory overview
    ├── backend/                  # FastAPI Application & Database Repositories
    │   ├── app/
    │   │   ├── main.py           # FastAPI entrypoint & CORS middleware
    │   │   ├── core/config.py    # Environment settings & DB URL parser
    │   │   ├── db/               # SQLAlchemy engine & Supabase repositories
    │   │   ├── models/           # Declarative ORM models (10 tables)
    │   │   ├── routers/          # 18 REST API endpoint routers
    │   │   ├── services/         # Cold Chain, Disruption, Fleet, Sim services
    │   │   └── seed/             # Idempotent database seeder
    │   ├── tests/                # 20 automated Pytest test cases
    │   ├── supabase_schema.sql   # Complete PostgreSQL schema DDL
    │   ├── requirements.txt      # Python dependencies
    │   └── pytest.ini
    └── frontend/                 # React 18 + Vite + Tailwind Cockpit
        ├── src/
        │   ├── App.tsx           # Router & active view state management
        │   ├── components/       # UI cards, Leaflet map, charts, modals
        │   ├── services/api.ts   # Axios API client connected to backend
        │   └── index.css         # Enterprise Tailwind styling & 1280px containers
        ├── package.json          # Node dependencies
        ├── vite.config.ts        # Vite configuration
        └── tailwind.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd src/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Start the Frontend Cockpit
```bash
cd src/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Run Backend Verification Tests
```bash
cd src/backend
pytest -v
```
*(All 20 tests pass cleanly in under 5 seconds)*

---

## 🎬 5-Step Hackathon Judge Demo Flow

1. **Step 1 — Landing Page (`/`)**: Review the enterprise-grade dark cockpit, switch between *Control Tower*, *Cold Chain Intelligence*, and *What-If Sim* live previews, adjust the What-If slider ($24\text{h} \rightarrow 120\text{h}$), and click **Launch Platform**.
2. **Step 2 — Disruption Intelligence (`/disruptions`)**: View the active **Mumbai Port Strike** ($48\text{h}$ delay) affecting shipment `SHP-1042` carrying $\$1.25\text{M}$ mRNA Vaccines.
3. **Step 3 — AI Recommendations (`/recommendations`)**: Review prescriptive action `a1` recommending a reroute to **Mundra Port Corridor** with Carrier B ($94\%$ confidence, $28\text{h}$ saved). Click **Accept & Execute** to mutate Supabase PostgreSQL.
4. **Step 4 — LiveCold Anomaly Engine (`/cold-chain`)**: Select container `CTN-8801` to view its $+10.3^\circ\text{C}$ excursion, 4-layer anomaly triggers, and Sigmoid spoilage curve ($91.4\%$ risk). Click **Divert to Hub** to route to **Navi Mumbai Cold Hub** ($14.2\,\text{km}$).
5. **Step 5 — Fleet Optimizer (`/fleet`) & What-If Simulation (`/simulator`)**: Redeploy idle reefer `TRK-204` ($18.5\% \rightarrow 54.2\%$ utilisation) and run Monte Carlo simulations showing $\$800\text{K}$ financial exposure reduction.



## 🖥️ Demo

Our solution provides an intelligent supply-chain control tower for monitoring disruptions, shipments, fleet utilisation, and cold-chain risks from a single interface.

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt]( https://frontend-theta-sandy-vt0dijop0s.vercel.app) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |


---

## ⚠️ Known Limitations

We have intentionally kept the solution transparent about its current limitations.

- **IoT data:** Cold-chain sensor data is simulated for demonstration purposes rather than being connected to physical IoT hardware.
- **External logistics integrations:** Live carrier, GPS, port, weather, and transportation-management-system integrations are not currently available unless explicitly configured in the application.
- **Optimization scope:** Route, carrier, and fleet recommendations operate on the available project data and implemented optimization/business logic.
- **Regulatory classification:** Cold-chain severity uses configurable temperature policies and should not be interpreted as universal regulatory advice for every product or country.
- **Production readiness:** Additional authentication, monitoring, scaling, and external integrations may be required for a full production deployment.

---

## 🏅 What We're Most Proud Of

We are most proud of bringing **multiple supply-chain risks into one actionable decision layer** instead of treating disruptions, fleet utilisation, and cold-chain monitoring as separate problems.

Our strongest capability is the end-to-end disruption response workflow:

**Detect → Analyze → Optimize → Act**

When a disruption occurs, the platform can identify potentially affected shipments, evaluate operational risk, consider alternative transportation options, identify relevant fleet capacity, and surface actionable recommendations to the operator.

The cold-chain component extends the platform beyond traditional shipment tracking by detecting temperature excursions and helping prioritize temperature-sensitive cargo before an incident becomes a larger operational or financial risk.

The result is a **single operational control tower designed to help logistics teams make faster, more explainable decisions when supply-chain conditions change.**
