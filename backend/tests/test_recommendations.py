def test_list_and_action_recommendation(client):
    # 1. List recommendations including actioned
    response = client.get("/api/recommendations?include_actioned=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

    # 2. Action recommendation a2 (Reroute SHP-1051)
    act_resp = client.post("/api/recommendations/a2/action", json={"accept": True})
    assert act_resp.status_code == 200
    act_data = act_resp.json()
    assert act_data["success"] is True
    assert act_data["actioned"] is True
    assert act_data["updated_shipment_status"] == "REROUTED"

    # 3. Verify shipment status was updated in database
    shp_resp = client.get("/api/shipments/SHP-1051")
    assert shp_resp.status_code == 200
    shp_data = shp_resp.json()
    assert shp_data["status"] == "REROUTED"
