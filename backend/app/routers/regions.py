import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import numpy as np

from app.db import get_db
from app.models import Planet, Region, TerrainFeature
from app.analysis.visualize import render_hillshade_png, render_slope_png, get_raster_bounds_info
from app.schemas import (
    RegionResponse,
    TerrainSummaryResponse,
    TerrainBoundsResponse,
    BboxSampleRequest,
    BboxSampleResponse,
    TerrainStatSummary,
    ResourceIntelligenceResponse,
    ResourceComparisonRequest,
    ResourceComparisonResponse,
)

router = APIRouter(tags=["Planetary Regions & Terrain"])


@router.get("/api/regions", response_model=List[RegionResponse])
def get_regions(planet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Region)
    if planet_id is not None:
        query = query.filter(Region.planet_id == planet_id)
    return query.order_by(Region.id).all()


@router.get("/api/regions/{region_id}", response_model=RegionResponse)
def get_region_by_id(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region with id {region_id} not found.")
    return region


@router.get("/api/terrain/{region_id}", response_model=TerrainSummaryResponse, tags=["Terrain Intelligence"])
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


@router.get("/api/terrain/{region_id}/bounds", response_model=TerrainBoundsResponse, tags=["Terrain Intelligence"])
def get_terrain_bounds(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if dataset and dataset.local_path and os.path.exists(dataset.local_path):
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

    # Fallback bounds from region metadata
    try:
        b = json.loads(region.bbox_json) if region.bbox_json else [region.lon - 0.5, region.lat - 0.5, region.lon + 0.5, region.lat + 0.5]
    except Exception:
        b = [region.lon - 0.5, region.lat - 0.5, region.lon + 0.5, region.lat + 0.5]

    return TerrainBoundsResponse(
        region_id=region.id,
        name=region.name,
        planet=region.planet.name if region.planet else "Unknown",
        bbox=[b[0], b[1], b[2], b[3]],
        coordinates=[[b[0], b[3]], [b[2], b[3]], [b[2], b[1]], [b[0], b[1]]],
        center=[region.lon, region.lat],
        dataset_name=dataset.name if dataset else "USGS / IAU Planetary Nomenclature",
        resolution_m=dataset.resolution_m if dataset else 500.0,
        source=dataset.source if dataset else "NASA / USGS Astrogeology"
    )


@router.get("/api/terrain/{region_id}/hillshade.png", tags=["Terrain Intelligence"])
def get_terrain_hillshade(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail=f"No local raster data available for region '{region.name}'.")

    png_bytes = render_hillshade_png(dataset.local_path)
    return Response(content=png_bytes, media_type="image/png")


@router.get("/api/terrain/{region_id}/slope.png", tags=["Terrain Intelligence"])
def get_terrain_slope(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")
    dataset = region.source_dataset
    if not dataset or not dataset.local_path or not os.path.exists(dataset.local_path):
        raise HTTPException(status_code=404, detail=f"No local raster data available for region '{region.name}'.")

    png_bytes = render_slope_png(dataset.local_path)
    return Response(content=png_bytes, media_type="image/png")


@router.post("/api/terrain/sample-bbox", response_model=BboxSampleResponse, tags=["Terrain Intelligence"])
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


@router.get("/api/resources/{region_id}", response_model=ResourceIntelligenceResponse, tags=["Geological & Resource Intelligence"])
def get_resource_intelligence(region_id: int, db: Session = Depends(get_db)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region {region_id} not found.")

    planet_name = region.planet.name if region.planet else "Unknown"
    from app.ingest.spectral_base import get_provider_for_planet
    provider = get_provider_for_planet(planet_name)

    return ResourceIntelligenceResponse(
        region_id=region.id,
        region_name=region.name,
        planet=planet_name,
        status="no_data_ingested",
        observed_evidence=[],
        derived_indices=[],
        inferred_resources=[],
        water_ice_status="No water-ice dataset ingested",
        available_provider={
            "provider_id": provider.provider_id,
            "name": provider.name,
            "instrument": provider.instrument,
            "product_level": provider.product_level,
            "status": provider.status,
            "portal_url": provider.portal_url,
            "file_size_warning": provider.file_size_warning,
            "credentials_required": provider.credentials_required
        } if provider else None,
        ingest_instructions=provider.get_ingest_instructions() if provider else None
    )


@router.post("/api/resources/compare", response_model=ResourceComparisonResponse, tags=["Geological & Resource Intelligence"])
def compare_surface_materials(req: ResourceComparisonRequest, db: Session = Depends(get_db)):
    reg_a = db.query(Region).filter(Region.id == req.region_a_id).first()
    reg_b = db.query(Region).filter(Region.id == req.region_b_id).first()
    if not reg_a or not reg_b:
        raise HTTPException(status_code=404, detail="One or both regions not found.")

    warning = (
        "Surface material comparison is restricted to verified coincident spectral bands. "
        "Cross-instrument mineral comparisons between CRISM (Mars), M3 (Moon), and EMIT (Earth) "
        "require rigorous radiative transfer and spectral resampling harmonisation. "
        "No spectral cubes are currently ingested for these regions."
    )
    return ResourceComparisonResponse(
        region_a_name=reg_a.name,
        region_b_name=reg_b.name,
        common_features=[],
        harmonisation_warning=warning
    )

