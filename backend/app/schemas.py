from typing import Optional, List, Dict, Any
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


class TerrainFeatureCell(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cell_index: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    elevation_relative: Optional[float] = None
    slope_deg: Optional[float] = None
    roughness_m: Optional[float] = None
    valid_fraction: float
    native_res_m: Optional[float] = None
    kind: str = "derived"


class TerrainSummaryResponse(BaseModel):
    region_id: int
    region_name: str
    planet: str
    scale_m: float
    window_px: int
    total_cells: int
    valid_cells: int
    coverage_fraction: float
    elevation_relative_mean: Optional[float] = None
    elevation_relative_std: Optional[float] = None
    elevation_relative_min: Optional[float] = None
    elevation_relative_max: Optional[float] = None
    slope_deg_mean: Optional[float] = None
    slope_deg_max: Optional[float] = None
    roughness_m_mean: Optional[float] = None
    dataset_provenance: Optional[Dict[str, Any]] = None


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


# --- Part 5: Analysis and Similarity Engine Schemas ---

class AnalysisRunRequest(BaseModel):
    target_region_id: int
    earth_search_area_ids: Optional[List[int]] = None
    features: Optional[List[str]] = ["elevation_relative", "slope_deg", "roughness_m"]
    weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = 0.0
    top_k: Optional[int] = 20


class AnalysisRunResponse(BaseModel):
    analysis_id: int
    status: str
    message: str


class FeatureComparisonItem(BaseModel):
    feature: str
    unit: str
    target_value: float
    candidate_value: float
    difference: float
    normalized_difference: Optional[float] = None
    contribution: float
    kind: str  # matching, higher, lower


class ExplanationItem(BaseModel):
    similarities: List[str]
    differences: List[str]


class CandidateMatchResponse(BaseModel):
    id: int
    location_name: str
    lat: float
    lon: float
    target_region_id: int
    similarity: float  # 0-100
    confidence: float  # 0-100
    confidence_components: Optional[Dict[str, Any]] = None
    mission_suitability: Optional[float] = None  # Strictly null until Part 7
    feature_comparison: List[FeatureComparisonItem]
    data_coverage: Optional[float] = None
    cluster_id: Optional[int] = None
    is_anomaly: bool = False
    dataset_references: List[Any]
    explanation: ExplanationItem


class AnalysisDetailResponse(BaseModel):
    id: int
    target_region_id: int
    target_region_name: str
    planet: str
    features: List[str]
    weights: Dict[str, float]
    threshold: float
    top_k: int
    status: str
    error_message: Optional[str] = None
    scaler_params: Optional[Dict[str, Any]] = None
    target_summary: Optional[Dict[str, Any]] = None
    clustering_info: Optional[Dict[str, Any]] = None
    created_at: str
    completed_at: Optional[str] = None
    candidate_count: int
    candidates: List[CandidateMatchResponse]


class BenchmarkValidationResponse(BaseModel):
    timestamp: str
    model_name: str
    features: List[str]
    benchmark_evaluations: List[Dict[str, Any]]
    metrics_summary: Dict[str, Any]
    statistical_power_note: str


# --- Part 6: Explorer and Mapping Schemas ---

class TerrainBoundsResponse(BaseModel):
    region_id: int
    name: str
    planet: str
    bbox: List[float]  # [min_lon, min_lat, max_lon, max_lat]
    coordinates: List[List[float]]  # 4 corner coords for MapLibre image source
    center: List[float]  # [lon, lat]
    dataset_name: str
    resolution_m: Optional[float] = None
    source: str


class BboxSampleRequest(BaseModel):
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float
    planet_name: Optional[str] = None
    region_id: Optional[int] = None


class TerrainStatSummary(BaseModel):
    mean: float
    std: float
    min: float
    max: float


class BboxSampleResponse(BaseModel):
    status: str  # "ok" or "outside_coverage"
    message: str
    region_name: Optional[str] = None
    cell_count: int
    elevation_relative: Optional[TerrainStatSummary] = None
    slope_deg: Optional[TerrainStatSummary] = None
    roughness_m: Optional[TerrainStatSummary] = None
    sample_points: Optional[List[Dict[str, Any]]] = None


class AnalysisSummaryItem(BaseModel):
    id: int
    target_region_id: int
    target_region_name: str
    planet: str
    created_at: str
    status: str
    candidate_count: int
    top_similarity: Optional[float] = None
