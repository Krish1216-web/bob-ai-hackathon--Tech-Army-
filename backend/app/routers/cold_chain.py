from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.schemas.cold_chain import ColdChainAlert, ColdChainSummary
from app.services.cold_chain_service import ColdChainService

router = APIRouter(prefix="/cold-chain", tags=["Cold Chain"])

@router.get("/summary", response_model=ColdChainSummary)
def get_cold_chain_summary(db: Session = Depends(get_db)):
    return ColdChainService.get_summary(db)

@router.get("/map")
def get_cold_chain_map(db: Session = Depends(get_db)):
    return ColdChainService.get_map_data(db)

@router.get("/alerts", response_model=List[ColdChainAlert])
def get_cold_chain_alerts(db: Session = Depends(get_db)):
    summary = ColdChainService.get_summary(db)
    return summary.alerts

@router.get("/{shipment_id}")
@router.get("/containers/{shipment_id}")
def get_shipment_cold_chain(shipment_id: str, db: Session = Depends(get_db)):
    return ColdChainService.get_shipment_telemetry(db, shipment_id)

@router.post("/action")
@router.post("/actions")
def execute_cold_chain_action(payload: Dict[str, Any], db: Session = Depends(get_db)):
    container_id = payload.get("container_id", "CTN-8801")
    action_type = payload.get("action_type", "RECOVER_REEFER")
    return ColdChainService.execute_action(db, container_id, action_type)

@router.post("/{container_id}/investigate")
@router.post("/containers/{container_id}/investigate")
def mark_investigating(container_id: str, db: Session = Depends(get_db)):
    return ColdChainService.investigate_container(db, container_id)
