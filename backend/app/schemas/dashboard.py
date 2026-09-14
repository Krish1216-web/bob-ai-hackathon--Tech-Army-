from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.shipment import ShipmentResponse
from app.schemas.disruption import DisruptionResponse
from app.schemas.recommendation import RecommendationResponse

class KPIItem(BaseModel):
    value: str
    label: str
    note: str
    tone: str

class ControlTowerDashboardResponse(BaseModel):
    network_status: str
    network_status_description: str
    kpis: Dict[str, KPIItem]
    active_disruptions: List[DisruptionResponse]
    priority_actions: List[RecommendationResponse]
    accepted_actions_count: int
    pending_actions_count: int
    fleet_utilisation_summary: Dict[str, Any]
    cold_chain_alerts_count: int
