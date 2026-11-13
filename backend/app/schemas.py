from typing import Optional
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


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail
