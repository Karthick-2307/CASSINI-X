from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    status: str
    version: str
    demo_mode: bool


class PlanetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    mean_radius_m: float
    gravity_ms2: float
    description: Optional[str] = None


class DatasetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    planet_id: int
    name: str
    source: str
    url: Optional[str] = None
    resolution_m: Optional[float] = None
    units: Optional[str] = None
    acquisition_date: Optional[str] = None
    processing_steps: Optional[str] = None
    licence: Optional[str] = None


class DataCoverageItem(BaseModel):
    dataset_id: int
    name: str
    planet: str
    coverage_percent: Optional[float] = None


class RecentAnalysisItem(BaseModel):
    id: int
    reference_region: str
    created_at: str
    top_similarity: Optional[float] = None
    status: str


class DashboardSummaryResponse(BaseModel):
    processed_locations: int
    planetary_regions: int
    candidate_locations: int
    datasets_ingested: int
    analyses_run: int
    data_coverage: List[DataCoverageItem]
    recent_analyses: List[RecentAnalysisItem]
    demo_mode: bool


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail
