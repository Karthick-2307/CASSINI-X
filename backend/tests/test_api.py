import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Ensure tables and factual seed data are initialized
    init_db()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


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


# --- Part 5: Analysis and Similarity API Tests ---

def test_analysis_run_and_detail_schema(client):
    """
    Test running real similarity analysis on Mars (Jezero Crater Floor & Delta, id=2)
    against the Earth candidate pool (Lanzarote Volcanic Field).
    Verifies all Part 5 Section 5.3 output fields.
    """
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
    detail = detail_res.json()

    assert detail["id"] == analysis_id
    assert detail["target_region_id"] == 2
    assert "Jezero" in detail["target_region_name"]
    assert detail["planet"] == "Mars"
    assert detail["status"] == "completed"
    assert detail["candidate_count"] > 0
    assert "scaler_params" in detail and detail["scaler_params"] is not None
    assert "target_summary" in detail and detail["target_summary"] is not None
    assert "clustering_info" in detail and detail["clustering_info"] is not None

    # Check candidates structure (strictly enforcing Section 5.3)
    for cand in detail["candidates"]:
        assert "location_name" in cand
        assert "lat" in cand and cand["lat"] is not None
        assert "lon" in cand and cand["lon"] is not None
        assert cand["target_region_id"] == 2

        # 1. Similarity (0-100)
        assert 0.0 <= cand["similarity"] <= 100.0

        # 2. Confidence (0-100) and components
        assert 0.0 <= cand["confidence"] <= 100.0
        assert cand["confidence_components"] is not None
        assert "coverage_score" in cand["confidence_components"]
        assert "resolution_score" in cand["confidence_components"]

        # 3. Mission suitability strictly null until Part 7
        assert cand["mission_suitability"] is None

        # 4. Feature comparison
        assert len(cand["feature_comparison"]) == 3
        for item in cand["feature_comparison"]:
            assert "feature" in item
            assert "unit" in item
            assert "target_value" in item
            assert "candidate_value" in item
            assert "difference" in item
            assert "contribution" in item
            assert item["kind"] in ("matching", "higher", "lower")

        # 5. Clustering and anomaly
        assert cand["cluster_id"] is not None
        assert isinstance(cand["is_anomaly"], bool)

        # 6. Dataset references
        assert isinstance(cand["dataset_references"], list)

        # 7. Explanation
        assert "explanation" in cand
        assert "similarities" in cand["explanation"]
        assert "differences" in cand["explanation"]


def test_analogs_list_and_detail(client):
    """
    Test listing candidate matches with filters and fetching candidate by id.
    """
    analogs_res = client.get("/api/analogs?planet=Mars&limit=10")
    assert analogs_res.status_code == 200
    analogs = analogs_res.json()
    assert len(analogs) > 0

    first_analog = analogs[0]
    analog_id = first_analog["id"]
    assert first_analog["mission_suitability"] is None

    # Test single analog detail endpoint
    single_res = client.get(f"/api/analogs/{analog_id}")
    assert single_res.status_code == 200
    single = single_res.json()
    assert single["id"] == analog_id
    assert single["similarity"] == first_analog["similarity"]
    assert single["mission_suitability"] is None


def test_analysis_input_validations(client):
    """
    Test clean 404 and 422 validations on invalid inputs.
    """
    # Non-existent target region -> 404
    res_404 = client.post("/api/analysis/run", json={"target_region_id": 99999})
    assert res_404.status_code == 404

    # Invalid top_k <= 0 -> 422
    res_topk = client.post("/api/analysis/run", json={"target_region_id": 2, "top_k": 0})
    assert res_topk.status_code == 422

    # Invalid threshold > 100 -> 422
    res_thresh = client.post("/api/analysis/run", json={"target_region_id": 2, "threshold": 150.0})
    assert res_thresh.status_code == 422

    # Unsupported feature name -> 422
    res_feat = client.post(
        "/api/analysis/run",
        json={"target_region_id": 2, "features": ["invented_feature_xyz"]}
    )
    assert res_feat.status_code == 422


def test_benchmark_validation_endpoint(client):
    """
    Test benchmark validation pipeline endpoint.
    """
    val_res = client.post("/api/benchmarks/validation")
    assert val_res.status_code == 200
    val_data = val_res.json()

    assert "model_name" in val_data
    assert "metrics_summary" in val_data
    assert "statistical_power_note" in val_data
    assert isinstance(val_data["benchmark_evaluations"], list)
    assert "model" in val_data["metrics_summary"]
    assert "baseline_slope" in val_data["metrics_summary"]


# --- Part 6: Explorer and Overlay API Tests ---

def test_terrain_bounds_endpoint(client):
    """
    Test retrieving exact geographic bounds and MapLibre image coordinates.
    """
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
    """
    Test generating and retrieving hillshade and slope PNG overlays.
    """
    # Hillshade overlay
    hs_res = client.get("/api/terrain/2/hillshade.png")
    assert hs_res.status_code == 200
    assert hs_res.headers["content-type"] == "image/png"
    assert len(hs_res.content) > 1000  # Non-empty PNG

    # Slope overlay
    slope_res = client.get("/api/terrain/2/slope.png")
    assert slope_res.status_code == 200
    assert slope_res.headers["content-type"] == "image/png"
    assert len(slope_res.content) > 1000


def test_sample_bbox_endpoint(client):
    """
    Test real bounding box sampling (inside coverage) and outside coverage rejection.
    """
    # 1. Inside coverage for Jezero (bounds approx 77.15 to 78.01, 17.95 to 18.81)
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

    # 2. Outside coverage rejection
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


def test_analyses_list_endpoint(client):
    """
    Test retrieving past analyses summary list.
    """
    res = client.get("/api/analyses")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "target_region_name" in first
        assert "planet" in first
        assert "candidate_count" in first


# --- Part 7: Geology, Mission, Reports, and Assistant API Tests ---

def test_geology_resources_endpoint(client):
    """
    Test 7A: Resource intelligence endpoint returning exact status and provider metadata.
    """
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
    """
    Test 7A: Surface material comparison returning harmonization warning.
    """
    res = client.post("/api/resources/compare", json={"region_a_id": 1, "region_b_id": 2})
    assert res.status_code == 200
    data = res.json()
    assert "harmonisation_warning" in data
    assert "spectral resampling" in data["harmonisation_warning"]


def test_landing_screening_endpoint(client):
    """
    Test 7B: Landing-region screening with criteria breakdown and unblended suitability score.
    """
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
    """
    Test 7B: A* rover pathfinding generating alternative routes across real DEM.
    """
    # Start and goal within Jezero DEM raster bounds
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
    """
    Test 7C: PDF report generation producing a valid, non-empty PDF file.
    """
    # Ensure an analysis exists
    run_res = client.post("/api/analysis/run", json={"target_region_id": 2, "top_k": 3})
    analysis_id = run_res.json()["analysis_id"]

    # Generate PDF
    gen_res = client.post("/api/reports/generate", json={
        "analysis_id": analysis_id,
        "title": "Automated Unit Test Evaluation Report"
    })
    assert gen_res.status_code == 200
    report_data = gen_res.json()
    assert "id" in report_data
    assert report_data["file_size_bytes"] > 1000

    report_id = report_data["id"]

    # Download PDF
    dl_res = client.get(f"/api/reports/{report_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    # PDF starts with %PDF magic bytes
    assert dl_res.content[:4] == b"%PDF"


def test_scientific_assistant_endpoint(client):
    """
    Test 7D: Scientific assistant deterministic template answers and guardrails.
    """
    # 1. Summary of top candidates
    res_summary = client.post("/api/assistant/query", json={
        "query": "summarise the top candidates"
    })
    assert res_summary.status_code == 200
    data_sum = res_summary.json()
    assert "Top Analog Candidates" in data_sum["answer"]
    assert len(data_sum["sources"]) > 0

    # 2. Dataset limitations
    res_lim = client.post("/api/assistant/query", json={
        "query": "what are the dataset limitations and uncertainties?"
    })
    assert res_lim.status_code == 200
    data_lim = res_lim.json()
    assert "Spatial Resolution Mismatch" in data_lim["answer"]

    # 3. Available data
    res_data = client.post("/api/assistant/query", json={
        "query": "what data is available?"
    })
    assert res_data.status_code == 200
    assert "SRTM" in res_data.json()["answer"]

    # 4. Unknown query prompt guidance
    res_unknown = client.post("/api/assistant/query", json={
        "query": "who won the 1994 world cup?"
    })
    assert res_unknown.status_code == 200
    assert "Scientific Assistant" in res_unknown.json()["answer"]

    # 5. Appendix B route alias: /api/assistant/ask
    res_ask = client.post("/api/assistant/ask", json={
        "query": "summarise the top candidates"
    })
    assert res_ask.status_code == 200
    assert "Top Analog Candidates" in res_ask.json()["answer"]


# --- Part 8.1: Comprehensive Error Handling (404, 422, Unavailable Data) ---

def test_api_404_not_found_handling(client):
    """
    Test 8.1: Every entity detail and download endpoint returns 404 for non-existent IDs.
    """
    # 1. Non-existent region
    res = client.get("/api/regions/999999")
    assert res.status_code == 404
    assert "not found" in str(res.json()).lower()

    # 2. Non-existent terrain bounds
    res = client.get("/api/terrain/999999/bounds")
    assert res.status_code == 404

    # 3. Non-existent analysis
    res = client.get("/api/analysis/999999")
    assert res.status_code == 404

    # 4. Non-existent analog match
    res = client.get("/api/analogs/999999")
    assert res.status_code == 404

    # 5. Non-existent report download
    res = client.get("/api/reports/999999/download")
    assert res.status_code == 404


def test_api_422_validation_error_handling(client):
    """
    Test 8.1: Endpoints reject malformed payloads with 422 Unprocessable Entity.
    """
    # 1. sample-bbox missing required fields
    res = client.post("/api/terrain/sample-bbox", json={"min_lon": "not_a_number"})
    assert res.status_code == 422

    # 2. analysis/run with empty body
    res = client.post("/api/analysis/run", json={})
    assert res.status_code == 422

    # 3. mission/screening with missing region_id
    res = client.post("/api/mission/screening", json={})
    assert res.status_code == 422

    # 4. mission/route with missing start_coords
    res = client.post("/api/mission/route", json={"region_id": 1})
    assert res.status_code == 422

    # 5. reports/generate with missing analysis_id
    res = client.post("/api/reports/generate", json={})
    assert res.status_code == 422

    # 6. assistant/query with missing query field
    res = client.post("/api/assistant/query", json={})
    assert res.status_code == 422


def test_api_unavailable_and_boundary_data_handling(client):
    """
    Test 8.1: Endpoints gracefully report unavailable data or out-of-bounds coordinates.
    """
    # 1. Sample bbox outside raster coverage
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

    # 2. Pathfinding with unreachable goal (e.g. goal outside raster coverage)
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

