from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class FleetAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    asset_type: str
    identifier: str
    location: str
    capacity_tons: float
    status: str
    idle_hours: float
    utilisation_pct: float
    is_refrigerated: bool
    assigned_shipment_id: Optional[str] = None
    match_score: Optional[int] = None
    projected_gain: Optional[str] = None

class FleetUtilisationStats(BaseModel):
    total_assets: int
    active_count: int
    available_count: int
    idle_count: int
    overall_utilisation_pct: float
    trend_delta: str
    by_asset_type: List[Dict[str, Any]]
    hourly_trend: List[Dict[str, Any]]

class RedeploymentOpportunity(BaseModel):
    asset: str
    location: str
    idle: str
    match: int
    from_util: str
    to_util: str
    gain: str
    shipment: str
    route: str
    cargo: str
    value: str

class RedeployRequest(BaseModel):
    target_shipment_id: Optional[str] = None
    notes: Optional[str] = None
