def test_what_if_mumbai_simulation(client):
    payload = {
        "disruption_type": "Mumbai Port Strike",
        "duration_hours": 72,
        "severity": "Critical",
        "affected_route": "Mumbai → Frankfurt",
        "cargo_type": "Vaccines"
    }
    response = client.post("/api/simulations/disruption", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["delay_avoided_hours"] == 28
    assert data["exposure_reduction"] == "$800K"
    assert data["critical_shipments_protected"] == 2
    assert "Mundra" in data["watsonx_explanation"]
    assert len(data["comparison_data"]) == 3
    assert len(data["projected_route"]) == 3
