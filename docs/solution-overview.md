# 💡 Solution Overview — ChainGuard AI

## The ChainGuard AI Architecture
ChainGuard AI unifies supply chain disruption management, cold-chain IoT telemetry, and fleet utilization into an intelligent, closed-loop control tower powered by **FastAPI**, **React 18**, and **Supabase PostgreSQL**.

```text
DETECT ──► UNDERSTAND ──► RECOMMEND ──► ACT ──► MEASURE
```

---

## Core Pillars of the Solution

### 1. Multi-Corridor Disruption Intelligence
- Correlates live disruption events (e.g. Mumbai Port Strike, Chennai Cyclone, Delhi NH-48 Closure) with in-transit shipments.
- Automatically calculates delay projections, cargo at risk, and corridor bottleneck indices.

### 2. LiveCold Cold Chain Anomaly Intelligence
- **4-Layer Telemetry Diagnostics**:
  1. `L1 Physical Bounds`: Flags readings outside SOP range ($2^\circ\text{C}\text{--}8^\circ\text{C}$).
  2. `L2 Rate of Change`: Detects anomalous temperature rise rates ($>+1.5^\circ\text{C}/\text{hr}$).
  3. `L3 Z-Score Statistics`: Identifies statistical sensor outliers ($z > 3.0\sigma$).
  4. `L4 Persistence & Stuck Sensor`: Detects unvarying sensor noise and sustained excursion duration.
- **Dynamic Sigmoid Spoilage Modeling**: Computes continuous real-time cargo spoilage curves as a function of thermal excursion amplitude and duration.
- **Haversine Certified Cold-Hub Routing**: Calculates spherical distance to nearby cold-storage facilities (Navi Mumbai, Mundra Port, Ahmedabad Hub) and plots emergency diversion corridors.

### 3. Fleet Utilisation Optimizer
- Ingests fleet status (`IDLE`, `ASSIGNED`, `IN_TRANSIT`).
- Flags idle assets (`TRK-204` at $18.5\%$ utilisation for $14\text{h}$) and calculates match scores ($91\%$) against delayed high-priority shipments.
- Provides 1-click redeployment updating asset utilisation to $54.2\%$.

### 4. Closed-Loop AI Recommendations & What-If Simulation
- AI Recommendation Engine produces ranked prescriptive interventions with confidence scores, avoided delays, and exposure reductions.
- Accepting an action executes atomic updates to Supabase PostgreSQL and logs an immutable audit trail.
- What-If simulator allows dispatchers to stress-test hypothetical duration scenarios before committing fleet reallocations.
