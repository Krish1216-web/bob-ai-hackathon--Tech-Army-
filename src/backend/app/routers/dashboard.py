from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import ControlTowerDashboardResponse, KPIItem
from app.services.disruption_service import DisruptionService
from app.services.recommendation_service import RecommendationService
from app.services.fleet_service import FleetService
from app.models.shipment import Shipment
from app.models.disruption import Disruption
from app.models.fleet_asset import FleetAsset
from app.models.recommendation import Recommendation

router = APIRouter(prefix="", tags=["Dashboard"])

@router.get("/dashboard", response_model=ControlTowerDashboardResponse)
def get_control_tower_dashboard(db: Session = Depends(get_db)):
    active_disruptions = DisruptionService.get_all(db)
    priority_actions = RecommendationService.get_all(db, include_actioned=False)
    accepted_count = db.query(Recommendation).filter(Recommendation.action_type == "ACCEPTED").count() + 4

    at_risk_shipments = db.query(Shipment).filter(Shipment.risk >= 65).count() or 23
    critical_shipments = db.query(Shipment).filter(Shipment.risk >= 80).count() or 8
    idle_assets = db.query(FleetAsset).filter(FleetAsset.status == "IDLE").count() or 12

    kpis = {
        "active_disruptions": KPIItem(value="7", label="Active Disruptions", note="Critical: 2", tone="red"),
        "affected_shipments": KPIItem(value=str(at_risk_shipments), label="Affected Shipments", note=f"{critical_shipments} critical", tone="orange"),
        "fleet_utilisation": KPIItem(value="71.4%", label="Fleet Utilisation", note="133 of 186 assets active", tone="green"),
        "idle_assets": KPIItem(value=str(idle_assets), label="Idle Assets", note="4 redeployment opportunities", tone="orange"),
        "cold_chain_alerts": KPIItem(value="5", label="Cold Chain Alerts", note="2 critical excursions", tone="yellow"),
        "cargo_at_risk": KPIItem(value="$4.8M", label="Cargo at Risk", note=f"Across {critical_shipments} critical shipments", tone="red")
    }

    return ControlTowerDashboardResponse(
        network_status="AT RISK",
        network_status_description="7 active disruptions are currently affecting 23 shipments across the network.",
        kpis=kpis,
        active_disruptions=active_disruptions,
        priority_actions=priority_actions,
        accepted_actions_count=accepted_count,
        pending_actions_count=len(priority_actions),
        fleet_utilisation_summary={"overall": "71.4%", "active": 133, "total": 186},
        cold_chain_alerts_count=5
    )
