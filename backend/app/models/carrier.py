from sqlalchemy import Column, String, Float, Integer, Boolean
from app.database import Base

class Carrier(Base):
    __tablename__ = "carriers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    transport_mode = Column(String, default="SEA")
    reliability_score = Column(Float, default=0.90)
    cost_index = Column(Float, default=1.0)
    available_capacity_teu = Column(Integer, default=50)
    cold_chain_certified = Column(Boolean, default=True)
    contact_email = Column(String, nullable=True)
