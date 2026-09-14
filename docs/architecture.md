# 🏗️ Technical Architecture — ChainGuard AI

## End-to-End System Diagram

```mermaid
graph TD
    subgraph Client Layer
        A[React 18 + Vite Single-Page Application]
        A1[Control Tower Cockpit]
        A2[Leaflet LiveCold Map]
        A3[What-If Simulator]
        A4[AI Copilot Chat]
    end

    subgraph API & Service Layer [FastAPI]
        B[FastAPI REST API Gateway]
        C1[Disruption Intelligence Service]
        C2[LiveCold Anomaly & Spoilage Engine]
        C3[Fleet Utilisation Optimizer]
        C4[AI Prescriptive Recommendation Service]
        C5[Monte Carlo What-If Simulation Engine]
        C6[watsonx.ai / Granite LLM Copilot Adapter]
    end

    subgraph Data Access Layer
        D[SQLAlchemy ORM Repositories]
        D1[ShipmentRepository]
        D2[DisruptionRepository]
        D3[FleetRepository]
        D4[ColdChainRepository]
        D5[RecommendationRepository]
        D6[SimulationRepository]
    end

    subgraph Database Layer [Supabase PostgreSQL]
        E[(Supabase PostgreSQL 15+)]
        E1[shipments]
        E2[disruptions]
        E3[fleet_assets]
        E4[containers]
        E5[sensor_readings]
        E6[cold_chain_alerts]
        E7[cold_storage_hubs]
        E8[recommendations]
        E9[recommendation_actions]
        E10[simulation_runs]
    end

    A -->|HTTP / JSON REST API| B
    B --> C1 & C2 & C3 & C4 & C5 & C6
    C1 & C2 & C3 & C4 & C5 --> D
    D --> D1 & D2 & D3 & D4 & D5 & D6
    D1 & D2 & D3 & D4 & D5 & D6 -->|PostgreSQL Connection Pool| E
```

---

## Relational Database Schema (Supabase PostgreSQL)

| Table | Primary Key | Foreign Keys / Description |
|---|---|---|
| `shipments` | `id` (VARCHAR) | `disruption_id`, `carrier_id`, origin/dest coordinates, status, value, risk score |
| `disruptions` | `id` (VARCHAR) | Disruption event name, severity, delay hours, corridor geometry |
| `fleet_assets` | `id` (VARCHAR) | `assigned_shipment_id`, asset type, utilisation %, status, GPS coordinates |
| `containers` | `id` (VARCHAR) | `shipment_id`, `product_id`, target SOP bounds, current/peak temp, spoilage risk |
| `sensor_readings` | `id` (UUID) | `container_id`, timestamp, temp, humidity, anomaly flags (`L1`–`L4`) |
| `cold_chain_alerts`| `id` (VARCHAR) | `container_id`, severity (`CRITICAL`, `MEDIUM`), breach duration, action |
| `cold_storage_hubs`| `id` (VARCHAR) | Hub name, GPS coordinates, available tons, temp zones |
| `recommendations` | `id` (VARCHAR) | `shipment_id`, `disruption_id`, action type, confidence, delay avoided |
| `recommendation_actions` | `id` (UUID) | `recommendation_id`, dispatcher actor, timestamp, previous/new status |
| `simulation_runs` | `id` (UUID) | Scenario parameters, before/after delay, exposure savings |

---

## Security & Isolation Policies
1. **Row Level Security (RLS)**: Public read policies enabled on Supabase PostgreSQL for operational transparency while administrative and mutation operations are restricted via repository layer connections.
2. **Key Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is exclusively consumed by backend services and never exposed to the client bundle.
3. **Environment Segregation**: `.env` files are excluded from version control via `.gitignore`; public `.env.example` templates contain standard placeholders.
