# ASTRA-X — Planetary Terrestrial Analog Discovery Platform

**Tagline:** *Discover Earth. Understand Other Worlds. Prepare for Exploration.*  
**Engineering Team:** **CASSINI-X**  
**Core Mission:** Explainable, data-driven discovery and multi-attribute evaluation of terrestrial planetary analog environments.

---

## 1. System Overview

ASTRA-X answers the fundamental planetary science and operational question:
> *"Given a target region of interest on Mars or the Moon, which locations on Earth exhibit comparable topographic relief, slope distributions, and surface roughness characteristics?"*

The system ingests real elevation rasters (NASA/USGS MOLA for Mars, LOLA for the Moon, SRTM for Earth), extracts standardized physical feature vectors, and computes explainable nearest-neighbor alignments with rigorous confidence bounds, operational rover pathfinding, and publication-ready PDF dossier generation.

---

## 2. Core Capabilities & Page Index

- **Home (`/`)**: Mission charter, featured literature-verified analog pairs, and live catalog summary.
- **Dashboard (`/dashboard`)**: Ingested datasets, regional coverage percentages, and recent analysis runs.
- **Analog Discovery (`/discovery`)**: Interactive terrestrial map filtering analog locations by planet, similarity threshold, and area.
- **Planetary Explorer (`/explorer`)**: Multi-body raster map viewer with real dynamic Hillshade and Slope PNG overlays, bounding-box coordinate inspector, and coverage sampling.
- **AI & Similarity Analysis (`/analysis`)**: 6-tab mathematical intelligence view:
  1. *Feature Comparison*: Target vs candidate physical values with dimensional differences.
  2. *Similarity Calculation*: Weighted distance deconstruction with interactive weights.
  3. *Clusters & Anomalies*: Silhouette K-Means, DBSCAN spatial topology, and Isolation Forest outliers.
  4. *Multi-Attribute Ranking*: Scatter charts and candidate sorting.
  5. *Explainability Breakdown*: Natural-language evidence synthesis.
  6. *Coverage & Uncertainty*: Composite confidence and spatial resolution bounds.
- **Geological Intelligence (`/geology`)**: 3-group evidence separation (*Observed*, *Derived*, *Inferred*), provider registry (EMIT, $\text{M}^3$, CRISM), water-ice status banner, and cross-region material comparison with sensor harmonization warnings.
- **Mission Analysis (`/mission`)**: Preliminary landing-site terrain screening against editable thresholds, flagged hazard identification, and 8-connected $A^*$ rover pathfinding with admissible octile heuristic and elevation profile charts.
- **Scientific Reports (`/reports`)**: ReportLab + Matplotlib compilation of multi-page scientific dossiers with dataset provenance tables, charts, and download links.
- **Scientific Assistant (`/assistant`)**: Grounded decision-support engine answering queries deterministically from database tables without generative fabrication or hallucination.

---

## 3. High-Level Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │          ASTRA-X Frontend (React / Vite)      │
                  │   Tailwind CSS  │  MapLibre GL  │  Recharts   │
                  └───────────────────────┬───────────────────────┘
                                          │ JSON REST / PNG Tiles
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │            FastAPI Backend Service            │
                  │          Pydantic v2 Contract Validation      │
                  └───────┬───────────────┬───────────────┬───────┘
                          │               │               │
        ┌─────────────────┴─┐   ┌─────────┴─────────┐   ┌─┴────────────────┐
        │ Numerical Engine  │   │   Storage Layer   │   │ Geospatial I/O   │
        │ • Robust Scaler   │   │ • SQLite Database │   │ • Rasterio       │
        │ • Distance & Sims │   │ • SQLAlchemy ORM  │   │ • GDAL /vsicurl/ │
        │ • 8-Connected A*  │   │ • Reports Archive │   │ • Hillshade/Slope│
        │ • Isolation Forest│   │ • Provenance Seed │   │ • SRTM / MOLA    │
        └───────────────────┘   └───────────────────┘   └──────────────────┘
```

---

## 4. Setup & Installation (Windows 11 / Cross-Platform)

### Prerequisites
- **Python 3.11+**
- **Node.js 20 LTS+** and **npm**

### Step 1: Clone & Configure Environment
```powershell
# Copy example environment configuration
cp .env.example .env
```

#### Environment Variables (`.env`)
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `ASTRAX_DB_PATH` | `data/astrax.db` | Relative path to persistent SQLite database |
| `ASTRAX_DATA_DIR` | `data/` | Path to raster cache, processed arrays, and reports |
| `ASTRAX_DEMO_MODE`| `false` | When true, displays explicit yellow "Demo Mode" warning |
| `LLM_API_KEY` | *(empty)* | Optional Gemini/OpenAI API key for RAG assistant mode |

---

### Step 2: Backend Setup
```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install required Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### Step 3: Frontend Setup
Open a separate terminal window:
```powershell
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- **Application UI**: `http://localhost:5173`

---

## 5. Dataset Ingestion Workflows

ASTRA-X ships with seeded reference coordinates and metadata for:
- **Earth**: Lanzarote Volcanic Field, Canary Islands
- **Mars**: Jezero Crater Floor & Delta
- **Moon**: Mare Tranquillitatis (Apollo 11 Basin)

### Automated Ingestion Commands
From the `backend` directory with `.venv` active:
```powershell
# Ingest Earth SRTM 1-Arc-Second (Lanzarote Tile N29W014)
python -m app.ingest.cli --dataset srtm --region lanzarote

# Ingest Mars MGS MOLA Global DEM (Jezero Crater Bounding Box)
python -m app.ingest.cli --dataset mola --region jezero

# Ingest Moon LRO LOLA Global DEM (Mare Tranquillitatis Bounding Box)
python -m app.ingest.cli --dataset lola --region mare_tranquillitatis
```
*(For manual offline ingestion using locally downloaded GeoTIFFs, see `docs/DATA_SOURCES.md`).*

---

## 6. How to Run an Analysis

1. Navigate to `http://localhost:5173/discovery` or `http://localhost:5173/analysis`.
2. Select your target extraterrestrial reference (e.g. *Jezero Crater Floor & Delta* on Mars).
3. Select your search candidate pool (*Earth Analogs*).
4. Configure dimensional weights (relative elevation, slope, and surface roughness).
5. Click **"Execute Similarity Pipeline"**.
6. Inspect the ranked terrestrial analog cards, feature breakdown, cluster assignments, and isolation forest anomaly flags.
7. Click **"Compile PDF Dossier"** to generate and download a formal scientific report.

---

## 7. Testing & Verification

### Running Full Backend Test Suite
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```
*Current test suite: **47 passing tests** covering feature extraction, A\* pathfinding, similarity mathematics, robust scaling, and API error envelopes.*

### Running Backend Coverage Report
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest --cov=app.analysis --cov-report=term-missing
```
*Coverage on `app.analysis`: **92%**.*

### Running Frontend Tests
```powershell
cd frontend
npm test
```
*Vitest + React Testing Library suite: **15 passing tests** verifying StatCard scientific honesty badges, Badge variants, EmptyState handlers, and Discovery filter controls.*

### Running End-to-End Smoke Test Script
```powershell
cd backend
.\.venv\Scripts\python.exe ..\scripts\smoke_test.py
```
*Executes all 6 pipeline stages: Health -> Catalog -> Rasters -> ML Similarity -> Metrics Separation -> PDF Report Generation & Magic Bytes Verification.*

### Running Latency & Performance Benchmark
```powershell
cd backend
.\.venv\Scripts\python.exe ..\scripts\measure_performance.py
```

---

## 8. Database Management & Reset

ASTRA-X utilizes SQLite with SQLAlchemy ORM.

### Database Initialization
Database tables and factual planetary bodies are automatically initialized on application startup via `init_db()` in `backend/app/db.py`.

### How to Reset Database to Clean State
To wipe all analysis runs and reset database tables:
```powershell
# Stop backend server, then delete database file:
Remove-Item backend/astrax.db -Force

# Restart backend server to re-initialize schema and factual seeds:
cd backend
uvicorn app.main:app --port 8000
```

---

## 9. Scientific Honesty & Integrity Protocol (Part 0 Section 0.7)

1. **Zero Fabrication**: Satellite observations, sensor spectra, and terrain features are never synthesized or invented.
2. **Metric Separation**: `similarity_score`, `confidence_score`, and `mission_suitability_score` are strictly separated across all database tables, API responses, and UI elements.
3. **No Unwarranted Extrapolations**: High similarity does not imply an Earth site is "identical" to Mars. Suitability scores are preliminary screening only and never certified for flight landing safety.
4. **Water-Ice Transparency**: Displays `"No water-ice dataset ingested"` verbatim across all regions until calibrated radar sounding/neutron spectrometer data is ingested.
5. **Full Provenance**: Every displayed metric includes spatial resolution, sensor name, and publication citation.

---

## 10. License

Developed by team **CASSINI-X**. Open-source under the Apache License 2.0. Planetary datasets courtesy of NASA, USGS Astrogeology Science Center, and AWS Open Data Registry.
