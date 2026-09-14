"""
Disruption Repository
Provides clean database access for Disruption queries and impact analysis.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.disruption import Disruption
from app.models.shipment import Shipment

class DisruptionRepository:
    @staticmethod
    def get_all(db: Session, status: Optional[str] = "ACTIVE") -> List[Disruption]:
        query = db.query(Disruption)
        if status:
            query = query.filter(Disruption.status == status)
        return query.all()

    @staticmethod
    def get_by_id(db: Session, disruption_id: str) -> Optional[Disruption]:
        return db.query(Disruption).filter(
            (Disruption.id == disruption_id) | (Disruption.title.ilike(f"%{disruption_id}%"))
        ).first()

    @staticmethod
    def get_affected_shipments(db: Session, disruption: Disruption) -> List[Shipment]:
        return db.query(Shipment).filter(
            (Shipment.disruption == disruption.title) |
            (Shipment.origin.ilike(f"%{disruption.location}%")) |
            (Shipment.route.ilike(f"%{disruption.location}%"))
        ).all()
