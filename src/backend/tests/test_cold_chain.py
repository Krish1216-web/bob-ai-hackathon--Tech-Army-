from app.services.anomaly_service import ColdChainAnomalyDetector

def test_anomaly_detector_bounds():
    detector = ColdChainAnomalyDetector()
    # Impossible temperature
    res = detector.inspect_reading("CTN-TEST", 500.0, "vaccines")
    assert res.is_anomaly is True
    assert res.layer == "L1_BOUNDS"

    # Valid reading
    res2 = detector.inspect_reading("CTN-TEST-2", 4.5, "vaccines")
    assert res2.is_anomaly is False

def test_anomaly_detector_rate_of_change():
    detector = ColdChainAnomalyDetector()
    detector.inspect_reading("CTN-RATE", 4.0, "vaccines")
    # Sudden 15C spike in 1 interval
    res = detector.inspect_reading("CTN-RATE", 19.0, "vaccines")
    assert res.is_anomaly is True
    assert res.layer == "L2_RATE"

def test_cold_chain_summary_and_alerts(client):
    response = client.get("/api/cold-chain/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["compliance_pct"] > 90.0
    assert len(data["alerts"]) >= 2

    ctn_8801 = next((a for a in data["alerts"] if a["container_id"] == "CTN-8801"), None)
    assert ctn_8801 is not None
    assert ctn_8801["severity"] == "CRITICAL"
    assert ctn_8801["current_temp"] == "10.3°C"
    assert ctn_8801["configured_range"] == "2–8°C"
    assert ctn_8801["duration_mins"] == 45

def test_cold_chain_map_and_action(client):
    map_res = client.get("/api/cold-chain/map")
    assert map_res.status_code == 200
    map_data = map_res.json()
    
    assert len(map_data["containers"]) >= 3
    assert len(map_data["hubs"]) >= 4
    assert len(map_data["routes"]) >= 3
    assert map_data["kpis"]["active_containers"] >= 3
    assert map_data["kpis"]["critical_count"] >= 1
    
    ctn_8801 = next((c for c in map_data["containers"] if c["id"] == "CTN-8801"), None)
    assert ctn_8801 is not None
    assert ctn_8801["status"] == "CRITICAL"
    assert ctn_8801["temp"] == "10.3°C"
    assert ctn_8801["nearest_hub"]["name"] is not None

    # Test closed loop recovery action
    act_res = client.post("/api/cold-chain/action", json={"container_id": "CTN-8801", "action_type": "DIVERT_HUB"})
    assert act_res.status_code == 200
    assert act_res.json()["success"] is True
    assert act_res.json()["status"] == "NORMAL"
    assert act_res.json()["current_temp"] == "5.2°C"

    # Verify map endpoint reflects resolved status
    map_res2 = client.get("/api/cold-chain/map")
    ctn_8801_after = next((c for c in map_res2.json()["containers"] if c["id"] == "CTN-8801"), None)
    assert ctn_8801_after["status"] == "NORMAL"
    assert ctn_8801_after["temp"] == "5.2°C"

def test_add_container_dynamically(client):
    new_ctn = {
        "container_id": "CTN-9999",
        "shipment_id": "SHP-9999",
        "product_type": "mRNA Vaccines",
        "current_location": "Mundra Port",
        "origin": "Mundra Port",
        "destination": "Delhi NCR",
        "latitude": 22.84,
        "longitude": 69.71,
        "target_min_temperature": 2.0,
        "target_max_temperature": 8.0,
        "current_temperature": 5.1,
        "cargo_value_usd": 1500000.0,
        "asset_id": "TRK-999"
    }
    res = client.post("/api/cold-chain/containers", json=new_ctn)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["container"]["id"] == "CTN-9999"

    # Verify container appears in map & containers list
    map_res = client.get("/api/cold-chain/map")
    containers = map_res.json()["containers"]
    found = next((c for c in containers if c["id"] == "CTN-9999"), None)
    assert found is not None
    assert found["temp"] == "5.1°C"

def test_five_container_bulk_onboarding(client):
    batch = [
        {"container_id": f"CTN-884{i}", "shipment_id": f"SHP-105{i}", "product_type": "Biologics", "current_location": "Hyderabad", "origin": "Hyderabad", "destination": "Bengaluru", "latitude": 17.38, "longitude": 78.48, "target_min_temperature": 2.0, "target_max_temperature": 8.0, "current_temperature": 4.5 + (i * 0.2), "cargo_value_usd": 800000.0, "asset_id": f"TRK-50{i}"}
        for i in range(2, 7) # 8842, 8843, 8844, 8845, 8846
    ]
    res = client.post("/api/cold-chain/bulk-import", json={"containers": batch})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["imported_count"] == 5

    # Verify map contains all 5 new containers
    map_res = client.get("/api/cold-chain/map")
    c_ids = [c["id"] for c in map_res.json()["containers"]]
    for i in range(2, 7):
        assert f"CTN-884{i}" in c_ids

def test_telemetry_ingest_and_simulation(client):
    # Ingest anomalous reading
    tel_res = client.post("/api/cold-chain/telemetry", json={
        "container_id": "CTN-8801",
        "temperature_c": 11.2,
        "time_label": "15:30"
    })
    assert tel_res.status_code == 200
    t_data = tel_res.json()
    assert t_data["success"] is True
    assert t_data["severity"] == "CRITICAL"

    # Simulate excursion
    sim_res = client.post("/api/cold-chain/simulate-excursion", json={
        "container_id": "CTN-8801",
        "target_temperature_c": 10.3,
        "excursion_duration_mins": 45
    })
    assert sim_res.status_code == 200
    assert sim_res.json()["success"] is True

def test_diversion_cost_benefit_modes():
    from app.engine.cold_chain_risk import evaluate_economic_diversion
    # Safety mode: 35% risk -> should divert
    res_safety = evaluate_economic_diversion(cargo_value_usd=1250000.0, spoilage_prob=0.35, mode="SAFETY")
    assert res_safety["should_divert"] is True
    assert res_safety["decision"] == "EXECUTE_DIVERSION"

    # Eco mode: 35% risk -> should not divert
    res_eco = evaluate_economic_diversion(cargo_value_usd=1250000.0, spoilage_prob=0.35, mode="ECO")
    assert res_eco["should_divert"] is False

    # Eco mode: 85% risk with high net savings -> should divert
    res_eco_high = evaluate_economic_diversion(cargo_value_usd=1250000.0, spoilage_prob=0.85, mode="ECO")
    assert res_eco_high["should_divert"] is True

def test_regulatory_audit_report(client):
    res = client.get("/api/cold-chain/audit-report/CTN-8801")
    assert res.status_code == 200
    report = res.json()
    assert "certificate_id" in report
    assert "verification_hash_sha256" in report
    assert "regulatory_standards" in report
    assert len(report["regulatory_standards"]) >= 3
    assert report["consignment"]["container_id"] == "CTN-8801"
    assert "thermal_excursion_telemetry" in report
    assert "spoilage_and_corrective_action" in report
    assert "electronic_signatures" in report


