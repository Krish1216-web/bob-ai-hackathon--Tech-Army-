from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from datetime import datetime
from app.database import Base

class FleetAsset(Base):
    __tablename__ = "fleet_assets"

    id = Column(String, primary_key=True, index=True) # e.g. TRK-204, CTN-8801, VSL-003
    asset_type = Column(String, nullable=False) # TRUCK, CONTAINER, VESSEL
    identifier = Column(String, nullable=False)
    location = Column(String, nullable=False) # e.g. Mumbai, Mundra, Pune, Chennai
    capacity_tons = Column(Float, default=20.0)
    status = Column(String, default="IDLE") # IDLE, ASSIGNED, ACTIVE, MAINTENANCE
    idle_hours = Column(Float, default=14.0)
    active_hours = Column(Float, default=31.0)
    available_hours = Column(Float, default=168.0)
    utilisation_pct = Column(Float, default=18.5)
    is_refrigerated = Column(Boolean, default=True)
    assigned_shipment_id = Column(String, nullable=True)
    match_score = Column(Integer, default=91)
    projected_gain = Column(String, default="+35.7%")
    last_updated = Column(DateTime, default=datetime.utcnow)
