import pytest


def test_analyses_list_endpoint(client):
    res = client.get("/api/analyses")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "target_region_name" in first
        assert "planet" in first
        assert "candidate_count" in first


def test_geology_resources_endpoint(client):
    res = client.get("/api/resources/2")
    assert res.status_code == 200
    data = res.json()
    assert data["region_id"] == 2
    assert "Jezero" in data["region_name"]
    assert data["status"] == "no_data_ingested"
    assert data["water_ice_status"] == "No water-ice dataset ingested"
    assert len(data["observed_evidence"]) == 0
    assert len(data["derived_indices"]) == 0
    assert len(data["inferred_resources"]) == 0
    assert data["available_provider"] is not None
    assert "CRISM" in data["available_provider"]["instrument"]
    assert data["ingest_instructions"] is not None


def test_geology_resources_compare_endpoint(client):
    res = client.post("/api/resources/compare", json={"region_a_id": 1, "region_b_id": 2})
    assert res.status_code == 200
    data = res.json()
    assert "harmonisation_warning" in data
    assert "spectral resampling" in data["harmonisation_warning"]


def test_landing_screening_endpoint(client):
    res = client.post("/api/mission/screening", json={
        "region_id": 2,
        "max_slope_deg": 10.0,
        "max_roughness_m": 5.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["region_id"] == 2
    assert data["total_cells"] > 0
    assert "mission_suitability_score" in data
    assert 0.0 <= data["mission_suitability_score"] <= 100.0
    assert "criteria_breakdown" in data
    assert "slope_pass_count" in data["criteria_breakdown"]
    assert "environmental_factors" in data
    assert "Not assessed" in data["environmental_factors"]["radiation"]
    assert "Preliminary screening" in data["disclaimer_banner"]


def test_rover_pathfinding_endpoint(client):
    res = client.post("/api/mission/route", json={
        "region_id": 2,
        "start_coords": [77.3, 18.2],
        "goal_coords": [77.5, 18.4],
        "optimization_mode": "balanced",
        "max_slope_deg": 25.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("success", "unreachable")
    if data["status"] == "success":
        assert len(data["routes"]) > 0
        first_route = data["routes"][0]
        assert first_route["length_m"] > 0
        assert len(first_route["coordinates"]) > 0
        assert len(first_route["elevation_profile"]) > 0
        assert "difficulty_score" in first_route


def test_report_generation_and_download_endpoints(client):
    run_res = client.post("/api/analysis/run", json={"target_region_id": 2, "top_k": 3})
    analysis_id = run_res.json()["analysis_id"]

    gen_res = client.post("/api/reports/generate", json={
        "analysis_id": analysis_id,
        "title": "Automated Unit Test Evaluation Report"
    })
    assert gen_res.status_code == 200
    report_data = gen_res.json()
    assert "id" in report_data
    assert report_data["file_size_bytes"] > 1000

    report_id = report_data["id"]

    dl_res = client.get(f"/api/reports/{report_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert dl_res.content[:4] == b"%PDF"


def test_scientific_assistant_endpoint(client):
    res_summary = client.post("/api/assistant/query", json={
        "query": "summarise the top candidates"
    })
    assert res_summary.status_code == 200
    data_sum = res_summary.json()
    assert "Top Analog Candidates" in data_sum["answer"]
    assert len(data_sum["sources"]) > 0

    res_lim = client.post("/api/assistant/query", json={
        "query": "what are the dataset limitations and uncertainties?"
    })
    assert res_lim.status_code == 200
    data_lim = res_lim.json()
    assert "Spatial Resolution Mismatch" in data_lim["answer"]

    res_data = client.post("/api/assistant/query", json={
        "query": "what data is available?"
    })
    assert res_data.status_code == 200
    assert "SRTM" in res_data.json()["answer"]

    res_unknown = client.post("/api/assistant/query", json={
        "query": "who won the 1994 world cup?"
    })
    assert res_unknown.status_code == 200
    assert "Scientific Assistant" in res_unknown.json()["answer"]

    res_ask = client.post("/api/assistant/ask", json={
        "query": "summarise the top candidates"
    })
    assert res_ask.status_code == 200
    assert "Top Analog Candidates" in res_ask.json()["answer"]


def test_api_404_not_found_handling(client):
    res = client.get("/api/regions/999999")
    assert res.status_code == 404
    assert "not found" in str(res.json()).lower()

    res = client.get("/api/terrain/999999/bounds")
    assert res.status_code == 404

    res = client.get("/api/analysis/999999")
    assert res.status_code == 404

    res = client.get("/api/analogs/999999")
    assert res.status_code == 404

    res = client.get("/api/reports/999999/download")
    assert res.status_code == 404


def test_api_422_validation_error_handling(client):
    res = client.post("/api/terrain/sample-bbox", json={"min_lon": "not_a_number"})
    assert res.status_code == 422

    res = client.post("/api/analysis/run", json={})
    assert res.status_code == 422

    res = client.post("/api/mission/screening", json={})
    assert res.status_code == 422

    res = client.post("/api/mission/route", json={"region_id": 1})
    assert res.status_code == 422

    res = client.post("/api/reports/generate", json={})
    assert res.status_code == 422

    res = client.post("/api/assistant/query", json={})
    assert res.status_code == 422


def test_api_unavailable_and_boundary_data_handling(client):
    res = client.post("/api/terrain/sample-bbox", json={
        "min_lon": 170.0,
        "min_lat": -80.0,
        "max_lon": 171.0,
        "max_lat": -79.0,
        "region_id": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "outside_coverage"
    assert "outside" in data["message"].lower()

    res_route = client.post("/api/mission/route", json={
        "region_id": 1,
        "start_coords": [-13.63, 29.03],
        "goal_coords": [100.0, -80.0],
        "optimization_mode": "balanced"
    })
    assert res_route.status_code == 200
    data_route = res_route.json()
    assert data_route["status"] == "unreachable"
    assert "no traversable path" in data_route["message"].lower()

