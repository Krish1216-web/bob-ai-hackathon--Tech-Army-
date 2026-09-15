from sqlalchemy import Column, String, Integer, Float, DateTime
from datetime import datetime, timezone
from app.database import Base

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    disruption_type = Column(String, nullable=False)
    severity = Column(String, default="HIGH")
    location = Column(String, nullable=False)
    affected_corridor = Column(String, nullable=False)
    duration_hours = Column(Integer, default=72)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="ACTIVE")
    description = Column(String, nullable=True)
    delay_estimate_hours = Column(Float, default=48.0)
