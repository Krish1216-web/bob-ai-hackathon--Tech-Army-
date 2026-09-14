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
