from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from datetime import datetime
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True) # e.g. a1, a2, a3, a4
    kind = Column(String, nullable=False) # REROUTE, REDEPLOY, ESCALATE
    subject = Column(String, nullable=False) # SHP-1042, SHP-1042 · TRK-204
    level = Column(String, default="CRITICAL") # CRITICAL, HIGH, MEDIUM, NORMAL
    title = Column(String, nullable=False)
    confidence = Column(Integer, default=94)
    description = Column(String, nullable=False)
    recommendation = Column(String, nullable=False)
    why_reasons = Column(String, nullable=True) # JSON list or newline-separated
    shipment_id = Column(String, nullable=True) # SHP-1042
    asset_id = Column(String, nullable=True) # TRK-204
    delay_reduction_hours = Column(Integer, default=28)
    risk_reduction_percent = Column(Integer, default=64)
    financial_saving = Column(String, default="$800K")
    actioned = Column(Boolean, default=False)
    action_type = Column(String, nullable=True) # ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    actioned_at = Column(DateTime, nullable=True)
