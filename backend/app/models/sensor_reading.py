from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    shipment_id = Column(String, index=True) # e.g. SHP-1042
    container_id = Column(String, default="CTN-8801") # CTN-8801
    timestamp = Column(DateTime, default=datetime.utcnow)
    time_label = Column(String, default="14:00")
    temperature_c = Column(Float, nullable=False) # 10.3
    humidity_pct = Column(Float, default=65.0)
    is_anomaly = Column(Boolean, default=False)
    anomaly_layer = Column(String, nullable=True) # L1_BOUNDS, L2_RATE, L3_ZSCORE, L4_STUCK, NONE
    is_excursion = Column(Boolean, default=False)
    excursion_duration_mins = Column(Integer, default=45)
    peak_temperature_c = Column(Float, default=11.2)
    severity = Column(String, default="CRITICAL") # NORMAL, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="ACTIVE") # ACTIVE, INVESTIGATING, RESOLVED
