import logging
import os
import time
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db import init_db
from app.routers import system, regions, analysis, mission, reports, assistant, gazetteer

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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root_info():
    return {
        "status": "online",
        "service": "ASTRA-X Scientific Analog Intelligence API",
        "version": APP_VERSION,
        "frontend": "http://localhost:5173",
        "docs": "http://localhost:8000/docs",
        "health": "http://localhost:8000/api/health",
        "message": "ASTRA-X Backend is active. Access web UI at http://localhost:5173 or interactive docs at /docs",
    }


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration_ms:.1f}ms)")
    return response


# Global exception handlers
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


# Mount feature routers
app.include_router(system.router)
app.include_router(regions.router)
app.include_router(analysis.router)
app.include_router(mission.router)
app.include_router(reports.router)
app.include_router(assistant.router)
app.include_router(gazetteer.router)


# Future / Unimplemented Endpoints: HTTP 501 Placeholders
@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    tags=["Planned Endpoints"],
    include_in_schema=False
)
def planned_endpoints(path: str):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"Endpoint '/api/{path}' is not implemented yet."
    )
