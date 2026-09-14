from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, ForeignKey
from datetime import datetime
from app.database import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, index=True) # e.g. SHP-1042
    route = Column(String, nullable=False) # e.g. Mumbai → Frankfurt
    origin = Column(String, nullable=False) # Mumbai
    destination = Column(String, nullable=False) # Frankfurt
    cargo = Column(String, nullable=False) # Vaccines
    value = Column(String, default="$1.25M")
    value_usd = Column(Float, default=1250000.0)
    eta = Column(String, default="Sep 16")
    risk = Column(Integer, default=92) # 0 to 100
    disruption = Column(String, default="Mumbai Port Strike")
    carrier = Column(String, default="Carrier B")
    asset = Column(String, default="TRK-204")
    action = Column(String, default="Reroute") # Reroute, Monitor
    status = Column(String, default="AT_RISK") # AT_RISK, REROUTED, DELAYED, ON_TRACK
    priority = Column(String, default="CRITICAL") # CRITICAL, HIGH, MEDIUM, NORMAL
    is_cold_chain = Column(Boolean, default=True)
    product_profile_id = Column(String, nullable=True) # VACCINES_SOP
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
