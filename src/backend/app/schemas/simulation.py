from pydantic import BaseModel
from typing import Optional, List, Dict

class SimulationRequest(BaseModel):
    disruption_type: str = "Mumbai Port Strike"
    duration_hours: int = 72
    severity: str = "Critical"
    affected_route: Optional[str] = "Mumbai → Frankfurt"
    cargo_type: Optional[str] = "Vaccines"

class StrategyMetric(BaseModel):
    name: str # Current, AI Recommended, Alternative
    delay: int
    delay_reduction: str
    financial_exposure: str
    success_probability: str

class ProjectedRouteStep(BaseModel):
    name: str
    status: str # active, recommended, standard
    tag: Optional[str] = None

class SimulationResponse(BaseModel):
    scenario_id: str
    disruption_type: str
    duration_hours: int
    severity: str
    without_ai: Dict[str, str | int]
    with_ai: Dict[str, str | int]
    comparison_data: List[StrategyMetric]
    projected_route: List[ProjectedRouteStep]
    delay_avoided_hours: int
    exposure_reduction: str
    critical_shipments_protected: int
    watsonx_explanation: str
    recommended_fleet_asset: str
    alternative_carrier: str
