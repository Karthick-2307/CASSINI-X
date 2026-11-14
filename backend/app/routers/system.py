import os
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db import get_db
from app.models import Planet, Dataset, Region, CandidateMatch, Analysis
from app.schemas import (
    HealthResponse,
    PlanetResponse,
    DatasetResponse,
    DashboardSummaryResponse,
    DataCoverageItem,
    RecentAnalysisItem,
)

router = APIRouter(tags=["System"])

APP_VERSION = "0.1.0"
DEMO_MODE = os.getenv("ASTRAX_DEMO_MODE", "false").lower() in ("true", "1", "yes")


@router.get("/api/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="healthy",
        version=APP_VERSION,
        demo_mode=DEMO_MODE
    )


@router.get("/api/planets", response_model=List[PlanetResponse], tags=["Planetary Reference"])
def get_planets(db: Session = Depends(get_db)):
    return db.query(Planet).order_by(Planet.id).all()


@router.get("/api/datasets", response_model=List[DatasetResponse], tags=["Datasets Catalog"])
def get_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.id).all()


@router.get("/api/dashboard/summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
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

