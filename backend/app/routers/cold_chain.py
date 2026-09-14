from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.schemas.cold_chain import (
    ColdChainAlert as ColdChainAlertSchema,
    ColdChainSummary,
    ContainerCreate,
    ContainerBulkImport,
    TelemetryIngest,
    ExcursionSimulation
)
from app.services.cold_chain_service import ColdChainService
from app.db.repositories.cold_chain import ColdChainRepository

router = APIRouter(prefix="/cold-chain", tags=["Cold Chain"])

@router.get("/summary", response_model=ColdChainSummary)
def get_cold_chain_summary(db: Session = Depends(get_db)):
    return ColdChainService.get_summary(db)

@router.get("/map")
def get_cold_chain_map(mode: str = Query("SAFETY", description="Decision mode: SAFETY, BALANCED, ECO"), db: Session = Depends(get_db)):
    return ColdChainService.get_map_data(db, mode=mode)

@router.get("/containers")
def list_containers(db: Session = Depends(get_db)):
    summary = ColdChainService.get_summary(db)
    return summary.containers

@router.post("/containers")
def create_container(payload: ContainerCreate, db: Session = Depends(get_db)):
    return ColdChainService.create_new_container(db, payload.dict())

@router.post("/bulk-import")
def bulk_import_containers(payload: ContainerBulkImport, db: Session = Depends(get_db)):
    return ColdChainService.bulk_import(db, [c.dict() for c in payload.containers])

@router.post("/telemetry")
def ingest_telemetry(payload: TelemetryIngest, db: Session = Depends(get_db)):
    return ColdChainService.ingest_telemetry(db, payload.dict())

@router.post("/simulate-excursion")
def simulate_excursion(payload: ExcursionSimulation, db: Session = Depends(get_db)):
    return ColdChainService.simulate_excursion(
        db,
        container_id=payload.container_id,
        target_temp=payload.target_temperature_c,
        duration_mins=payload.excursion_duration_mins
    )

@router.get("/alerts", response_model=List[ColdChainAlertSchema])
def get_cold_chain_alerts(db: Session = Depends(get_db)):
    summary = ColdChainService.get_summary(db)
    return summary.alerts

@router.get("/hubs")
def get_cold_hubs(db: Session = Depends(get_db)):
    from app.engine.cold_chain_hubs import COLD_STORAGE_HUBS
    return COLD_STORAGE_HUBS

@router.get("/telemetry/{container_id}")
def get_container_telemetry(container_id: str, db: Session = Depends(get_db)):
    return ColdChainService.get_shipment_telemetry(db, container_id)

@router.get("/containers/{identifier}")
@router.get("/{identifier}")
def get_shipment_cold_chain(identifier: str, db: Session = Depends(get_db)):
    return ColdChainService.get_shipment_telemetry(db, identifier)

@router.post("/action")
@router.post("/actions")
def execute_cold_chain_action(payload: Dict[str, Any], db: Session = Depends(get_db)):
    container_id = payload.get("container_id", "CTN-8801")
    action_type = payload.get("action_type", "RECOVER_REEFER")
    return ColdChainService.execute_action(db, container_id, action_type)

@router.get("/audit-report/{container_id}")
@router.get("/reports/audit/{container_id}")
def get_cold_chain_audit_report(container_id: str, db: Session = Depends(get_db)):
    return ColdChainService.generate_audit_report(db, container_id)

@router.post("/{container_id}/investigate")
@router.post("/containers/{container_id}/investigate")
def mark_investigating(container_id: str, db: Session = Depends(get_db)):
    return ColdChainService.investigate_container(db, container_id)

