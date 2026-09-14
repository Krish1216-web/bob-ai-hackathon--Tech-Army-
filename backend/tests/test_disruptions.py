def test_list_disruptions(client):
    response = client.get("/api/disruptions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    titles = [d["title"] for d in data]
    assert "Mumbai Port Strike" in titles

def test_mumbai_port_strike_impact(client):
    response = client.get("/api/disruptions/DIS-01/impact")
    assert response.status_code == 200
    data = response.json()
    assert data["disruption"]["title"] == "Mumbai Port Strike"
    assert data["disruption"]["severity"] == "CRITICAL"
    assert data["delay_reduction_possible_hours"] == 28
    assert data["recommended_route"] == "Mundra → Frankfurt"
    assert data["recommended_carrier"] == "Carrier B"
    assert len(data["affected_shipments"]) > 0

    shp_1042 = next((s for s in data["affected_shipments"] if s["id"] == "SHP-1042"), None)
    assert shp_1042 is not None
    assert shp_1042["cargo"] == "Vaccines"
    assert shp_1042["value"] == "$1.25M"
    assert shp_1042["risk"] >= 20
