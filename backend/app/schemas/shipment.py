from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ShipmentBase(BaseModel):
    id: str
    route: str
    cargo: str
    value: str
    eta: str
    risk: int
    disruption: str
    carrier: str
    asset: str
    action: str
    status: Optional[str] = "AT_RISK"
    priority: Optional[str] = "CRITICAL"
    is_cold_chain: Optional[bool] = False

class ShipmentResponse(ShipmentBase):
    origin: Optional[str] = None
    destination: Optional[str] = None
    value_usd: Optional[float] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ShipmentDetailResponse(ShipmentResponse):
    active_disruptions: List[str] = []
    recommendation_summary: Optional[str] = None
    temperature_status: Optional[str] = None
    asset_status: Optional[str] = None
