import os
import argparse
import logging
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from scipy.ndimage import zoom
from typing import Optional

from app.db import SessionLocal
from app.models import Dataset
from app.ingest.common import (
    ensure_processed_dir,
    get_planet_by_name,
    save_processed_geotiff,
    store_region_and_features,
    PROCESSED_DIR
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("astra-x.ingest.mars")

USGS_MOLA_GLOBAL_COG = "https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif"

MARS_STUDY_AREAS = {
    "jezero": {
        "name": "Jezero Crater Floor & Delta",
        "center_lat": 18.38,
        "center_lon": 77.58,
        # Bounding box in Equirectangular projection coordinates (~50km x 50km)
        "bbox_deg": [77.15, 17.95, 78.01, 18.81],
        "citation": "NASA Mars 2020 Perseverance Rover Exploration Zone (Isidis Planitia margin)",
        "notes": "Approximate, verify against source. Ancient river delta and crater floor.",
        "description": "Perseverance landing site featuring clay-bearing deltaic fan sediments, crater floor fractured terrains, and volcanic units."
    },
    "olympus": {
        "name": "Olympus Mons Caldera Rim",
        "center_lat": 18.65,
        "center_lon": -133.8,  # or 226.2 E
        "bbox_deg": [-134.25, 18.25, -133.35, 19.05],
        "citation": "USGS Astrogeology Mars Geologic Investigation (Tharsis Volcanic Province)",
        "notes": "Approximate, verify against source. Massive basaltic shield volcano caldera.",
        "description": "Central caldera complex and summit basaltic collapse pits of the solar system's largest shield volcano."
    }
}


def ingest_mars_region(region_key: str = "jezero", local_file: Optional[str] = None):
    db = SessionLocal()
    try:
        if region_key not in MARS_STUDY_AREAS:
            raise ValueError(f"Unknown region '{region_key}'. Choose from: {list(MARS_STUDY_AREAS.keys())}")

        cfg = MARS_STUDY_AREAS[region_key]
        planet = get_planet_by_name(db, "Mars")

        # 1. Register or get Dataset in DB
        dataset_name = "MGS MOLA MEGDR Global DEM (463m)"
        dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
        if not dataset:
            dataset = Dataset(
                planet_id=planet.id,
                name=dataset_name,
                source="NASA PDS / USGS Astrogeology Science Center",
                url="https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m",
                resolution_m=463.0,
                crs="Equirectangular Mars (Sphere R=3396190m)",
                units="meters (relative to Martian datum)",
                acquisition_date="1999–2001 (Mars Global Surveyor MOLA)",
                processing_steps="Global 128 pixel/degree DEM cropped to study extent and resampled to 500m analysis metric grid.",
                licence="Public Domain (NASA / USGS)",
                status="active"
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

        # 2. Read Crop Window from Official USGS COG or Local File
        source_uri = local_file if local_file and os.path.exists(local_file) else f"/vsicurl/{USGS_MOLA_GLOBAL_COG}"
        logger.info(f"Opening Mars MOLA raster from: {source_uri}")

        with rasterio.open(source_uri) as src:
            # Mars projection coordinates: transform degree bounds into projected coordinates
            # MOLA Equirectangular uses R=3396190: x = R * rad(lon), y = R * rad(lat)
            r_mars_proj = 3396190.0
            min_lon, min_lat, max_lon, max_lat = cfg["bbox_deg"]

            proj_left = np.radians(min_lon) * r_mars_proj
            proj_bottom = np.radians(min_lat) * r_mars_proj
            proj_right = np.radians(max_lon) * r_mars_proj
            proj_top = np.radians(max_lat) * r_mars_proj

            window = from_bounds(proj_left, proj_bottom, proj_right, proj_top, src.transform)
            data = src.read(1, window=window).astype(np.float64)
            # Mask nodata values
            nodata_val = src.nodata or -32768.0
            data[data <= nodata_val] = np.nan

        logger.info(f"Read Mars raw window shape: {data.shape}, min: {np.nanmin(data):.1f}m, max: {np.nanmax(data):.1f}m")

        # 3. Resample to 500m metric scale
        # Native resolution is ~463m, so resample factor is 463.0 / 500.0
        zoom_factor = 463.0 / 500.0
        resampled_500m = zoom(data, zoom_factor, order=1)

        # 4. Save processed GeoTIFF
        out_tif = os.path.join(PROCESSED_DIR, f"mars_{region_key}_500m.tif")
        save_processed_geotiff(
            data=resampled_500m,
            out_path=out_tif,
            top_left_x=min_lon,
            top_left_y=max_lat,
            pixel_size_x=(max_lon - min_lon) / resampled_500m.shape[1],
            pixel_size_y=(max_lat - min_lat) / resampled_500m.shape[0],
            crs="EPSG:4326"
        )
        dataset.local_path = out_tif
        db.commit()

        # 5. Store Region and Extract Features
        region = store_region_and_features(
            db=db,
            planet_id=planet.id,
            region_name=cfg["name"],
            center_lat=cfg["center_lat"],
            center_lon=cfg["center_lon"],
            bbox=cfg["bbox_deg"],
            dem_resampled_500m=resampled_500m,
            cell_size_m=500.0,
            source_dataset_id=dataset.id,
            native_res_m=463.0,
            citation=cfg["citation"],
            notes=cfg["notes"],
            description=cfg["description"],
            window_px=5
        )
        logger.info(f"Successfully completed Mars ingestion for '{region.name}'!")
        return region
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Mars MOLA elevation dataset")
    parser.add_argument("--region", default="jezero", choices=list(MARS_STUDY_AREAS.keys()), help="Target Mars study region")
    parser.add_argument("--file", default=None, help="Optional local GeoTIFF path")
    args = parser.parse_args()
    ingest_mars_region(args.region, args.file)

