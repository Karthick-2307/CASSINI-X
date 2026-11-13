# ASTRA-X — REFERENCE APPENDIX
Save as `docs/ASTRAX_09_reference_appendix.md` in the project. The agent reads this when a part refers to it. Do not paste it as a task.

---

## A. Database tables (SQLite for MVP; keep names and fields portable to PostGIS)
Store geometry as `lat`/`lon` columns and, for polygons, a `geometry_geojson` text column. Add timestamps (`created_at`) to every table.

| Table | Key fields |
|---|---|
| `users` | Only if authentication is added later. Not needed for MVP. |
| `planets` | id, name, mean_radius_m, gravity_ms2, notes |
| `planetary_regions` | id, planet_id, name, kind (reference / search_area), center_lat, center_lon, bbox (min_lat, min_lon, max_lat, max_lon), geometry_geojson, is_curated, citation, notes |
| `earth_candidates` | id, search_area_id, lat, lon, cell_size_m, valid_fraction, cluster_id, is_anomaly |
| `datasets` | id, name, planet_id, source_name, source_url, licence, native_resolution_m, crs, vertical_unit, version_or_date, acquisition_note, processing_notes, local_path, valid_fraction, status (planned / ingested / not_ingested / needs_credentials), ingested_at |
| `extracted_features` | id, region_or_candidate_ref, dataset_id, feature_name, value, unit, kind (measured / derived / inferred), window_px, analysis_res_m, params_json |
| `analyses` | id, target_region_id, params_json (features, weights, threshold, top_k), scaling_params_json, status, error_message, created_at, finished_at |
| `analysis_results` (candidate rankings) | id, analysis_id, candidate_id, rank, similarity, confidence, confidence_components_json, mission_suitability (nullable), feature_comparison_json, explanation_json, dataset_refs_json |
| `mission_routes` | id, region_id, start_lat, start_lon, goal_lat, goal_lon, mode, max_slope_deg, path_geojson, length_m, ascent_m, descent_m, max_slope, mean_slope, difficulty, status |
| `reports` | id, analysis_id, file_path, title, created_at |

## B. REST endpoints
| Method and path | Purpose | Introduced |
|---|---|---|
| `GET /api/health` | status, demo flag | Part 1 |
| `GET /api/planets` | list bodies | Part 1 |
| `GET /api/datasets` | datasets with provenance | Part 1/4 |
| `GET /api/dashboard/summary` | real counts | Part 3 |
| `GET /api/regions`, `GET /api/regions/{id}` | regions | Part 4 |
| `GET /api/terrain/{region_id}` | terrain feature summary | Part 4 |
| `POST /api/analysis/run` | start analysis | Part 5 |
| `GET /api/analysis/{id}` | status and results | Part 5 |
| `GET /api/analogs`, `GET /api/analogs/{id}` | candidates | Part 5 |
| `GET /api/resources/{region_id}` | evidence items | Part 7A |
| `POST /api/mission/route` | A* routes | Part 7B |
| `POST /api/reports/generate`, `GET /api/reports` | PDF reports | Part 7C |
| Assistant endpoint (`POST /api/assistant/ask` or `/api/assistant/query`) | grounded answers | Part 7D |

Common rules: Pydantic validation, consistent error format `{ "error": { "code", "message" } }`, logging, auto docs at `/docs`. Endpoints for later parts return HTTP 501 with a clear message until implemented.

## C. API response rule for candidate results
Three separate top-level fields, never merged:
```json
{
  "similarity": 0-100,
  "confidence": { "value": 0-100, "components": { ... } },
  "mission_suitability": null | { "criteria": [...], "summary": "screening only" }
}
```

## D. Curated benchmark list (hand-curated, to be verified)
Coordinates and pairings are approximate starting points. The agent must record a citation for each entry, flag unverified ones, and label the whole list "hand-curated benchmark, small sample". Do not treat it as ground truth.

**Mars-analog Earth areas (candidates for validation):** Atacama Desert (Chile), Haughton crater / Devon Island (Canada), Mojave Desert (USA), Antarctic Dry Valleys, Iceland highlands, Utah desert near the Mars Desert Research Station, Danakil Depression (Ethiopia), Rio Tinto (Spain).

**Moon-analog Earth areas:** San Francisco Volcanic Field (Arizona), Craters of the Moon (Idaho), Mauna Kea / Mauna Loa (Hawaii), Meteor Crater (Arizona), Iceland lava fields.

**Reference regions (Mars / Moon):** choose small, well-known, well-covered areas (for example a region in Gale crater or Jezero crater on Mars; a region near the Apollo 17 or Shackleton area on the Moon) after checking dataset coverage. Record the exact bounds used.

Rules for the benchmark list: say plainly that analog status comes from published literature, store the citation, and keep it in a separate table or JSON file that validation reads.

## E. Study area sizes (defaults, configurable)
- Reference regions: about 50 x 50 km
- Earth search areas: about 200 x 200 km
- Analysis resolution: 500 m, window 5 x 5 pixels (about 2.5 km cells)

## F. Terminology for badges
- **Measured**: read directly from a dataset
- **Derived**: computed by ASTRA-X from measured data (slope, roughness, scores)
- **Inferred**: an interpretation or possibility (resource potential, analog claims)
- **Demo**: demo mode data only
- **Unavailable**: dataset not ingested or not accessible

## G. Standard disclaimers (reuse verbatim)
1. "Comparable on the selected features only. This does not mean the locations are identical."
2. "Preliminary screening for scientific decision support. Not certified landing or habitation safety."
3. "Similarity, confidence and mission suitability are separate measures."
4. "Weights and the similarity transform are exploratory and have not been calibrated beyond the documented validation."
