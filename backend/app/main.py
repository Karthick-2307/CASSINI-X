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

from app.db import init_db, get_db
from app.models import Planet, Dataset
from app.schemas import HealthResponse, PlanetResponse, DatasetResponse, ErrorEnvelope, ErrorDetail

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


# --- Implemented Endpoints for Phase 1 ---

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

