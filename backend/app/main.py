import logging
import os
import time
from typing import List, Optional
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
import numpy as np

from app.db import init_db, get_db
from app.models import Planet, Dataset, Region, TerrainFeature, Analysis, CandidateMatch
import json
from app.analysis.engine import run_analysis_pipeline
from app.analysis.validate import execute_validation_pipeline
from app.analysis.visualize import render_hillshade_png, render_slope_png, get_raster_bounds_info
from app.schemas import (
    HealthResponse,
    PlanetResponse,
    DatasetResponse,
    RegionResponse,
    TerrainSummaryResponse,
    DashboardSummaryResponse,
    DataCoverageItem,
    RecentAnalysisItem,
    ErrorEnvelope,
    ErrorDetail,
    AnalysisRunRequest,
    AnalysisRunResponse,
    AnalysisDetailResponse,
    CandidateMatchResponse,
    FeatureComparisonItem,
    ExplanationItem,
    BenchmarkValidationResponse,
    TerrainBoundsResponse,
    BboxSampleRequest,
    BboxSampleResponse,
    TerrainStatSummary,
    AnalysisSummaryItem,
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


@app.get("/api/regions", response_model=List[RegionResponse], tags=["Planetary Regions"])
def get_regions(planet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Region)
    if planet_id is not None:
        query = query.filter(Region.planet_id == planet_id)
    return query.order_by(Region.id).all()


@app.get("/api/regions/{region_id}", response_model=RegionResponse, tags=["Planetary Regions"])
def get_region_by_id(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region with id {region_id} not found.")
    return region


@app.get("/api/terrain/{region_id}", response_model=TerrainSummaryResponse, tags=["Terrain Intelligence"])
def get_terrain_summary(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region with id {region_id} not found.")

    features = db.query(TerrainFeature).filter(TerrainFeature.region_id == region_id).all()
    if not features:
        raise HTTPException(
            status_code=404,
            detail=f"No terrain features computed yet for region '{region.name}'. Ingest data first."
        )

    elev_rels = [f.elevation_relative for f in features if f.elevation_relative is not None]
    slopes = [f.slope_deg for f in features if f.slope_deg is not None]
    roughnesses = [f.roughness_m for f in features if f.roughness_m is not None]

    dataset = region.source_dataset
    dataset_info = (
        {
            "id": dataset.id,
            "name": dataset.name,
            "source": dataset.source,
            "url": dataset.url,
            "resolution_m": dataset.resolution_m,
            "crs": dataset.crs,
            "units": dataset.units,
            "licence": dataset.licence,
        }
        if dataset
        else None
    )

    scale_val = features[0].scale_m if features else 500.0
    window_val = features[0].window_px if features else 5

    return TerrainSummaryResponse(
        region_id=region.id,
        region_name=region.name,
        planet=region.planet.name if region.planet else "Unknown",
        scale_m=scale_val,
        window_px=window_val,
        total_cells=len(features),
        valid_cells=len(features),
        coverage_fraction=1.0,
        elevation_relative_mean=float(sum(elev_rels) / len(elev_rels)) if elev_rels else None,
        elevation_relative_std=float((sum((x - sum(elev_rels)/len(elev_rels))**2 for x in elev_rels) / len(elev_rels))**0.5) if elev_rels else None,
        elevation_relative_min=float(min(elev_rels)) if elev_rels else None,
        elevation_relative_max=float(max(elev_rels)) if elev_rels else None,
        slope_deg_mean=float(sum(slopes) / len(slopes)) if slopes else None,
        slope_deg_max=float(max(slopes)) if slopes else None,
        roughness_m_mean=float(sum(roughnesses) / len(roughnesses)) if roughnesses else None,
        dataset_provenance=dataset_info
    )


@app.get("/api/terrain/{region_id}/bounds", response_model=TerrainBoundsResponse, tags=["Terrain Intelligence"])
def get_terrain_bounds(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail=f"No local raster data available for region '{region.name}'.")

    bounds_info = get_raster_bounds_info(dataset.local_path)
    return TerrainBoundsResponse(
        region_id=region.id,
        name=region.name,
        planet=region.planet.name if region.planet else "Unknown",
        bbox=bounds_info["bbox"],
        coordinates=bounds_info["coordinates"],
        center=bounds_info["center"],
        dataset_name=dataset.name,
        resolution_m=dataset.resolution_m,
        source=dataset.source
    )


@app.get("/api/terrain/{region_id}/hillshade.png", tags=["Terrain Intelligence"])
def get_terrain_hillshade(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail=f"No local raster data available for region '{region.name}'.")

    png_bytes = render_hillshade_png(dataset.local_path)
    return Response(content=png_bytes, media_type="image/png")


@app.get("/api/terrain/{region_id}/slope.png", tags=["Terrain Intelligence"])
def get_terrain_slope(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail=f"No local raster data available for region '{region.name}'.")

    png_bytes = render_slope_png(dataset.local_path)
    return Response(content=png_bytes, media_type="image/png")


@app.post("/api/terrain/sample-bbox", response_model=BboxSampleResponse, tags=["Terrain Intelligence"])
def sample_terrain_bbox(req: BboxSampleRequest, db: Session = Depends(get_db)):
    min_lon = min(req.min_lon, req.max_lon)
    max_lon = max(req.min_lon, req.max_lon)
    min_lat = min(req.min_lat, req.max_lat)
    max_lat = max(req.min_lat, req.max_lat)

    query = db.query(TerrainFeature)
    if req.region_id:
        query = query.filter(TerrainFeature.region_id == req.region_id)
    elif req.planet_name:
        query = query.join(TerrainFeature.region).join(Region.planet).filter(Planet.name.ilike(f"%{req.planet_name}%"))

    query = query.filter(
        TerrainFeature.lat >= min_lat,
        TerrainFeature.lat <= max_lat,
        TerrainFeature.lon >= min_lon,
        TerrainFeature.lon <= max_lon
    )
    cells = query.all()

    if not cells:
        all_regions = db.query(Region).all()
        reg_names = [r.name for r in all_regions if r.source_dataset and r.source_dataset.local_path]
        return BboxSampleResponse(
            status="outside_coverage",
            message=f"Selected bounding box [{min_lon:.2f}, {min_lat:.2f}, {max_lon:.2f}, {max_lat:.2f}] is outside ingested dataset coverage. Ingested study areas: {', '.join(reg_names)}.",
            cell_count=0
        )

    elevs = [c.elevation_relative for c in cells if c.elevation_relative is not None]
    slopes = [c.slope_deg for c in cells if c.slope_deg is not None]
    roughs = [c.roughness_m for c in cells if c.roughness_m is not None]

    elev_stat = TerrainStatSummary(
        mean=round(float(np.mean(elevs)), 2),
        std=round(float(np.std(elevs)), 2),
        min=round(float(np.min(elevs)), 2),
        max=round(float(np.max(elevs)), 2)
    ) if elevs else None

    slope_stat = TerrainStatSummary(
        mean=round(float(np.mean(slopes)), 2),
        std=round(float(np.std(slopes)), 2),
        min=round(float(np.min(slopes)), 2),
        max=round(float(np.max(slopes)), 2)
    ) if slopes else None

    rough_stat = TerrainStatSummary(
        mean=round(float(np.mean(roughs)), 2),
        std=round(float(np.std(roughs)), 2),
        min=round(float(np.min(roughs)), 2),
        max=round(float(np.max(roughs)), 2)
    ) if roughs else None

    samples = [
        {
            "id": c.id,
            "lat": c.lat,
            "lon": c.lon,
            "elevation_relative": round(c.elevation_relative, 2) if c.elevation_relative is not None else None,
            "slope_deg": round(c.slope_deg, 2) if c.slope_deg is not None else None,
            "roughness_m": round(c.roughness_m, 2) if c.roughness_m is not None else None,
        }
        for c in cells[:50]
    ]

    return BboxSampleResponse(
        status="ok",
        message=f"Extracted real elevation, slope, and roughness statistics from {len(cells)} cells.",
        region_name=cells[0].region.name if cells[0].region else "Unknown",
        cell_count=len(cells),
        elevation_relative=elev_stat,
        slope_deg=slope_stat,
        roughness_m=rough_stat,
        sample_points=samples
    )


@app.get("/api/dashboard/summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    earth_planet = db.query(Planet).filter(Planet.name == "Earth").first()
    earth_planet_id = earth_planet.id if earth_planet else None

    processed_locations = (
        db.query(Region).filter(Region.planet_id == earth_planet_id).count()
        if earth_planet_id
        else 0
    )

    planetary_regions = (
        db.query(Region).filter(Region.planet_id != earth_planet_id).count()
        if earth_planet_id
        else 0
    )

    candidate_locations = db.query(CandidateMatch).count()
    datasets_count = db.query(Dataset).count()
    analyses_count = db.query(Analysis).count()

    coverage_items: List[DataCoverageItem] = []
    datasets = db.query(Dataset).all()
    for ds in datasets:
        planet_name = ds.planet.name if ds.planet else "Unknown"
        coverage_items.append(
            DataCoverageItem(
                dataset_id=ds.id,
                name=ds.name,
                planet=planet_name,
                coverage_percent=100.0 if ds.local_path else None
            )
        )

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


def serialize_candidate_match(match: CandidateMatch) -> CandidateMatchResponse:
    target_id = match.target_region_id
    if target_id is None and match.analysis:
        target_id = match.analysis.target_region_id

    lat_val = match.lat
    lon_val = match.lon
    if (lat_val is None or lat_val == 0.0) and match.earth_region:
        lat_val = match.earth_region.lat
        lon_val = match.earth_region.lon

    conf_components = json.loads(match.confidence_components_json) if match.confidence_components_json else None
    feat_comparison = json.loads(match.feature_comparison_json) if match.feature_comparison_json else []
    ds_refs = json.loads(match.dataset_references_json) if match.dataset_references_json else []
    expl = json.loads(match.explanation_json) if match.explanation_json else {"similarities": [], "differences": []}

    return CandidateMatchResponse(
        id=match.id,
        location_name=match.location_name or "Earth Analog Candidate",
        lat=lat_val if lat_val is not None else 0.0,
        lon=lon_val if lon_val is not None else 0.0,
        target_region_id=target_id or 0,
        similarity=match.similarity_score,
        confidence=match.confidence_score,
        confidence_components=conf_components,
        mission_suitability=None,  # STRICTLY NULL IN PART 5
        feature_comparison=feat_comparison,
        data_coverage=match.data_coverage,
        cluster_id=match.cluster_id,
        is_anomaly=bool(match.is_anomaly),
        dataset_references=ds_refs,
        explanation=expl
    )


# --- Part 5: Similarity Engine & Analog Discovery Endpoints ---

@app.get("/api/analyses", response_model=List[AnalysisSummaryItem], tags=["Similarity Engine"])
def get_analyses(db: Session = Depends(get_db)):
    analyses = db.query(Analysis).order_by(desc(Analysis.created_at)).all()
    results = []
    for a in analyses:
        target_name = a.target_region.name if a.target_region else "Unknown"
        planet_name = (
            a.target_region.planet.name
            if a.target_region and a.target_region.planet
            else "Unknown"
        )
        top_cand = (
            db.query(CandidateMatch)
            .filter(CandidateMatch.analysis_id == a.id)
            .order_by(desc(CandidateMatch.similarity_score))
            .first()
        )
        cand_count = db.query(CandidateMatch).filter(CandidateMatch.analysis_id == a.id).count()
        results.append(
            AnalysisSummaryItem(
                id=a.id,
                target_region_id=a.target_region_id,
                target_region_name=target_name,
                planet=planet_name,
                created_at=a.created_at.isoformat() if a.created_at else "",
                status=a.status,
                candidate_count=cand_count,
                top_similarity=top_cand.similarity_score if top_cand else None
            )
        )
    return results


@app.post("/api/analysis/run", response_model=AnalysisRunResponse, tags=["Similarity Engine"])
def run_analysis(req: AnalysisRunRequest, db: Session = Depends(get_db)):
    if req.top_k is not None and req.top_k <= 0:
        raise HTTPException(status_code=422, detail="top_k must be greater than 0.")
    if req.threshold is not None and (req.threshold < 0.0 or req.threshold > 100.0):
        raise HTTPException(status_code=422, detail="threshold must be between 0.0 and 100.0.")

    target_region = db.query(Region).filter(Region.id == req.target_region_id).first()
    if not target_region:
        raise HTTPException(status_code=404, detail=f"Target region id {req.target_region_id} not found.")

    try:
        analysis = run_analysis_pipeline(
            db=db,
            target_region_id=req.target_region_id,
            earth_search_area_ids=req.earth_search_area_ids,
            features=req.features,
            weights=req.weights,
            threshold=req.threshold or 0.0,
            top_k=req.top_k or 20
        )
        return AnalysisRunResponse(
            analysis_id=analysis.id,
            status=analysis.status,
            message="Analysis completed successfully."
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to execute analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to execute analysis pipeline: {str(e)}")


@app.get("/api/analysis/{analysis_id}", response_model=AnalysisDetailResponse, tags=["Similarity Engine"])
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with id {analysis_id} not found.")

    target_name = analysis.target_region.name if analysis.target_region else "Unknown"
    planet_name = (
        analysis.target_region.planet.name
        if analysis.target_region and analysis.target_region.planet
        else "Unknown"
    )

    candidates = (
        db.query(CandidateMatch)
        .filter(CandidateMatch.analysis_id == analysis.id)
        .order_by(desc(CandidateMatch.similarity_score))
        .all()
    )

    return AnalysisDetailResponse(
        id=analysis.id,
        target_region_id=analysis.target_region_id,
        target_region_name=target_name,
        planet=planet_name,
        features=json.loads(analysis.features_json) if analysis.features_json else [],
        weights=json.loads(analysis.weights_json) if analysis.weights_json else {},
        threshold=analysis.threshold or 0.0,
        top_k=analysis.top_k or 20,
        status=analysis.status,
        error_message=analysis.error_message,
        scaler_params=json.loads(analysis.scaler_params_json) if analysis.scaler_params_json else None,
        target_summary=json.loads(analysis.target_summary_json) if analysis.target_summary_json else None,
        clustering_info=json.loads(analysis.clustering_info_json) if analysis.clustering_info_json else None,
        created_at=analysis.created_at.isoformat() if analysis.created_at else "",
        completed_at=analysis.completed_at.isoformat() if analysis.completed_at else None,
        candidate_count=len(candidates),
        candidates=[serialize_candidate_match(c) for c in candidates]
    )


@app.get("/api/analogs", response_model=List[CandidateMatchResponse], tags=["Analog Discovery"])
def get_analogs(
    planet: Optional[str] = None,
    area: Optional[str] = None,
    min_similarity: Optional[float] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = (
        db.query(CandidateMatch)
        .join(CandidateMatch.analysis)
        .join(Analysis.target_region)
        .join(Region.planet)
    )

    if planet:
        query = query.filter(Planet.name.ilike(f"%{planet}%"))
    if area:
        query = query.filter(CandidateMatch.location_name.ilike(f"%{area}%"))
    if min_similarity is not None:
        query = query.filter(CandidateMatch.similarity_score >= min_similarity)

    matches = query.order_by(desc(CandidateMatch.similarity_score)).limit(limit).all()
    return [serialize_candidate_match(m) for m in matches]


@app.get("/api/analogs/{match_id}", response_model=CandidateMatchResponse, tags=["Analog Discovery"])
def get_analog_by_id(match_id: int, db: Session = Depends(get_db)):
    match = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail=f"Analog candidate with id {match_id} not found.")
    return serialize_candidate_match(match)


@app.post("/api/benchmarks/validation", response_model=BenchmarkValidationResponse, tags=["Validation & Baselines"])
@app.get("/api/benchmarks/validation", response_model=BenchmarkValidationResponse, tags=["Validation & Baselines"])
def run_or_get_validation(db: Session = Depends(get_db)):
    try:
        report = execute_validation_pipeline(
            db_session=db,
            output_json_path="data/validation_report.json"
        )
        return BenchmarkValidationResponse(**report)
    except Exception as e:
        logger.error(f"Validation execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation execution failed: {str(e)}")


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
        detail=f"Endpoint '/api/{path}' is not implemented yet. Scheduled for upcoming phases (Parts 6-7)."
    )
