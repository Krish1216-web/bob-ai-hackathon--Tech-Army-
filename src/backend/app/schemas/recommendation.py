from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Dict, Union
from datetime import datetime

class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str # REROUTE, REDEPLOY, ESCALATE
    subject: str
    level: str # CRITICAL, HIGH, MEDIUM, NORMAL
    title: str
    confidence: int
    description: str
    recommendation: str
    why_reasons: Optional[List[str]] = []
    shipment_id: Optional[str] = None
    asset_id: Optional[str] = None
    delay_reduction_hours: Optional[int] = 0
    risk_reduction_percent: Optional[int] = 0
    financial_saving: Optional[str] = None
    actioned: bool = False
    action_type: Optional[str] = None
    created_at: Optional[datetime] = None

    @field_validator("why_reasons", mode="before")
    @classmethod
    def parse_why_reasons(cls, v):
        if isinstance(v, str):
            return [line.strip() for line in v.split("\n") if line.strip()]
        return v or []

class RecommendationActionRequest(BaseModel):
    accept: bool = True # True = Accept, False = Reject
    notes: Optional[str] = None

class RecommendationActionResponse(BaseModel):
    success: bool
    message: str
    action_id: str
    actioned: bool
    updated_shipment_status: Optional[str] = None
    updated_asset_status: Optional[str] = None
    updated_asset_utilisation: Optional[str] = None
