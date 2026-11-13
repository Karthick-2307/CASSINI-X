# ASTRA-X

**Tagline:** *Discover Earth. Understand Other Worlds. Prepare for Exploration.*  
**Team:** **CASSIN X**

ASTRA-X is an explainable, data-driven web application for discovering terrestrial planetary analog environments. It answers:
> "Given a selected region on Mars or the Moon, which locations on Earth have comparable terrain characteristics?"

---

## Architecture (MVP)

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS + Recharts
- **Backend:** Python 3.11 + FastAPI + Pydantic + SQLAlchemy + SQLite
- **Terrain Analysis Engine:** numpy, pandas, scipy, scikit-learn, rasterio

---

## Prerequisites (Windows 11)

- **Python 3.11+**
- **Node.js 20 LTS+** and **npm**

---

## Getting Started

### 1. Environment Configuration

Copy the example environment configuration:
```powershell
cp .env.example .env
```

### 2. Backend Setup & Run

Open a terminal in the `backend` directory:
```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the backend API server with auto-reload
uvicorn app.main:app --reload --port 8000
```
- API is available at: [http://localhost:8000](http://localhost:8000)
- Interactive API documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative API documentation (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)

#### Running Backend Tests
```powershell
cd backend
.\.venv\Scripts\pytest -v
```

### 3. Frontend Setup & Run

Open a second terminal in the `frontend` directory:
```powershell
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
- Application is available at: [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
astra-x/
  README.md
  .env.example
  .gitignore
  docs/
    ASTRAX_09_reference_appendix.md
  backend/
    requirements.txt
    astrax.db
    app/
      main.py            <- FastAPI app, CORS, error handling
      db.py              <- SQLite engine, session, table creation, seed data
      models.py          <- SQLAlchemy models (Planets, Regions, Datasets, etc.)
      schemas.py         <- Pydantic validation schemas
      routers/           <- Future modular API routers
      analysis/          <- Future terrain analysis modules
      ingest/            <- Future raster ingestion pipelines
    data/
      raw/               <- Git-ignored raw DEM rasters
      processed/         <- Git-ignored processed terrain arrays
    tests/
      test_api.py        <- Pytest API test suite
  frontend/
    package.json
    vite.config.ts
    tailwind.config.js
    src/
      api/
        client.ts        <- Typed fetch wrapper with error handling
      components/
        Layout.tsx       <- Responsive navigation bar & footer
      pages/
        Home.tsx         <- Mission landing view
        Dashboard.tsx    <- Live planetary reference dashboard
        Discovery.tsx    <- Discovery explorer shell (Phase 6)
        Explorer.tsx     <- Planetary terrain explorer shell (Phase 6)
        Analysis.tsx     <- AI & similarity analysis shell (Phase 5-6)
        Geology.tsx      <- Geological context shell (Phase 7)
        Mission.tsx      <- Mission suitability shell (Phase 7)
        Reports.tsx      <- Report dossier generator shell (Phase 7)
        About.tsx        <- About CASSIN X & scientific rules
        NotFound.tsx     <- 404 handler
```

---

## Implemented Endpoints (Part 1)

- `GET /api/health` -> System health, API version, demo mode status
- `GET /api/planets` -> Planetary bodies reference data (Earth, Moon, Mars)
- `GET /api/datasets` -> Datasets catalog (empty list until Phase 4 ingestion)
- Other endpoints return `HTTP 501 Not Implemented` with an explanatory message.

---

## Scientific Honesty Protocol

1. No fabricated observations or satellite data.
2. Similarity, confidence, and mission suitability are preserved as strictly independent values.
3. Reference bodies seeded strictly with factual physical dimensions (mean radius and gravity).
4. All uncharacterized terrain states are explicitly designated.
