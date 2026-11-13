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


def test_datasets_empty_by_default(client):
    response = client.get("/api/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert isinstance(datasets, list)
    # Datasets are empty until ingested in Phase 4
    assert len(datasets) == 0


def test_unimplemented_endpoint_returns_501(client):
    response = client.get("/api/regions")
    assert response.status_code == 501
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "HTTP_501"

