"""
Cold Chain Repository
Provides database access for containers, live sensor telemetry, cold storage hubs, and excursion alerts.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.container import Container
from app.models.sensor_reading import SensorReading
from app.models.cold_chain_alert import ColdChainAlert
from app.models.cold_storage_hub import ColdStorageHub
from app.engine.cold_chain_anomaly import anomaly_engine

class ColdChainRepository:
    @staticmethod
    def get_all_containers(db: Session) -> List[Container]:
        return db.query(Container).order_by(Container.created_at.asc()).all()

    @staticmethod
    def get_container_by_id(db: Session, container_id: str) -> Optional[Container]:
        return db.query(Container).filter(
            (Container.container_id == container_id) | (Container.id == container_id)
        ).first()

    @staticmethod
    def create_container(db: Session, data: Dict[str, Any]) -> Container:
        cid = data.get("container_id") or data.get("id") or f"CTN-{uuid.uuid4().hex[:4].upper()}"
        existing = db.query(Container).filter((Container.container_id == cid) | (Container.id == cid)).first()
        if existing:
            # Update existing
            for k, v in data.items():
                if hasattr(existing, k) and v is not None:
                    setattr(existing, k, v)
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return existing

        container = Container(
            id=cid,
            container_id=cid,
            shipment_id=data.get("shipment_id", f"SHP-{uuid.uuid4().hex[:4].upper()}"),
            container_type=data.get("container_type", "REEFER_40FT"),
            product_type=data.get("product_type", "mRNA Vaccines"),
            status=data.get("status", "NORMAL"),
            current_temperature=float(data.get("current_temperature", 5.4)),
            peak_temperature=float(data.get("peak_temperature", data.get("current_temperature", 5.4))),
            target_min_temperature=float(data.get("target_min_temperature", 2.0)),
            target_max_temperature=float(data.get("target_max_temperature", 8.0)),
            required_range=data.get("required_range", f"{data.get('target_min_temperature', 2.0)}°C - {data.get('target_max_temperature', 8.0)}°C"),
            latitude=float(data.get("latitude", 18.95)),
            longitude=float(data.get("longitude", 72.82)),
            current_location=data.get("current_location", "Mumbai Port"),
            asset_id=data.get("asset_id", "TRK-204"),
            is_anomaly=bool(data.get("is_anomaly", False)),
            anomaly_layer=data.get("anomaly_layer", "NONE"),
            spoilage_risk_pct=float(data.get("spoilage_risk_pct", 5.0)),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(container)
        db.flush()

        # Seed initial sensor timeline readings for the container
        base_t = container.current_temperature
        for i, (time_lbl, t_offset) in enumerate([("06:00", -0.4), ("08:00", -0.2), ("10:00", 0.1), ("12:00", 0.3), ("14:00", 0.0)]):
            sr = SensorReading(
                container_id=cid,
                shipment_id=container.shipment_id,
                temperature_c=round(base_t + t_offset, 1),
                peak_temperature_c=round(max(base_t, base_t + t_offset), 1),
                humidity_pct=65.0,
                is_anomaly=False,
                anomaly_layer="NONE",
                severity="NORMAL",
                time_label=time_lbl,
                excursion_duration_mins=0,
                status="NORMAL",
                timestamp=datetime.utcnow()
            )
            db.add(sr)

        db.commit()
        db.refresh(container)
        return container

    @staticmethod
    def bulk_create_containers(db: Session, containers_data: List[Dict[str, Any]]) -> List[Container]:
        created = []
        for cdata in containers_data:
            c = ColdChainRepository.create_container(db, cdata)
            created.append(c)
        return created

    @staticmethod
    def get_readings_for_container(db: Session, container_id: str) -> List[SensorReading]:
        return db.query(SensorReading).filter(
            (SensorReading.container_id == container_id) | (SensorReading.shipment_id == container_id)
        ).order_by(SensorReading.timestamp.asc()).all()

    @staticmethod
    def get_readings_for_shipment(db: Session, shipment_id: str) -> List[SensorReading]:
        return db.query(SensorReading).filter(
            SensorReading.shipment_id == shipment_id
        ).order_by(SensorReading.timestamp.asc()).all()

    @staticmethod
    def ingest_sensor_reading(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
        cid = data.get("container_id", "CTN-8801")
        temp = float(data.get("temperature_c", 5.4))
        p_type = data.get("product_type", "vaccines")

        container = db.query(Container).filter(
            (Container.container_id == cid) | (Container.id == cid)
        ).first()

        # Run 4-layer anomaly engine
        anomaly_res = anomaly_engine.check(cid, temp, p_type)

        min_t = container.target_min_temperature if container else 2.0
        max_t = container.target_max_temperature if container else 8.0

        is_excursion = temp < min_t or temp > max_t or anomaly_res.is_anomaly
        if temp >= max_t + 2.0:
            severity = "CRITICAL"
            spoilage_risk = 87.5
        elif temp > max_t or temp < min_t:
            severity = "MEDIUM"
            spoilage_risk = 35.0
        else:
            severity = "NORMAL"
            spoilage_risk = 5.0

        time_lbl = data.get("time_label") or datetime.utcnow().strftime("%H:%M")
        sr = SensorReading(
            container_id=cid,
            shipment_id=container.shipment_id if container else data.get("shipment_id"),
            temperature_c=temp,
            peak_temperature_c=max(temp, container.peak_temperature if container else temp),
            humidity_pct=float(data.get("humidity_pct", 65.0)),
            is_anomaly=anomaly_res.is_anomaly,
            anomaly_layer=anomaly_res.layer,
            severity=severity,
            time_label=time_lbl,
            excursion_duration_mins=45 if severity == "CRITICAL" else 15 if severity == "MEDIUM" else 0,
            status=severity,
            timestamp=datetime.utcnow()
        )
        db.add(sr)

        if container:
            container.current_temperature = temp
            container.peak_temperature = max(container.peak_temperature or temp, temp)
            container.status = severity
            container.is_anomaly = anomaly_res.is_anomaly
            container.anomaly_layer = anomaly_res.layer
            container.spoilage_risk_pct = spoilage_risk
            container.updated_at = datetime.utcnow()

        # Create or update alert if excursion
        if is_excursion:
            alert = db.query(ColdChainAlert).filter(
                ColdChainAlert.container_id == cid,
                ColdChainAlert.status == "ACTIVE"
            ).first()
            if not alert:
                alert = ColdChainAlert(
                    id=f"alert-{cid.lower()}-{uuid.uuid4().hex[:4]}",
                    container_id=cid,
                    shipment_id=container.shipment_id if container else "SHP-1042",
                    severity=severity,
                    temperature_reading=temp,
                    duration_minutes=45 if severity == "CRITICAL" else 15,
                    recommended_action="Inspect reefer compressor unit and divert to nearest qualified cold hub.",
                    status="ACTIVE",
                    created_at=datetime.utcnow()
                )
                db.add(alert)

        db.commit()

        return {
            "success": True,
            "container_id": cid,
            "temperature_c": temp,
            "is_anomaly": anomaly_res.is_anomaly,
            "anomaly_layer": anomaly_res.layer,
            "anomaly_reason": anomaly_res.reason,
            "severity": severity,
            "spoilage_risk_pct": f"{spoilage_risk:.1f}%"
        }

    @staticmethod
    def simulate_excursion(db: Session, container_id: str, target_temp: float = 10.3, duration_mins: int = 45) -> Dict[str, Any]:
        return ColdChainRepository.ingest_sensor_reading(db, {
            "container_id": container_id,
            "temperature_c": target_temp,
            "time_label": datetime.utcnow().strftime("%H:%M")
        })

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
        readings = db.query(SensorReading).filter(
            (SensorReading.container_id == container_id) | (SensorReading.shipment_id == container_id)
        ).all()
        for r in readings:
            if r.temperature_c > 8.0 or r.temperature_c < 2.0:
                r.temperature_c = new_temp
                r.is_anomaly = False
                r.is_excursion = False
                r.severity = "NORMAL"
                r.status = "RESOLVED"

        container = db.query(Container).filter(
            (Container.container_id == container_id) | (Container.id == container_id)
        ).first()
        if container:
            container.current_temperature = new_temp
            container.status = "NORMAL"
            container.is_anomaly = False
            container.anomaly_layer = "NONE"
            container.spoilage_risk_pct = 5.0
            container.updated_at = datetime.utcnow()

        alerts = db.query(ColdChainAlert).filter(ColdChainAlert.container_id == container_id).all()
        for a in alerts:
            a.status = "RESOLVED"
            a.resolved_at = datetime.utcnow()

        db.commit()
        return True
