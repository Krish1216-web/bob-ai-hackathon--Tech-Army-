from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base

class RecommendationAction(Base):
    __tablename__ = "recommendation_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recommendation_id = Column(String, index=True, nullable=False)
    action_type = Column(String, nullable=False) # ACCEPT, REJECT, OVERRIDE
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    executed_by = Column(String, default="DISPATCHER")
    executed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
