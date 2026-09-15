"""
Recommendation Repository
Provides database access for AI recommendations and action audit logging.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.recommendation import Recommendation
from app.models.recommendation_action import RecommendationAction

class RecommendationRepository:
    @staticmethod
    def get_all(db: Session, include_actioned: bool = True) -> List[Recommendation]:
        query = db.query(Recommendation)
        if not include_actioned:
            query = query.filter(Recommendation.actioned == False)
        return query.order_by(Recommendation.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, rec_id: str) -> Optional[Recommendation]:
        return db.query(Recommendation).filter(
            (Recommendation.id == rec_id) | (Recommendation.id == f"REC-{rec_id}") | (Recommendation.id == rec_id.replace("REC-", ""))
        ).first()

    @staticmethod
    def execute_action(db: Session, rec_id: str, accept: bool = True) -> Optional[Recommendation]:
        rec = RecommendationRepository.get_by_id(db, rec_id)
        if rec:
            prev_state = {"actioned": rec.actioned, "status": rec.action_type}
            rec.actioned = True
            rec.action_type = "ACCEPTED" if accept else "REJECTED"
            rec.actioned_at = datetime.now(timezone.utc)

            # Record audit trail in recommendation_actions table
            action_log = RecommendationAction(
                recommendation_id=rec.id,
                action_type="ACCEPT" if accept else "REJECT",
                previous_state=prev_state,
                new_state={"actioned": True, "status": rec.action_type},
                executed_by="DISPATCHER"
            )
            db.add(action_log)
            db.commit()
            db.refresh(rec)
        return rec
