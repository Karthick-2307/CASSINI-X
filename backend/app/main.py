import logging
import os
import time
from typing import List
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db import init_db, get_db
from app.models import Planet, Dataset, Region, Analysis, CandidateMatch
from app.schemas import (
    HealthResponse,
    PlanetResponse,
    DatasetResponse,
    DashboardSummaryResponse,
    DataCoverageItem,
    RecentAnalysisItem,
    ErrorEnvelope,
    ErrorDetail,
)

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("astra-x")

APP_VERSION = "0.1.0"
DEMO_MODE = os.getenv("ASTRAX_DEMO_MODE", "false").lower() in ("true", "1", "yes")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database and reference factual data...")
    init_db()
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="ASTRA-X API",
    description="Explainable, data-driven discovery of terrestrial planetary analog environments.",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration_ms:.1f}ms)")
    return response


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = f"HTTP_{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": str(exc.detail)}}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected server error occurred."}}
    )


# --- Implemented Endpoints ---

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def get_health():
    return HealthResponse(
        status="healthy",
        version=APP_VERSION,
        demo_mode=DEMO_MODE
    )


@app.get("/api/planets", response_model=List[PlanetResponse], tags=["Planetary Reference"])
def get_planets(db: Session = Depends(get_db)):
    planets = db.query(Planet).order_by(Planet.id).all()
    return planets


@app.get("/api/datasets", response_model=List[DatasetResponse], tags=["Datasets Catalog"])
def get_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.id).all()
    return datasets


@app.get("/api/dashboard/summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Processed Earth locations
    earth_planet = db.query(Planet).filter(Planet.name == "Earth").first()
    earth_planet_id = earth_planet.id if earth_planet else None

    processed_locations = (
        db.query(Region).filter(Region.planet_id == earth_planet_id).count()
        if earth_planet_id
        else 0
    )

    # 2. Planetary target regions (Moon & Mars)
    planetary_regions = (
        db.query(Region).filter(Region.planet_id != earth_planet_id).count()
        if earth_planet_id
        else 0
    )

    # 3. Candidate analog matches
    candidate_locations = db.query(CandidateMatch).count()

    # 4. Ingested datasets
    datasets_count = db.query(Dataset).count()

    # 5. Analyses run
    analyses_count = db.query(Analysis).count()

    # 6. Data coverage per dataset
    coverage_items: List[DataCoverageItem] = []
    datasets = db.query(Dataset).all()
    for ds in datasets:
        planet_name = ds.planet.name if ds.planet else "Unknown"
        coverage_items.append(
            DataCoverageItem(
                dataset_id=ds.id,
                name=ds.name,
                planet=planet_name,
                coverage_percent=None  # Explicitly None until calculated in Part 4
            )
        )

    # 7. Recent analyses list
    recent_analyses: List[RecentAnalysisItem] = []
    analyses = db.query(Analysis).order_by(desc(Analysis.created_at)).limit(5).all()
    for a in analyses:
        target_name = a.target_region.name if a.target_region else "Target Region"
        top_match = (
            db.query(CandidateMatch)
            .filter(CandidateMatch.analysis_id == a.id)
            .order_by(desc(CandidateMatch.similarity_score))
            .first()
        )
        top_sim = top_match.similarity_score if top_match else None
        recent_analyses.append(
            RecentAnalysisItem(
                id=a.id,
                reference_region=target_name,
                created_at=a.created_at.isoformat() if a.created_at else "",
                top_similarity=top_sim,
                status=a.status
            )
        )

    return DashboardSummaryResponse(
        processed_locations=processed_locations,
        planetary_regions=planetary_regions,
        candidate_locations=candidate_locations,
        datasets_ingested=datasets_count,
        analyses_run=analyses_count,
        data_coverage=coverage_items,
        recent_analyses=recent_analyses,
        demo_mode=DEMO_MODE
    )


# --- Future Endpoints: HTTP 501 Placeholders ---

@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    tags=["Planned Endpoints"],
    include_in_schema=False
)
def planned_endpoints(path: str):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"Endpoint '/api/{path}' is not implemented yet. Scheduled for upcoming phases (Parts 4-7)."
    )
