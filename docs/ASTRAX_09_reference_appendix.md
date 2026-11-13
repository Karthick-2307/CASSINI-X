# ASTRA-X — Reference Appendix (ASTRAX_09)

## 1. Database Tables

### `planets`
- `id` (Integer, Primary Key, autoincrement)
- `name` (String, unique, indexed) - e.g. "Earth", "Moon", "Mars"
- `mean_radius_m` (Float) - Mean radius in meters (Earth: 6371008.8, Moon: 1737400.0, Mars: 3389500.0)
- `gravity_ms2` (Float) - Surface gravity in m/s² (Earth: 9.80665, Moon: 1.62, Mars: 3.71)
- `description` (Text, nullable)

### `regions`
- `id` (Integer, Primary Key, autoincrement)
- `planet_id` (Integer, ForeignKey('planets.id'), indexed)
- `name` (String, indexed)
- `lat` (Float)
- `lon` (Float)
- `geometry_geojson` (Text, nullable) - GeoJSON representation (polygon/point)
- `elevation_m` (Float, nullable)
- `slope_deg` (Float, nullable)
- `roughness_m` (Float, nullable)
- `source_dataset_id` (Integer, ForeignKey('datasets.id'), nullable)
- `description` (Text, nullable)
- `created_at` (DateTime, default utcnow)

### `datasets`
- `id` (Integer, Primary Key, autoincrement)
- `planet_id` (Integer, ForeignKey('planets.id'), indexed)
- `name` (String, indexed)
- `source` (String) - e.g. "USGS", "NASA PDS", "ESA PSA", "Copernicus"
- `url` (String, nullable)
- `resolution_m` (Float, nullable)
- `units` (String, nullable)
- `acquisition_date` (String, nullable)
- `processing_steps` (Text, nullable)
- `licence` (String, nullable)
- `created_at` (DateTime, default utcnow)

### `terrain_features`
- `id` (Integer, Primary Key, autoincrement)
- `region_id` (Integer, ForeignKey('regions.id'), indexed)
- `scale_m` (Float) - Fixed spatial scale window
- `elevation_min` (Float, nullable)
- `elevation_max` (Float, nullable)
- `elevation_mean` (Float, nullable)
- `elevation_std` (Float, nullable)
- `slope_mean` (Float, nullable)
- `slope_max` (Float, nullable)
- `roughness_mean` (Float, nullable)
- `nodata_fraction` (Float, default 0.0)
- `created_at` (DateTime, default utcnow)

### `analyses`
- `id` (Integer, Primary Key, autoincrement)
- `target_region_id` (Integer, ForeignKey('regions.id'), indexed)
- `weights_json` (Text) - JSON serialization of feature weights
- `status` (String, default "pending") - "pending", "running", "completed", "failed"
- `created_at` (DateTime, default utcnow)

### `candidate_matches`
- `id` (Integer, Primary Key, autoincrement)
- `analysis_id` (Integer, ForeignKey('analyses.id'), indexed)
- `earth_region_id` (Integer, ForeignKey('regions.id'), indexed)
- `similarity_score` (Float) - 0.0 to 1.0 (Separate field!)
- `confidence_score` (Float) - 0.0 to 1.0 (Separate field!)
- `mission_suitability_score` (Float) - 0.0 to 1.0 (Separate field!)
- `score_breakdown_json` (Text) - JSON breakdown of individual metric components
- `created_at` (DateTime, default utcnow)

### `benchmark_sites`
- `id` (Integer, Primary Key, autoincrement)
- `name` (String, indexed)
- `target_region_name` (String)
- `earth_analog_name` (String)
- `planet_id` (Integer, ForeignKey('planets.id'))
- `lat` (Float)
- `lon` (Float)
- `known_analog_type` (String) - e.g. "volcanic terrain", "permafrost/ice", "hyper-arid desert"
- `description` (Text, nullable)

### `mission_profiles`
- `id` (Integer, Primary Key, autoincrement)
- `name` (String, indexed) - e.g. "Rover Traverse", "Habitation Site", "Astronaut Field Training"
- `description` (Text, nullable)
- `constraints_json` (Text) - Constraints on slope, roughness, elevation

### `reports`
- `id` (Integer, Primary Key, autoincrement)
- `analysis_id` (Integer, ForeignKey('analyses.id'), indexed)
- `title` (String)
- `file_path` (String)
- `created_at` (DateTime, default utcnow)

---

## 2. API Endpoints Map
- `GET /api/health` -> Status, version, demo_mode flag
- `GET /api/planets` -> Planetary bodies reference data
- `GET /api/datasets` -> Datasets catalog (metadata, provenance)
- `GET /api/regions` -> List available target/analog regions
- `POST /api/analyses` -> Submit new similarity calculation
- `GET /api/analyses/{id}` -> Retrieve analysis results and candidate matches
- `GET /api/benchmarks` -> Curated scientific analog benchmarks
- `GET /api/geology` -> Geological profile and classifications
- `GET /api/mission` -> Mission profiles and constraints evaluation
- `GET /api/reports` -> Generated PDF reports catalog

---

## 3. Benchmark Reference Sites
- **Devon Island (Haughton Impact Crater, Canada)**: Mars polar desert and impact geology analog.
- **Atacama Desert (Yungay, Chile)**: Hyper-arid Mars soil and dry environment analog.
- **Lanzarote (Canary Islands, Spain)**: Lunar and Martian basaltic lava tubes and volcanic terrain.
- **Mauna Kea & Mauna Loa (Hawaii, USA)**: Lunar regolith and Martian basaltic shield volcano terrain.
- **Svalbard (Norway)**: Mars permafrost, hydrothermal, and arctic terrain analog.
- **McMurdo Dry Valleys (Antarctica)**: Mars cold-arid permafrost and Antarctic desert analog.

