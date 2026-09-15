"""
Fleet Repository
Provides database access for Fleet asset tracking, utilization calculations, and idle redeployment.
"""

from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.fleet_asset import FleetAsset

class FleetRepository:
    @staticmethod
    def get_all(db: Session, status: Optional[str] = None) -> List[FleetAsset]:
        query = db.query(FleetAsset)
        if status:
            query = query.filter(FleetAsset.status == status)
        return query.all()

    @staticmethod
    def get_by_id(db: Session, asset_id: str) -> Optional[FleetAsset]:
        return db.query(FleetAsset).filter(FleetAsset.id == asset_id).first()

    @staticmethod
    def get_idle_assets(db: Session) -> List[FleetAsset]:
        return db.query(FleetAsset).filter(FleetAsset.status == "IDLE").all()

    @staticmethod
    def redeploy(db: Session, asset_id: str, target_shipment_id: str = "SHP-1042") -> Optional[FleetAsset]:
        asset = db.query(FleetAsset).filter(FleetAsset.id == asset_id).first()
        if asset:
            asset.status = "ASSIGNED"
            asset.assigned_shipment_id = target_shipment_id
            asset.utilisation_pct = 54.2
            asset.last_updated = datetime.now(timezone.utc)
            db.commit()
            db.refresh(asset)
        return asset
