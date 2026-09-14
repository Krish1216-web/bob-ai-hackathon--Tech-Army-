"""
Simulation Repository
Provides database access for logging and querying disruption simulation runs.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.simulation_run import SimulationRun

class SimulationRepository:
    @staticmethod
    def save_run(
        db: Session,
        disruption_id: str,
        disruption_type: str,
        duration_hours: int,
        severity: str,
        before_delay: int,
        after_delay: int,
        delay_reduction: int,
        exposure_before: str,
        exposure_after: str,
        critical_shipments_protected: int,
        confidence: int,
        comparison_data: Any
    ) -> SimulationRun:
        sim = SimulationRun(
            disruption_id=disruption_id,
            disruption_type=disruption_type,
            duration_hours=duration_hours,
            severity=severity,
            before_delay=before_delay,
            after_delay=after_delay,
            delay_reduction=delay_reduction,
            exposure_before=exposure_before,
            exposure_after=exposure_after,
            critical_shipments_protected=critical_shipments_protected,
            confidence=confidence,
            comparison_data=comparison_data
        )
        db.add(sim)
        db.commit()
        db.refresh(sim)
        return sim

    @staticmethod
    def get_latest_runs(db: Session, limit: int = 10) -> List[SimulationRun]:
        return db.query(SimulationRun).order_by(SimulationRun.created_at.desc()).limit(limit).all()
