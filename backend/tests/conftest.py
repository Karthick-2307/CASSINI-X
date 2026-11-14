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

