"""
Shipment Repository
Provides clean database access for Shipment queries and mutations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.shipment import Shipment

class ShipmentRepository:
    @staticmethod
    def get_all(db: Session, status: Optional[str] = None, priority: Optional[str] = None) -> List[Shipment]:
        query = db.query(Shipment)
        if status:
            query = query.filter(Shipment.status == status)
        if priority:
            query = query.filter(Shipment.priority == priority)
        return query.order_by(Shipment.risk.desc()).all()

    @staticmethod
    def get_by_id(db: Session, shipment_id: str) -> Optional[Shipment]:
        return db.query(Shipment).filter(Shipment.id == shipment_id).first()

    @staticmethod
    def update_status(db: Session, shipment_id: str, new_status: str, route: Optional[str] = None, risk: Optional[int] = None) -> Optional[Shipment]:
        shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if shipment:
            shipment.status = new_status
            if route:
                shipment.route = route
            if risk is not None:
                shipment.risk = risk
            db.commit()
            db.refresh(shipment)
        return shipment

    @staticmethod
    def get_disrupted_shipments(db: Session) -> List[Shipment]:
        return db.query(Shipment).filter(
            Shipment.status.in_(["AT_RISK", "DELAYED"]),
            Shipment.disruption != "None"
        ).all()
