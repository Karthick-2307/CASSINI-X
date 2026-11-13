# ASTRA-X — Deployment Preparation & Infrastructure Guide

**Platform:** ASTRA-X  
**Team:** CASSIN X  

---

## 1. Production Build Commands

### Frontend Production Build
To create the optimized, minified production distribution:
```powershell
cd frontend
npm ci
npm run build
```
The output files are compiled to `frontend/dist/` (HTML, CSS, bundled JavaScript, and vector assets).  
To preview the production bundle locally:
```powershell
npm run preview
```

### Backend Production Execution
In production, run FastAPI with multiple worker processes using Uvicorn behind a reverse proxy (e.g. Nginx, Caddy, or Cloud Run):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level info
```

---

## 2. Docker & Containerized Deployment (Optional / Untested)
*Per Part 8 instructions, the following Docker configurations are provided as standard deployment blueprints and are marked optional/untested if a Docker daemon is not active in the local development environment.*

- `backend/Dockerfile`: Python 3.11-slim container with GDAL/Rasterio C-libraries.
- `frontend/Dockerfile`: Multi-stage build compiling TypeScript/Vite into an Nginx Alpine container.
- `docker-compose.yml`: Coordinates the frontend on port 80 and the backend on port 8000 with a persistent data volume for rasters and SQLite database.

```bash
# Optional command to build and launch containers:
docker-compose up --build
```

---

## 3. Production Environment Variable Checklist
Confirm all configuration values prior to deploying to staging or production:

| Variable | Recommended Production Value | Required? | Purpose |
| :--- | :--- | :---: | :--- |
| `ASTRAX_DB_PATH` | `/app/data/astrax.db` | Yes | Path to SQLite database file |
| `ASTRAX_DATA_DIR` | `/app/data` | Yes | Path for raw/processed DEM rasters & PDF reports |
| `ASTRAX_DEMO_MODE` | `false` | Yes | Must be `false` in production (enforces real data only) |
| `LLM_API_KEY` | *(Set securely via secret manager)* | Optional | Gemini/OpenAI key if optional LLM RAG mode is active |
| `PORT` | `8000` | Optional | Port for Uvicorn HTTP server |

### Secret Audit Confirmation
- A comprehensive repository audit confirms that **zero secrets, API tokens, passwords, or private keys are committed** to version control.
- Sensitive environment files (`.env`) and database credentials are fully excluded in `.gitignore`.

---

## 4. Migration Architecture: SQLite to PostgreSQL / PostGIS

While SQLite with local GeoTIFF streaming provides zero-configuration deployment for single-node scientific decision support, moving to multi-user enterprise scale requires PostgreSQL with PostGIS extensions.

### Required Changes in `backend/app/db.py`:
1. **Driver & Connection String**:
   - Replace `sqlite:///./data/astrax.db` with PostgreSQL connection string:
     ```python
     DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://user:password@localhost:5432/astrax")
     ```
2. **Engine Pool Configuration**:
   - Replace SQLite `check_same_thread=False` with PostgreSQL connection pooling:
     ```python
     engine = create_engine(
         DATABASE_URL,
         pool_size=10,
         max_overflow=20,
         pool_pre_ping=True
     )
     ```

### Required Changes in `backend/app/models.py`:
1. **Spatial Geometry Columns (`geoalchemy2`)**:
   - Replace plain `lat` (Float) and `lon` (Float) with PostGIS `Geometry` columns:
     ```python
     from geoalchemy2 import Geometry
     # Point geometry for candidate locations (WGS84 EPSG:4326)
     geom = Column(Geometry(geometry_type='POINT', srid=4326), index=True)
     # Polygon geometry for region bounding box
     boundary = Column(Geometry(geometry_type='POLYGON', srid=4326))
     ```
2. **Spatial Indexing & Polygon Intersect**:
   - Replaces in-memory bounding-box checks with native spatial SQL queries:
     ```sql
     SELECT * FROM candidate_matches WHERE ST_Contains(boundary, geom);
     ```
3. **Raster Storage**:
   - Instead of local `.tif` files, use `raster2pgsql` to store tiled rasters directly in PostgreSQL with spatial Pyramids / Overviews for sub-second spatial queries.
