from pydantic import BaseModel
from typing import Optional, List
from app.schemas.shipment import ShipmentResponse

class DisruptionBase(BaseModel):
    id: str
    title: str
    disruption_type: str
    severity: str
    location: str
    affected_corridor: str
    duration_hours: int
    status: str
    description: Optional[str] = None
    delay_estimate_hours: Optional[float] = 48.0

class DisruptionResponse(DisruptionBase):
    affected_shipments_count: int = 0
    exposure_amount: str = "$1.25M"
    color: str = "red"

    class Config:
        from_attributes = True

class DisruptionImpactResponse(BaseModel):
    disruption: DisruptionResponse
    affected_shipments: List[ShipmentResponse]
    total_exposure: str
    critical_count: int
    delay_reduction_possible_hours: int
    situation: str
    recommended_route: str
    recommended_carrier: str
    why_reasons: List[dict]
