"""
Unit & Integration Tests for Supabase Repositories & PostgreSQL Schema
"""

import pytest
from app.db.repositories.shipments import ShipmentRepository
from app.db.repositories.disruptions import DisruptionRepository
from app.db.repositories.fleet import FleetRepository
from app.db.repositories.cold_chain import ColdChainRepository
from app.db.repositories.recommendations import RecommendationRepository
from app.db.repositories.simulations import SimulationRepository
from app.database import SessionLocal

def test_shipment_repository(client):
    db = SessionLocal()
    try:
        shipments = ShipmentRepository.get_all(db)
        assert len(shipments) >= 12
        
        shp_1042 = ShipmentRepository.get_by_id(db, "SHP-1042")
        assert shp_1042 is not None
        assert shp_1042.cargo == "Vaccines"
        assert shp_1042.status == "AT_RISK"
        
        # Test status update
        updated = ShipmentRepository.update_status(db, "SHP-1042", "REROUTED", "Mumbai → Mundra → Frankfurt", 25)
        assert updated.status == "REROUTED"
        assert updated.risk == 25
    finally:
        db.close()

def test_disruption_repository(client):
    db = SessionLocal()
    try:
        disruptions = DisruptionRepository.get_all(db)
        assert len(disruptions) >= 4
        
        mumbai_strike = DisruptionRepository.get_by_id(db, "DIS-01")
        assert mumbai_strike is not None
        assert "Mumbai" in mumbai_strike.title
        
        affected = DisruptionRepository.get_affected_shipments(db, mumbai_strike)
        assert len(affected) >= 1
    finally:
        db.close()

def test_fleet_repository(client):
    db = SessionLocal()
    try:
        idle_assets = FleetRepository.get_idle_assets(db)
        assert len(idle_assets) >= 1
        
        trk_204 = FleetRepository.get_by_id(db, "TRK-204")
        assert trk_204 is not None
        
        redeployed = FleetRepository.redeploy(db, "TRK-204", "SHP-1042")
        assert redeployed.status == "ASSIGNED"
        assert redeployed.utilisation_pct == 54.2
    finally:
        db.close()

def test_cold_chain_repository(client):
    db = SessionLocal()
    try:
        containers = ColdChainRepository.get_all_containers(db)
        assert len(containers) >= 3
        
        hubs = ColdChainRepository.get_all_hubs(db)
        assert len(hubs) >= 4
        
        alerts = ColdChainRepository.get_all_alerts(db)
        assert len(alerts) >= 1
        
        # Test excursion resolution
        resolved = ColdChainRepository.resolve_container_excursion(db, "CTN-8801", 5.2)
        assert resolved is True
        
        ctn = ColdChainRepository.get_container_by_id(db, "CTN-8801")
        assert ctn.status == "NORMAL"
        assert ctn.current_temperature == 5.2
    finally:
        db.close()

def test_recommendation_repository(client):
    db = SessionLocal()
    try:
        recs = RecommendationRepository.get_all(db)
        assert len(recs) >= 4
        
        actioned = RecommendationRepository.execute_action(db, "a1", accept=True)
        assert actioned is not None
        assert actioned.actioned is True
        assert actioned.action_type == "ACCEPTED"
    finally:
        db.close()

def test_simulation_repository(client):
    db = SessionLocal()
    try:
        sim = SimulationRepository.save_run(
            db=db,
            disruption_id="DIS-01",
            disruption_type="Mumbai Port Strike",
            duration_hours=72,
            severity="CRITICAL",
            before_delay=72,
            after_delay=44,
            delay_reduction=28,
            exposure_before="$1.25M",
            exposure_after="$450K",
            critical_shipments_protected=3,
            confidence=94,
            comparison_data={"status": "ok"}
        )
        assert sim.id is not None
        assert sim.delay_reduction == 28
        
        latest = SimulationRepository.get_latest_runs(db)
        assert len(latest) >= 1
    finally:
        db.close()
