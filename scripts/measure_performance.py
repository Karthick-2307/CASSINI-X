"""
ASTRA-X Performance Benchmark & Profiling Script
==============================================
Measures wall-clock latency across critical analysis pipelines,
raster sampling endpoints, A* pathfinding, and report compilation.
"""

import sys
import time
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

def profile_endpoint(client, name, method, url, payload=None, iterations=5):
    latencies = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        if method == "GET":
            res = client.get(url)
        else:
            res = client.post(url, json=payload)
        t1 = time.perf_counter()
        assert res.status_code == 200, f"Call failed for {name}: {res.status_code}"
        latencies.append((t1 - t0) * 1000.0)

    avg_ms = sum(latencies) / len(latencies)
    min_ms = min(latencies)
    max_ms = max(latencies)
    print(f"| {name:<35} | {avg_ms:8.2f} ms | {min_ms:8.2f} ms | {max_ms:8.2f} ms |")
    return avg_ms

def run_performance_benchmarks():
    client = TestClient(app)

    print("=" * 75)
    print("ASTRA-X PERFORMANCE PROFILING REPORT")
    print("=" * 75)
    print(f"| {'Operation / Endpoint':<35} | {'Mean (ms)':<11} | {'Min (ms)':<11} | {'Max (ms)':<11} |")
    print("|" + "-" * 37 + "|" + "-" * 13 + "|" + "-" * 13 + "|" + "-" * 13 + "|")

    # 1. Health
    profile_endpoint(client, "System Health Check", "GET", "/api/health")

    # 2. Regions list
    profile_endpoint(client, "Planetary Regions Catalog", "GET", "/api/regions")

    # 3. Terrain Summary
    profile_endpoint(client, "Terrain Summary (Jezero DEM)", "GET", "/api/terrain/2")

    # 4. Raster Bounds
    profile_endpoint(client, "Terrain Bounds & Resolution", "GET", "/api/terrain/2/bounds")

    # 5. Hillshade PNG (Cold vs Cached)
    profile_endpoint(client, "Hillshade PNG Rendering", "GET", "/api/terrain/2/hillshade.png")

    # 6. Raster Bounding-Box Sampling
    sample_bbox = {
        "min_lon": 77.40,
        "min_lat": 18.25,
        "max_lon": 77.75,
        "max_lat": 18.55,
        "region_id": 2
    }
    profile_endpoint(client, "BBox Sampling (DEM Grid)", "POST", "/api/terrain/sample-bbox", sample_bbox)

    # 7. Similarity Analysis Run
    analysis_payload = {
        "target_region_id": 2,
        "candidate_region_ids": [1],
        "weights": {"elevation_relative": 0.33, "slope_deg": 0.33, "roughness_m": 0.34}
    }
    profile_endpoint(client, "ML Similarity Pipeline", "POST", "/api/analysis/run", analysis_payload, iterations=3)

    # 8. Landing Screening
    screening_payload = {
        "region_id": 2,
        "max_slope_deg": 10.0,
        "max_roughness_m": 5.0
    }
    profile_endpoint(client, "Landing-Region Screening", "POST", "/api/mission/screening", screening_payload)

    # 9. A* Rover Pathfinding
    route_payload = {
        "region_id": 2,
        "start_coords": [77.45, 18.30],
        "goal_coords": [77.65, 18.45],
        "optimization_mode": "balanced"
    }
    profile_endpoint(client, "A* Rover Pathfinding (Grid)", "POST", "/api/mission/route", route_payload, iterations=3)

    # 10. Scientific PDF Report Generation
    rep_payload = {
        "analysis_id": 1,
        "candidate_ids": [1, 2],
        "title": "Performance Test Scientific Dossier"
    }
    profile_endpoint(client, "PDF Dossier Compilation", "POST", "/api/reports/generate", rep_payload, iterations=2)

    print("=" * 75)

if __name__ == "__main__":
    run_performance_benchmarks()
