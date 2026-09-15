from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base

class ColdStorageHub(Base):
    __tablename__ = "cold_storage_hubs"

    id = Column(String, primary_key=True, index=True) # HUB-MUMBAI-01
    hub_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Float, default=500.0)
    capacity_tons = Column(Float, default=500.0)
    available_capacity = Column(Float, default=180.0)
    available_tons = Column(Float, default=180.0)
    occupied_pct = Column(Float, default=64.0)
    certified = Column(Boolean, default=True)
    temp_zones = Column(JSON, default=["ultra_cold", "chilled", "frozen"])
    status = Column(String, default="OPERATIONAL", index=True)
    contact = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
