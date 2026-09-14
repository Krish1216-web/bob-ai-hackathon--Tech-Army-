from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SensorReadingPoint(BaseModel):
    t: str
    v: float
    is_anomaly: Optional[bool] = False
    layer: Optional[str] = "NONE"

class ContainerCreate(BaseModel):
    container_id: str
    shipment_id: Optional[str] = None
    product_type: str = "mRNA Vaccines"
    current_location: str = "Mumbai Port"
    origin: str = "Mumbai Port"
    destination: str = "Delhi NCR Terminal"
    latitude: float = 18.95
    longitude: float = 72.82
    target_min_temperature: float = 2.0
    target_max_temperature: float = 8.0
    current_temperature: float = 5.4
    cargo_value_usd: float = 1250000.0
    asset_id: Optional[str] = "TRK-204"

class ContainerBulkImport(BaseModel):
    containers: List[ContainerCreate]

class TelemetryIngest(BaseModel):
    container_id: str
    shipment_id: Optional[str] = None
    temperature_c: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    humidity_pct: Optional[float] = 65.0
    reefer_status: Optional[str] = "REEFER_ON"
    time_label: Optional[str] = None

class ExcursionSimulation(BaseModel):
    container_id: str
    target_temperature_c: float = 10.3
    excursion_duration_mins: int = 45
    mode: str = "SAFETY"

class DiversionEvaluation(BaseModel):
    should_divert: bool
    mode: str
    spoilage_probability: float
    spoilage_risk_pct: str
    expected_loss_usd: float
    diversion_cost_usd: float
    expected_loss_post_diversion_usd: float
    net_saving_usd: float
    decision: str
    reason: str

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
    container_id: Optional[str] = None
    cargo: str
    temp: str
    location: str
    status: str
    shipment: str
    required_range: str = "2–8°C"
    peak_temp: Optional[str] = "5.8°C"
    risk_score: Optional[int] = 0
    spoilage_risk_pct: Optional[str] = "5.0%"

class ColdChainSummary(BaseModel):
    compliance_pct: float
    active_reefers: int
    total_excursions: int
    critical_shipments: int
    exposure_amount: str
    timeline: List[SensorReadingPoint]
    alerts: List[ColdChainAlert]
    containers: List[ContainerStatus]
