def test_fleet_utilisation(client):
    response = client.get("/api/fleet/utilisation")
    assert response.status_code == 200
    data = response.json()
    assert data["total_assets"] >= 100
    assert data["overall_utilisation_pct"] > 60.0
    assert len(data["by_asset_type"]) == 3

def test_idle_redeployment_opportunities(client):
    response = client.get("/api/fleet/idle")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    trk_204 = next((o for o in data if o["asset"] == "TRK-204"), None)
    assert trk_204 is not None
    assert trk_204["location"] == "Mumbai"
    assert trk_204["from_util"] == "18.5%"
    assert trk_204["to_util"] == "54.2%"
    assert trk_204["shipment"] == "SHP-1042"

def test_redeploy_asset_action(client):
    response = client.post("/api/fleet/TRK-204/redeploy", json={"target_shipment_id": "SHP-1042"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "ASSIGNED"
    assert data["utilisation_pct"] == "54.2%"
