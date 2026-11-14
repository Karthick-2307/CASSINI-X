from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


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

