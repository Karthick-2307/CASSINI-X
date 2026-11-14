import pytest


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "demo_mode" in data
    assert isinstance(data["demo_mode"], bool)


def test_planets_endpoint(client):
    response = client.get("/api/planets")
    assert response.status_code == 200
    planets = response.json()
    assert len(planets) == 3

    planet_names = {p["name"]: p for p in planets}
    assert "Earth" in planet_names
    assert "Moon" in planet_names
    assert "Mars" in planet_names

    # Verify factual values (scientific honesty rules)
    assert planet_names["Earth"]["mean_radius_m"] == 6371008.8
    assert planet_names["Earth"]["gravity_ms2"] == 9.80665

    assert planet_names["Moon"]["mean_radius_m"] == 1737400.0
    assert planet_names["Moon"]["gravity_ms2"] == 1.62

    assert planet_names["Mars"]["mean_radius_m"] == 3389500.0
    assert planet_names["Mars"]["gravity_ms2"] == 3.71


def test_datasets_catalog(client):
    response = client.get("/api/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert isinstance(datasets, list)
    assert len(datasets) >= 3

    dataset_names = [d["name"] for d in datasets]
    assert any("SRTM" in name for name in dataset_names)
    assert any("MOLA" in name for name in dataset_names)
    assert any("LOLA" in name for name in dataset_names)


def test_regions_endpoints(client):
    response = client.get("/api/regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 3

    first_region = regions[0]
    region_id = first_region["id"]

    # Verify single region endpoint
    single_res = client.get(f"/api/regions/{region_id}")
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert single_data["name"] == first_region["name"]
    assert "lat" in single_data
    assert "lon" in single_data
    assert single_data["is_curated"] is True


def test_terrain_summary_endpoint(client):
    regions_res = client.get("/api/regions")
    regions = regions_res.json()
    assert len(regions) > 0

    first_id = regions[0]["id"]
    terrain_res = client.get(f"/api/terrain/{first_id}")
    assert terrain_res.status_code == 200
    data = terrain_res.json()

    assert data["region_id"] == first_id
    assert data["scale_m"] == 500.0
    assert data["window_px"] == 5
    assert data["valid_cells"] > 0
    assert data["coverage_fraction"] > 0.0
    assert data["slope_deg_mean"] is not None
    assert data["roughness_m_mean"] is not None
    assert data["dataset_provenance"] is not None
    assert "source" in data["dataset_provenance"]


def test_dashboard_summary_with_real_data(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()

    # Verify real data counts
    assert data["processed_locations"] >= 1
    assert data["planetary_regions"] >= 2
    assert data["datasets_ingested"] >= 3
    assert len(data["data_coverage"]) >= 3
    assert isinstance(data["demo_mode"], bool)


def test_unimplemented_endpoint_returns_501(client):
    response = client.get("/api/reports/download/999")
    assert response.status_code == 501
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "HTTP_501"


def test_analysis_run_and_detail_schema(client):
    run_payload = {
        "target_region_id": 2,
        "features": ["elevation_relative", "slope_deg", "roughness_m"],
        "threshold": 0.0,
        "top_k": 5
    }

    run_res = client.post("/api/analysis/run", json=run_payload)
    assert run_res.status_code == 200, run_res.text
    run_data = run_res.json()
    assert "analysis_id" in run_data
    assert run_data["status"] == "completed"

    analysis_id = run_data["analysis_id"]

    # Retrieve analysis detail
    detail_res = client.get(f"/api/analysis/{analysis_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()

    assert data["id"] == analysis_id
    assert data["target_region_id"] == 2
    assert "Jezero" in data["target_region_name"]
    assert data["planet"] == "Mars"
    assert data["status"] == "completed"
    assert data["candidate_count"] > 0
    assert len(data["candidates"]) > 0

    first_cand = data["candidates"][0]
    assert "similarity" in first_cand
    assert "confidence" in first_cand
    assert "mission_suitability" in first_cand
    assert first_cand["mission_suitability"] is None
    assert 0.0 <= first_cand["similarity"] <= 100.0
    assert 0.0 <= first_cand["confidence"] <= 100.0
    assert "confidence_components" in first_cand
    assert "feature_comparison" in first_cand
    assert "explanation" in first_cand
    assert data["scaler_params"] is not None
    assert data["clustering_info"] is not None


def test_analogs_list_and_detail(client):
    analogs_res = client.get("/api/analogs?planet=Mars&limit=10")
    assert analogs_res.status_code == 200
    analogs = analogs_res.json()
    assert len(analogs) > 0

    first_analog = analogs[0]
    analog_id = first_analog["id"]
    assert first_analog["mission_suitability"] is None

    single_res = client.get(f"/api/analogs/{analog_id}")
    assert single_res.status_code == 200
    single = single_res.json()
    assert single["id"] == analog_id
    assert single["similarity"] == first_analog["similarity"]
    assert single["mission_suitability"] is None


def test_analysis_input_validations(client):
    res_404 = client.post("/api/analysis/run", json={"target_region_id": 99999})
    assert res_404.status_code == 404

    res_topk = client.post("/api/analysis/run", json={"target_region_id": 2, "top_k": 0})
    assert res_topk.status_code == 422

    res_thresh = client.post("/api/analysis/run", json={"target_region_id": 2, "threshold": 150.0})
    assert res_thresh.status_code == 422

    res_feat = client.post(
        "/api/analysis/run",
        json={"target_region_id": 2, "features": ["invented_feature_xyz"]}
    )
    assert res_feat.status_code == 422


def test_benchmark_validation_endpoint(client):
    val_res = client.post("/api/benchmarks/validation")
    assert val_res.status_code == 200
    val_data = val_res.json()

    assert "model_name" in val_data
    assert "metrics_summary" in val_data
    assert "statistical_power_note" in val_data
    assert isinstance(val_data["benchmark_evaluations"], list)
    assert "model" in val_data["metrics_summary"]
    assert "baseline_slope" in val_data["metrics_summary"]


def test_terrain_bounds_endpoint(client):
    res = client.get("/api/terrain/2/bounds")
    assert res.status_code == 200
    data = res.json()
    assert data["region_id"] == 2
    assert "Jezero" in data["name"]
    assert data["planet"] == "Mars"
    assert len(data["bbox"]) == 4
    assert len(data["coordinates"]) == 4
    assert len(data["center"]) == 2


def test_terrain_overlay_png_endpoints(client):
    hs_res = client.get("/api/terrain/2/hillshade.png")
    assert hs_res.status_code == 200
    assert hs_res.headers["content-type"] == "image/png"
    assert len(hs_res.content) > 1000

    slope_res = client.get("/api/terrain/2/slope.png")
    assert slope_res.status_code == 200
    assert slope_res.headers["content-type"] == "image/png"
    assert len(slope_res.content) > 1000


def test_sample_bbox_endpoint(client):
    inside_res = client.post("/api/terrain/sample-bbox", json={
        "min_lon": 77.2,
        "min_lat": 18.0,
        "max_lon": 77.8,
        "max_lat": 18.5,
        "region_id": 2
    })
    assert inside_res.status_code == 200
    inside_data = inside_res.json()
    assert inside_data["status"] == "ok"
    assert inside_data["cell_count"] > 0
    assert inside_data["elevation_relative"] is not None
    assert inside_data["slope_deg"] is not None
    assert inside_data["roughness_m"] is not None

    outside_res = client.post("/api/terrain/sample-bbox", json={
        "min_lon": 10.0,
        "min_lat": -50.0,
        "max_lon": 12.0,
        "max_lat": -48.0,
        "region_id": 2
    })
    assert outside_res.status_code == 200
    outside_data = outside_res.json()
    assert outside_data["status"] == "outside_coverage"
    assert outside_data["cell_count"] == 0
    assert "outside ingested dataset coverage" in outside_data["message"]


def test_gazetteer_search_endpoint(client):
    # 1. Search all features
    res_all = client.get("/api/gazetteer/search")
    assert res_all.status_code == 200
    all_items = res_all.json()
    assert len(all_items) >= 10

    # 2. Filter by planet Mars
    res_mars = client.get("/api/gazetteer/search?planet=Mars")
    assert res_mars.status_code == 200
    mars_items = res_mars.json()
    assert len(mars_items) >= 4
    assert all(item["planet"] == "Mars" for item in mars_items)

    # 3. Search by term "Olympus"
    res_olympus = client.get("/api/gazetteer/search?query=Olympus")
    assert res_olympus.status_code == 200
    olympus_items = res_olympus.json()
    assert len(olympus_items) >= 1
    assert "Olympus" in olympus_items[0]["name"]
    assert olympus_items[0]["is_ingested"] is True


def test_gazetteer_activate_endpoint(client):
    # Activate Gale crater (initially not ingested)
    res_activate = client.post("/api/gazetteer/activate/mars-gale")
    assert res_activate.status_code == 200
    item = res_activate.json()
    assert item["is_ingested"] is True
    assert item["region_id"] is not None
    assert "Gale" in item["name"]

    # Verify region exists and has terrain cells
    reg_res = client.get(f"/api/regions/{item['region_id']}")
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "Gale" in reg_data["name"]


