from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AnalysisRunRequest(BaseModel):
    target_region_id: int
    earth_search_area_ids: Optional[List[int]] = None
    features: Optional[List[str]] = ["elevation_relative", "slope_deg", "roughness_m"]
    weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = 0.0
    top_k: Optional[int] = 20


class ImageSearchRequest(BaseModel):
    image_base64: str
    filename: Optional[str] = "orbital_image.png"
    target_body: Optional[str] = "Mars"
    ground_resolution_m: Optional[float] = 6.0


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
    visual_search_info: Optional[Dict[str, Any]] = None
    created_at: str
    completed_at: Optional[str] = None
    candidate_count: int
    candidates: List[CandidateMatchResponse]


class AnalysisSummaryItem(BaseModel):
    id: int
    target_region_id: int
    target_region_name: str
    planet: str
    created_at: str
    status: str
    candidate_count: int
    top_similarity: Optional[float] = None


class BenchmarkValidationResponse(BaseModel):
    timestamp: str
    model_name: str
    features: List[str]
    benchmark_evaluations: List[Dict[str, Any]]
    metrics_summary: Dict[str, Any]
    statistical_power_note: str

