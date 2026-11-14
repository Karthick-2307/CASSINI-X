from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class SpectralEvidenceItem(BaseModel):
    dataset: str
    product: str
    kind: str  # "observed" | "derived" | "inferred"
    citation: str
    description: str
    confidence_note: Optional[str] = None
    inference_rule: Optional[str] = None


class ResourceIntelligenceResponse(BaseModel):
    region_id: int
    region_name: str
    planet: str
    status: str  # "no_data_ingested" | "ingested"
    observed_evidence: List[SpectralEvidenceItem]
    derived_indices: List[SpectralEvidenceItem]
    inferred_resources: List[SpectralEvidenceItem]
    water_ice_status: str
    available_provider: Optional[Dict[str, Any]] = None
    ingest_instructions: Optional[Dict[str, Any]] = None


class ResourceComparisonRequest(BaseModel):
    region_a_id: int
    region_b_id: int


class ResourceComparisonResponse(BaseModel):
    region_a_name: str
    region_b_name: str
    common_features: List[Dict[str, Any]]
    harmonisation_warning: str


class LandingScreeningRequest(BaseModel):
    region_id: int
    max_slope_deg: float = 10.0
    max_roughness_m: float = 5.0
    min_elevation_m: Optional[float] = None
    max_elevation_m: Optional[float] = None


class LandingScreeningResponse(BaseModel):
    region_id: int
    region_name: str
    planet: str
    total_cells: int
    passing_cells: int
    pass_fraction: float
    mission_suitability_score: float
    criteria_breakdown: Dict[str, Any]
    flagged_hazards: List[Dict[str, Any]]
    environmental_factors: Dict[str, str]
    disclaimer_banner: str


class RoutePlanRequest(BaseModel):
    region_id: int
    start_coords: List[float]  # [lon, lat]
    goal_coords: List[float]   # [lon, lat]
    optimization_mode: Optional[str] = "balanced"  # shortest, safest, balanced
    max_slope_deg: Optional[float] = 25.0


class RouteOptionItem(BaseModel):
    route_id: Optional[int] = None
    name: str
    mode: str
    coordinates: List[List[float]]
    elevation_profile: List[Dict[str, float]]
    length_m: float
    total_ascent_m: float
    total_descent_m: float
    max_slope_deg: float
    mean_slope_deg: float
    difficulty_score: float


class RoutePlanResponse(BaseModel):
    status: str
    message: str
    routes: List[RouteOptionItem]
    impassable_zones_count: int

