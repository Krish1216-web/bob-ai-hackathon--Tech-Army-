from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.database import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    disruption_id = Column(String, index=True, nullable=True)
    disruption_type = Column(String, nullable=False)
    duration_hours = Column(Integer, default=72)
    severity = Column(String, default="CRITICAL")
    before_delay = Column(Integer, default=72)
    after_delay = Column(Integer, default=44)
    delay_reduction = Column(Integer, default=28)
    exposure_before = Column(String, default="$1.25M")
    exposure_after = Column(String, default="$450K")
    critical_shipments_protected = Column(Integer, default=3)
    confidence = Column(Integer, default=94)
    comparison_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
