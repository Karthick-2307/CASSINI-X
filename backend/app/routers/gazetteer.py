import json
import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Planet, Region, TerrainFeature
from app.data.gazetteer_catalog import PLANETARY_GAZETTEER_CATALOG

router = APIRouter(prefix="/api/gazetteer", tags=["Planetary Gazetteer & Location Search"])


class GazetteerItem(BaseModel):
    id: str
    name: str
    planet: str  # Earth, Moon, Mars
    feature_type: str  # Crater, Mons, Valles, Mare, Planitia, Caldera, Desert
    lat: float
    lon: float
    diameter_km: Optional[float] = None
    elevation_approx_m: Optional[float] = None
    slope_deg: Optional[float] = None
    roughness_m: Optional[float] = None
    description: str
    is_ingested: bool
    region_id: Optional[int] = None


@router.get("/search", response_model=List[GazetteerItem])
def search_gazetteer(
    query: Optional[str] = Query(None, description="Search term for planetary feature"),
    planet: Optional[str] = Query(None, description="Filter by planet (Earth, Moon, Mars)"),
    db: Session = Depends(get_db)
):
    """
    Search planetary features across Mars, Moon, and Earth with IAU coordinates and ingestion status.
    """
    db_regions = db.query(Region).all()
    # A region is considered fully ingested if it exists and has terrain cells
    ingested_map = {}
    for r in db_regions:
        cell_count = db.query(TerrainFeature).filter(TerrainFeature.region_id == r.id).count()
        if cell_count > 0:
            ingested_map[r.name.lower()] = r.id

    results = []
    q_lower = (query or "").strip().lower()
    p_lower = (planet or "").strip().lower()

    for item in PLANETARY_GAZETTEER_CATALOG:
        if p_lower and item["planet"].lower() != p_lower:
            continue

        if q_lower:
            match_name = q_lower in item["name"].lower()
            match_type = q_lower in item["feature_type"].lower()
            match_desc = q_lower in item["description"].lower()
            if not (match_name or match_type or match_desc):
                continue

        reg_id = None
        if item.get("region_key"):
            reg_id = ingested_map.get(item["region_key"].lower())

        results.append(
            GazetteerItem(
                id=item["id"],
                name=item["name"],
                planet=item["planet"],
                feature_type=item["feature_type"],
                lat=item["lat"],
                lon=item["lon"],
                diameter_km=item.get("diameter_km"),
                elevation_approx_m=item.get("elevation_approx_m"),
                slope_deg=item.get("slope_deg"),
                roughness_m=item.get("roughness_m"),
                description=item["description"],
                is_ingested=reg_id is not None,
                region_id=reg_id
            )
        )

    return results


@router.post("/activate/{item_id}", response_model=GazetteerItem)
def activate_gazetteer_feature(item_id: str, db: Session = Depends(get_db)):
    """
    Dynamically activates/provisions any planetary gazetteer feature into the SQLite database
    so it can be used immediately as a target for vector similarity and analog discovery.
    """
    # 1. Find item in catalog
    matched = next((item for item in PLANETARY_GAZETTEER_CATALOG if item["id"] == item_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Gazetteer feature '{item_id}' not found.")

    # 2. Check if region already exists and has cells
    existing_region = (
        db.query(Region)
        .filter(Region.name == matched["name"])
        .first()
    )
    if not existing_region and matched.get("region_key"):
        existing_region = (
            db.query(Region)
            .filter(Region.name == matched["region_key"])
            .first()
        )

    if existing_region:
        cell_count = db.query(TerrainFeature).filter(TerrainFeature.region_id == existing_region.id).count()
        if cell_count > 0:
            return GazetteerItem(
                id=matched["id"],
                name=existing_region.name,
                planet=matched["planet"],
                feature_type=matched["feature_type"],
                lat=existing_region.lat,
                lon=existing_region.lon,
                diameter_km=matched.get("diameter_km"),
                elevation_approx_m=matched.get("elevation_approx_m"),
                slope_deg=matched.get("slope_deg"),
                roughness_m=matched.get("roughness_m"),
                description=matched["description"],
                is_ingested=True,
                region_id=existing_region.id
            )

    # 3. Find or ensure Planet
    planet_obj = db.query(Planet).filter(Planet.name.ilike(matched["planet"])).first()
    if not planet_obj:
        raise HTTPException(status_code=500, detail=f"Planet '{matched['planet']}' not found in database.")

    # 4. Create Region if needed
    center_lat = matched["lat"]
    center_lon = matched["lon"]
    d_km = matched.get("diameter_km", 20.0)
    delta_deg = min(max((d_km / 111.0) / 2.0, 0.1), 2.5)

    min_lon = center_lon - delta_deg
    max_lon = center_lon + delta_deg
    min_lat = max(center_lat - delta_deg, -90.0)
    max_lat = min(center_lat + delta_deg, 90.0)

    base_elev = matched.get("elevation_approx_m", 0.0)
    base_slope = matched.get("slope_deg", 5.0)
    base_rough = matched.get("roughness_m", 1.0)

    if not existing_region:
        region = Region(
            planet_id=planet_obj.id,
            name=matched["name"],
            lat=center_lat,
            lon=center_lon,
            bbox_json=json.dumps([min_lon, min_lat, max_lon, max_lat]),
            elevation_m=base_elev,
            slope_deg=base_slope,
            roughness_m=base_rough,
            description=matched["description"],
            is_curated=True,
            citation="USGS Planetary Gazetteer / IAU Nomenclature",
        )
        db.add(region)
        db.flush()
    else:
        region = existing_region

    # 5. Synthesize representative grid of TerrainFeature cells
    grid_size = 9  # 9x9 = 81 cells
    step_lat = (max_lat - min_lat) / (grid_size + 1)
    step_lon = (max_lon - min_lon) / (grid_size + 1)

    cells = []
    idx = 0
    for i in range(1, grid_size + 1):
        for j in range(1, grid_size + 1):
            c_lat = min_lat + i * step_lat
            c_lon = min_lon + j * step_lon
            # Distance from center
            dist_norm = math.sqrt(((c_lat - center_lat) / delta_deg)**2 + ((c_lon - center_lon) / delta_deg)**2)

            # Model crater rim or mountain topography variations
            is_crater = "crater" in matched["feature_type"].lower()
            if is_crater:
                # Depression at center, elevated rim near 0.8
                elev_delta = math.sin(dist_norm * math.pi) * (d_km * 12.0)
                cell_slope = max(0.5, base_slope * (0.6 + 0.8 * dist_norm))
                cell_rough = max(0.2, base_rough * (0.7 + 0.6 * dist_norm))
            else:
                elev_delta = math.cos(min(dist_norm, 1.0) * (math.pi / 2.0)) * (d_km * 8.0)
                cell_slope = max(0.5, base_slope * (1.2 - 0.4 * dist_norm))
                cell_rough = max(0.2, base_rough * (1.1 - 0.3 * dist_norm))

            cell = TerrainFeature(
                region_id=region.id,
                scale_m=500.0,
                window_px=5,
                cell_index=idx,
                lat=round(c_lat, 5),
                lon=round(c_lon, 5),
                elevation_relative=round(elev_delta, 2),
                slope_deg=round(cell_slope, 2),
                roughness_m=round(cell_rough, 3),
                valid_fraction=1.0,
                native_res_m=500.0,
                kind="derived",
                processing_params_json=json.dumps({"source": "iau_gazetteer_synthesis"})
            )
            cells.append(cell)
            idx += 1

    db.bulk_save_objects(cells)
    db.commit()

    return GazetteerItem(
        id=matched["id"],
        name=region.name,
        planet=matched["planet"],
        feature_type=matched["feature_type"],
        lat=region.lat,
        lon=region.lon,
        diameter_km=matched.get("diameter_km"),
        elevation_approx_m=matched.get("elevation_approx_m"),
        slope_deg=matched.get("slope_deg"),
        roughness_m=matched.get("roughness_m"),
        description=matched["description"],
        is_ingested=True,
        region_id=region.id
    )
