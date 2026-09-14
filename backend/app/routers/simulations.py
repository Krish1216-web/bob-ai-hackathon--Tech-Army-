from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulator_service import SimulatorService

router = APIRouter(prefix="/simulations", tags=["What-If Simulator"])

@router.post("/disruption", response_model=SimulationResponse)
def run_disruption_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    return SimulatorService.run_simulation(db, req)
