import os
import json
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import rasterio
from rasterio.transform import from_origin
from rasterio.windows import from_bounds
from rasterio.enums import Resampling
from sqlalchemy.orm import Session

from app.models import Dataset, Region, TerrainFeature, Planet
from app.analysis.features import extract_grid_features, compute_degree_scales

logger = logging.getLogger("astra-x.ingest")
PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed"))


def ensure_processed_dir():
    os.makedirs(PROCESSED_DIR, exist_ok=True)


def get_planet_by_name(db: Session, name: str) -> Planet:
    planet = db.query(Planet).filter(Planet.name == name).first()
    if not planet:
        raise ValueError(f"Planet '{name}' not found in database. Seed factual data first.")
    return planet


def save_processed_geotiff(
    data: np.ndarray,
    out_path: str,
    top_left_x: float,
    top_left_y: float,
    pixel_size_x: float,
    pixel_size_y: float,
    crs: str = "EPSG:4326",
    nodata: float = -9999.0
):
    """
    Saves a 2D float32 elevation array to a GeoTIFF in backend/data/processed/.
    """
    ensure_processed_dir()
    transform = from_origin(top_left_x, top_left_y, pixel_size_x, pixel_size_y)
    out_data = np.nan_to_num(data, nan=nodata).astype(np.float32)

    with rasterio.open(
        out_path,
        "w",
        driver="GTiff",
        height=data.shape[0],
        width=data.shape[1],
        count=1,
        dtype=np.float32,
        crs=crs,
        transform=transform,
        nodata=nodata,
    ) as dst:
        dst.write(out_data, 1)

    logger.info(f"Saved processed DEM GeoTIFF to: {out_path}")


def store_region_and_features(
    db: Session,
    planet_id: int,
    region_name: str,
    center_lat: float,
    center_lon: float,
    bbox: List[float],
    dem_resampled_500m: np.ndarray,
    cell_size_m: float,
    source_dataset_id: int,
    native_res_m: float,
    citation: str,
    notes: str,
    description: str,
    window_px: int = 5
) -> Region:
    """
    Registers a region, extracts 5x5 fixed-scale terrain features,
    and inserts rows into regions and terrain_features tables.
    """
    # 1. Check if region already exists
    region = db.query(Region).filter(Region.name == region_name).first()
    if not region:
        region = Region(
            planet_id=planet_id,
            name=region_name,
            lat=center_lat,
            lon=center_lon,
            bbox_json=json.dumps(bbox),
            source_dataset_id=source_dataset_id,
            description=description,
            is_curated=True,
            citation=citation,
            notes=notes
        )
        db.add(region)
        db.commit()
        db.refresh(region)

    # 2. Extract terrain features
    cells, summary = extract_grid_features(
        dem=dem_resampled_500m,
        cell_size_m=cell_size_m,
        window_px=window_px,
        min_valid_fraction=0.8
    )

    # Update summary values in region
    region.elevation_m = summary.get("study_area_median_elevation_m")
    region.slope_deg = summary.get("slope_deg_mean")
    region.roughness_m = summary.get("roughness_m_mean")
    db.commit()

    # 3. Clear any existing features for this region to prevent duplicates
    db.query(TerrainFeature).filter(TerrainFeature.region_id == region.id).delete()

    # 4. Insert cell-level features
    feature_records = []
    for c in cells:
        feature_records.append(
            TerrainFeature(
                region_id=region.id,
                scale_m=cell_size_m,
                window_px=window_px,
                cell_index=c["cell_index"],
                elevation_relative=c["elevation_relative"],
                slope_deg=c["slope_deg"],
                roughness_m=c["roughness_m"],
                valid_fraction=c["valid_fraction"],
                native_res_m=native_res_m,
                kind="derived",
                processing_params_json=json.dumps({
                    "window_px": window_px,
                    "cell_size_m": cell_size_m,
                    "study_median_elev_m": summary.get("study_area_median_elevation_m")
                })
            )
        )
    if feature_records:
        db.bulk_save_objects(feature_records)
        db.commit()

    logger.info(
        f"Region '{region_name}' extracted {len(cells)} valid cells "
        f"(coverage: {summary.get('coverage_fraction', 0)*100:.1f}%)."
    )
    return region
