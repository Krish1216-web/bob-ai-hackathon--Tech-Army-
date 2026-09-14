from sqlalchemy import Column, String, Float, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Container(Base):
    __tablename__ = "containers"

    id = Column(String, primary_key=True, index=True) # e.g. CTN-8801
    container_id = Column(String, unique=True, index=True, nullable=False) # CTN-8801
    shipment_id = Column(String, index=True, nullable=True) # SHP-1042
    container_type = Column(String, default="REEFER_40FT")
    product_type = Column(String, default="mRNA Vaccines")
    status = Column(String, default="NORMAL", index=True) # NORMAL, MEDIUM, CRITICAL, INVESTIGATING, RESOLVED
    current_temperature = Column(Float, default=5.4)
    peak_temperature = Column(Float, default=5.8)
    target_min_temperature = Column(Float, default=2.0)
    target_max_temperature = Column(Float, default=8.0)
    required_range = Column(String, default="2°C - 8°C")
    latitude = Column(Float, default=18.95)
    longitude = Column(Float, default=72.82)
    current_location = Column(String, default="Mumbai Port")
    asset_id = Column(String, nullable=True) # TRK-204
    is_anomaly = Column(Boolean, default=False)
    anomaly_layer = Column(String, default="NONE")
    spoilage_risk_pct = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
