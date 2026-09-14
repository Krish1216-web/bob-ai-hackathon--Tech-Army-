from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.schemas.fleet import FleetAssetResponse, FleetUtilisationStats, RedeploymentOpportunity, RedeployRequest
from app.services.fleet_service import FleetService

router = APIRouter(prefix="/fleet", tags=["Fleet Optimizer"])

@router.get("", response_model=List[FleetAssetResponse])
def list_fleet_assets(db: Session = Depends(get_db)):
    return FleetService.get_all(db)

@router.get("/utilisation", response_model=FleetUtilisationStats)
def get_fleet_utilisation(db: Session = Depends(get_db)):
    return FleetService.get_utilisation_stats(db)

@router.get("/idle", response_model=List[RedeploymentOpportunity])
def get_idle_redeployment_opportunities(db: Session = Depends(get_db)):
    return FleetService.get_redeployment_opportunities(db)

@router.post("/{asset_id}/redeploy")
def redeploy_asset(asset_id: str, req: RedeployRequest = RedeployRequest(), db: Session = Depends(get_db)):
    target = req.target_shipment_id or "SHP-1042"
    return FleetService.redeploy_asset(db, asset_id, target)

@router.post("/redeploy")
def redeploy_asset_direct(payload: Dict[str, Any], db: Session = Depends(get_db)):
    asset_id = payload.get("asset_id", "TRK-204")
    target = payload.get("target_shipment_id", "SHP-1042")
    return FleetService.redeploy_asset(db, asset_id, target)
