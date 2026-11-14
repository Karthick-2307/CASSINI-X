from typing import Optional, List
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
    crs: Optional[str] = None
    units: Optional[str] = None
    acquisition_date: Optional[str] = None
    processing_steps: Optional[str] = None
    licence: Optional[str] = None
    local_path: Optional[str] = None
    status: Optional[str] = None


class RegionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    planet_id: int
    name: str
    lat: float
    lon: float
    bbox_json: Optional[str] = None
    geometry_geojson: Optional[str] = None
    elevation_m: Optional[float] = None
    slope_deg: Optional[float] = None
    roughness_m: Optional[float] = None
    source_dataset_id: Optional[int] = None
    description: Optional[str] = None
    is_curated: bool = False
    citation: Optional[str] = None
    notes: Optional[str] = None


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

