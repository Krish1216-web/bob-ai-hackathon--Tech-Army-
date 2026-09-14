def test_get_dashboard(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["network_status"] == "AT RISK"
    assert "kpis" in data
    assert data["kpis"]["active_disruptions"]["value"] == "7"
    assert data["kpis"]["fleet_utilisation"]["value"] == "71.4%"
    assert len(data["active_disruptions"]) >= 4

def test_copilot_query(client):
    response = client.post("/api/copilot/query", json={"query": "Which shipments are at highest risk?"})
    assert response.status_code == 200
    data = response.json()
    assert "SHP-1042" in data["answer"]
    assert data["confidence"] > 0.8
    assert len(data["suggested_actions"]) > 0
