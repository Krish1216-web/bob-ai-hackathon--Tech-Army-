"""
Cold Chain Repository
Provides database access for containers, live sensor telemetry, cold storage hubs, and excursion alerts.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.container import Container
from app.models.sensor_reading import SensorReading
from app.models.cold_chain_alert import ColdChainAlert
from app.models.cold_storage_hub import ColdStorageHub

class ColdChainRepository:
    @staticmethod
    def get_all_containers(db: Session) -> List[Container]:
        return db.query(Container).all()

    @staticmethod
    def get_container_by_id(db: Session, container_id: str) -> Optional[Container]:
        return db.query(Container).filter(Container.container_id == container_id).first()

    @staticmethod
    def get_readings_for_container(db: Session, container_id: str) -> List[SensorReading]:
        return db.query(SensorReading).filter(
            SensorReading.container_id == container_id
        ).order_by(SensorReading.timestamp.asc()).all()

    @staticmethod
    def get_readings_for_shipment(db: Session, shipment_id: str) -> List[SensorReading]:
        return db.query(SensorReading).filter(
            SensorReading.shipment_id == shipment_id
        ).order_by(SensorReading.timestamp.asc()).all()

    @staticmethod
    def get_all_hubs(db: Session) -> List[ColdStorageHub]:
        return db.query(ColdStorageHub).filter(ColdStorageHub.status == "OPERATIONAL").all()

    @staticmethod
    def get_all_alerts(db: Session, status: Optional[str] = "ACTIVE") -> List[ColdChainAlert]:
        query = db.query(ColdChainAlert)
        if status:
            query = query.filter(ColdChainAlert.status == status)
        return query.order_by(ColdChainAlert.created_at.desc()).all()

    @staticmethod
    def resolve_container_excursion(db: Session, container_id: str, new_temp: float = 5.8) -> bool:
        readings = db.query(SensorReading).filter(SensorReading.container_id == container_id).all()
        for r in readings:
            if r.temperature_c > 8.0 or r.temperature_c < 2.0:
                r.temperature_c = new_temp
                r.is_anomaly = False
                r.is_excursion = False
                r.severity = "NORMAL"
                r.status = "RESOLVED"

        container = db.query(Container).filter(Container.container_id == container_id).first()
        if container:
            container.current_temperature = new_temp
            container.status = "NORMAL"
            container.is_anomaly = False
            container.spoilage_risk_pct = 5.0
            container.updated_at = datetime.utcnow()

        alerts = db.query(ColdChainAlert).filter(ColdChainAlert.container_id == container_id).all()
        for a in alerts:
            a.status = "RESOLVED"
            a.resolved_at = datetime.utcnow()

        db.commit()
        return True
