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
    response = client.get("/api/analyses/submit")
    assert response.status_code == 501
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "HTTP_501"
