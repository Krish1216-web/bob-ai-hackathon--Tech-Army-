from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.disruption import DisruptionResponse, DisruptionImpactResponse
from app.services.disruption_service import DisruptionService

router = APIRouter(prefix="/disruptions", tags=["Disruptions"])

@router.get("", response_model=List[DisruptionResponse])
def list_disruptions(db: Session = Depends(get_db)):
    return DisruptionService.get_all(db)

@router.get("/{disruption_id}/impact", response_model=DisruptionImpactResponse)
def get_disruption_impact(disruption_id: str, db: Session = Depends(get_db)):
    impact = DisruptionService.get_impact(db, disruption_id)
    if not impact:
        raise HTTPException(status_code=404, detail="Disruption not found")
    return impact
