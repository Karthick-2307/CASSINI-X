# ASTRA-X — Future Development Roadmap

This document outlines planned engineering milestones and scientific capabilities scheduled for subsequent development phases following Phase 8 completion.

---

## Phase 9: Spectral Harmonization Pipeline
- **Continuum Removal Calibration**: Ingest multi-band cubes from NASA EMIT (Earth), Chandrayaan-1 $\text{M}^3$ (Moon), and MRO CRISM (Mars).
- **Sensor Harmonization Protocol**: Implement a standardized continuum-removed spectral absorption band ratio pipeline (e.g. BD530 for ferric oxides, BD920 for pyroxenes, BD1900 for hydration).
- **Mineralogical Similarity**: Combine standardized mineral absorption depths with topographic feature vectors using multi-modal Mahalanobis distance.

---

## Phase 10: High-Resolution Geospatial Infrastructure (PostGIS Migration)
- **Database Engine Upgrade**: Transition from SQLite to PostgreSQL with PostGIS extensions for spatial indexing (`GIST`), fast polygon intersection, and tiled raster storage (`raster2pgsql`).
- **Distributed GeoTIFF Streaming**: Host cloud-optimized GeoTIFFs (COGs) on S3/GCS buckets with HTTP range requests and dynamic tile server integration (TiTiler).

---

## Phase 11: 3D Globe Visualization with CesiumJS
- **3D Planetary Spheres**: Integrate CesiumJS / NASA Trek WebGL engines for dynamic 3D planetary rendering of Mars and the Moon with real elevation terrain vertical exaggeration.
- **Interactive Traverse Simulation**: Animate rover traverses in 3D along computed $A^*$ routes, visualizing solar panel sun illumination angles and shadow occlusions over lunar/martian days.

---

## Phase 12: Terrestrial Analog Benchmark Expansion
- **Field Site Integration**: Expand the curated ground-truth database to include:
  - *Atacama Desert, Chile* (Hyper-arid Martian soil analogue)
  - *Devon Island (Haughton Impact Crater), Canada* (Impact crater and cold-desert analogue)
  - *Kilauea & Mauna Loa, Hawaii* (Fresh basaltic lava flows and volcanic tube exploration)
  - *McMurdo Dry Valleys, Antarctica* (Permafrost and cold-desert weathering)
- **Expanded Statistical Power**: Re-run leave-one-out cross-validation across 10+ benchmark pairs to establish rigorous confidence intervals and macro-averaged Mean Reciprocal Rank (MRR).

---

## Phase 13: Advanced Mission Simulation
- **Power & Thermal Budgeting**: Integrate solar flux calculations and rover power draw along planned traverse routes.
- **Multi-Agent Collaborative Routing**: Coordinated pathfinding for multiple rovers and aerial scout drones (e.g. Ingenuity-class rotorcraft).
