from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class SensorReadingPoint(BaseModel):
    t: str
    v: float
    is_anomaly: Optional[bool] = False

class ColdChainAlert(BaseModel):
    id: str
    container_id: str
    shipment_id: str
    product: str
    location: str
    current_temp: str
    peak_temp: str
    duration_mins: int
    configured_range: str
    severity: str
    status: str
    recommended_action: str
    telemetry_timeline: List[SensorReadingPoint]

class ContainerStatus(BaseModel):
    id: str
    cargo: str
    temp: str
    location: str
    status: str
    shipment: str
    required_range: str = "2–8°C"

class ColdChainSummary(BaseModel):
    compliance_pct: float
    active_reefers: int
    total_excursions: int
    critical_shipments: int
    exposure_amount: str
    timeline: List[SensorReadingPoint]
    alerts: List[ColdChainAlert]
    containers: List[ContainerStatus]
