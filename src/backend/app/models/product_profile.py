from sqlalchemy import Column, String, Float, Integer
from app.database import Base

class ProductProfile(Base):
    __tablename__ = "product_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    min_temp_c = Column(Float, nullable=False)
    max_temp_c = Column(Float, nullable=False)
    max_excursion_mins = Column(Integer, default=30)
    critical_temp_c = Column(Float, nullable=False)
    description = Column(String, nullable=True)
