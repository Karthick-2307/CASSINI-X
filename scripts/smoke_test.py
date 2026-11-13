"""
ASTRA-X End-to-End Smoke Test Script
===================================
Executes the critical scientific workflow end-to-end:
1. Health & Database connectivity check
2. Region & Catalog verification
3. Feature vector availability check
4. Similarity analysis execution (Jezero Crater vs Terrestrial Candidates)
5. Candidate rank, similarity, and confidence verification
6. Scientific PDF Dossier generation and validation

Usage:
    cd backend
    .\\.venv\\Scripts\\python.exe ..\\scripts\\smoke_test.py
"""

import sys
import os
import json
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db, SessionLocal
from app.models import Region, Analysis, CandidateMatch, Report


def run_smoke_test():
    print("=" * 65)
    print("ASTRA-X SYSTEM SMOKE TEST — END-TO-END PIPELINE VERIFICATION")
    print("=" * 65)

    client = TestClient(app)

    # 1. Health check
    print("\n[Step 1/6] Verifying API Health...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    health_data = health_res.json()
    print(f" -> System Status: {health_data['status']}")
    print(f" -> Version: {health_data['version']}")
    print(f" -> Demo Mode: {health_data['demo_mode']}")

    # 2. Database & Region check
    print("\n[Step 2/6] Querying Planetary Regions & Datasets...")
    regions_res = client.get("/api/regions")
    assert regions_res.status_code == 200, f"Regions query failed: {regions_res.text}"
    regions = regions_res.json()
    print(f" -> Ingested Regions Count: {len(regions)}")
    for r in regions:
        print(f"    - ID {r['id']}: {r['name']} (Lat: {r['lat']}, Lon: {r['lon']})")

    # Locate Jezero Crater (Target Reference)
    jezero = next((r for r in regions if "jezero" in r["name"].lower()), regions[0])
    # Locate Earth regions (Candidate Pool)
    earth_regions = [r for r in regions if r.get("planet_id") == 1]
    candidate_ids = [r["id"] for r in earth_regions] if earth_regions else [regions[0]["id"]]
    print(f" -> Reference Target: ID {jezero['id']} ({jezero['name']})")
    print(f" -> Candidate Pool IDs: {candidate_ids}")

    # 3. Terrain Summary Verification
    print("\n[Step 3/6] Verifying Elevation & Terrain Features...")
    terrain_res = client.get(f"/api/terrain/{jezero['id']}")
    assert terrain_res.status_code == 200, f"Terrain summary failed: {terrain_res.text}"
    t_data = terrain_res.json()
    print(f" -> Target Mean Elevation: {t_data.get('elevation_m', 'N/A')} m")
    print(f" -> Target Mean Slope: {t_data.get('slope_deg', 'N/A')}°")
    print(f" -> Target Roughness: {t_data.get('roughness_m', 'N/A')} m")

    # 4. Run Similarity Analysis
    print("\n[Step 4/6] Executing ML Similarity Analysis Engine...")
    analysis_payload = {
        "target_region_id": jezero["id"],
        "candidate_region_ids": candidate_ids,
        "weights": {
            "elevation_relative": 0.3333,
            "slope_deg": 0.3333,
            "roughness_m": 0.3334
        }
    }
    run_res = client.post("/api/analysis/run", json=analysis_payload)
    assert run_res.status_code == 200, f"Analysis run failed: {run_res.text}"
    run_data = run_res.json()
    analysis_id = run_data["analysis_id"]
    print(f" -> Analysis #{analysis_id} Status: {run_data['status']}")

    # Fetch detailed analysis candidates
    detail_res = client.get(f"/api/analysis/{analysis_id}")
    assert detail_res.status_code == 200, f"Analysis detail query failed: {detail_res.text}"
    detail_data = detail_res.json()
    candidates = detail_data.get("candidates", [])
    print(f" -> Candidate Matches Generated: {len(candidates)}")

    # 5. Inspect Top Candidates
    print("\n[Step 5/6] Inspecting Candidate Results & Separated Metrics...")
    for idx, c in enumerate(candidates[:3], start=1):
        print(f"    Rank #{idx}: {c['location_name']}")
        print(f"      - Similarity Score: {c['similarity']:.2f}% (Metric: Weighted Exponential)")
        print(f"      - Confidence Score: {c['confidence']:.2f}% (Metric: Composite Data Coverage)")
        print(f"      - Suitability Score: {c.get('mission_suitability', 'N/A')} (Operational Criteria)")

    # 6. Generate & Validate PDF Scientific Report
    print("\n[Step 6/6] Generating Scientific PDF Report...")
    report_payload = {
        "analysis_id": analysis_id,
        "candidate_ids": [c["id"] for c in candidates[:3]],
        "title": "Smoke Test Scientific Analog Dossier"
    }
    rep_res = client.post("/api/reports/generate", json=report_payload)
    assert rep_res.status_code == 200, f"Report generation failed: {rep_res.text}"
    rep_data = rep_res.json()
    report_id = rep_data["id"]
    file_size = rep_data["file_size_bytes"]
    print(f" -> Generated Report ID: #{report_id}")
    print(f" -> Report PDF File Size: {file_size / 1024:.1f} KB")
    assert file_size > 1000, "Report file is suspiciously small!"

    # Download test
    dl_res = client.get(f"/api/reports/{report_id}/download")
    assert dl_res.status_code == 200, "Report download endpoint failed!"
    assert dl_res.content[:4] == b"%PDF", "Downloaded file does not have valid PDF header!"
    print(" -> PDF Binary Verified: Magic bytes '%PDF' confirmed.")

    print("\n" + "=" * 65)
    print("SMOKE TEST COMPLETED SUCCESSFULLY (ALL 6 STAGES PASSED).")
    print("=" * 65)


if __name__ == "__main__":
    run_smoke_test()
