from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime
from app.database import Base

class ColdChainAlert(Base):
    __tablename__ = "cold_chain_alerts"

    id = Column(String, primary_key=True, index=True) # alert-ctn-8801
    alert_id = Column(String, unique=True, index=True, nullable=False)
    container_id = Column(String, index=True, nullable=False)
    shipment_id = Column(String, index=True, nullable=True)
    severity = Column(String, default="CRITICAL", index=True) # CRITICAL, MEDIUM, LOW
    alert_type = Column(String, default="EXCURSION_TEMPERATURE_SPIKE")
    temperature = Column(Float, default=10.3)
    peak_temperature = Column(Float, default=11.2)
    duration_minutes = Column(Integer, default=45)
    configured_range = Column(String, default="2°C - 8°C")
    status = Column(String, default="ACTIVE", index=True) # ACTIVE, ACKNOWLEDGED, RESOLVED
    recommended_action = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
