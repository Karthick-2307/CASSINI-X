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
logger = logging.getLogger("astra-x.ingest.moon")

USGS_LOLA_GLOBAL_COG = "https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif"

MOON_STUDY_AREAS = {
    "tranquillitatis": {
        "name": "Mare Tranquillitatis (Apollo 11 Basin)",
        "center_lat": 8.5,
        "center_lon": 31.4,
        "bbox_deg": [30.6, 7.7, 32.2, 9.3],
        "citation": "NASA Apollo 11 Lunar Exploration Site (Mare Tranquillitatis)",
        "notes": "Approximate, verify against source. Flat basaltic lunar maria plain.",
        "description": "Smooth basaltic mare surface with low slope gradients, micro-impact craters, and titanium-rich lunar regolith."
    },
    "shackleton": {
        "name": "Shackleton Crater & South Pole Rim",
        "center_lat": -89.7,
        "center_lon": 0.0,
        "bbox_deg": [-10.0, -89.95, 10.0, -89.45],
        "citation": "NASA Artemis Polar Exploration Candidate (Lunar South Pole)",
        "notes": "Approximate, verify against source. Permanently shadowed impact crater interior.",
        "description": "Deep south polar impact crater with illuminated rim plateaus and cold-trapped volatile storage within shadowed floors."
    }
}


def ingest_moon_region(region_key: str = "tranquillitatis", local_file: Optional[str] = None):
    db = SessionLocal()
    try:
        if region_key not in MOON_STUDY_AREAS:
            raise ValueError(f"Unknown region '{region_key}'. Choose from: {list(MOON_STUDY_AREAS.keys())}")

        cfg = MOON_STUDY_AREAS[region_key]
        planet = get_planet_by_name(db, "Moon")

        # 1. Register or get Dataset in DB
        dataset_name = "LRO LOLA Global Digital Elevation Model (118m)"
        dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
        if not dataset:
            dataset = Dataset(
                planet_id=planet.id,
                name=dataset_name,
                source="NASA PDS / USGS Astrogeology Science Center",
                url="https://astrogeology.usgs.gov/search/map/moon_lro_lola_dem_118m",
                resolution_m=118.0,
                crs="SimpleCylindrical Moon (Sphere R=1737400m)",
                units="meters (relative to lunar sphere R=1737400m)",
                acquisition_date="2009–2013 (Lunar Reconnaissance Orbiter LOLA)",
                processing_steps="Global 256 pixel/degree DEM cropped to study extent and resampled to 500m analysis metric grid.",
                licence="Public Domain (NASA / USGS)",
                status="active"
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

        # 2. Read Crop Window from Official USGS COG or Local File
        source_uri = local_file if local_file and os.path.exists(local_file) else f"/vsicurl/{USGS_LOLA_GLOBAL_COG}"
        logger.info(f"Opening Moon LOLA raster from: {source_uri}")

        with rasterio.open(source_uri) as src:
            # Moon projected coordinates: SimpleCylindrical with R=1737400m
            r_moon_proj = 1737400.0
            min_lon, min_lat, max_lon, max_lat = cfg["bbox_deg"]

            proj_left = np.radians(min_lon) * r_moon_proj
            proj_bottom = np.radians(min_lat) * r_moon_proj
            proj_right = np.radians(max_lon) * r_moon_proj
            proj_top = np.radians(max_lat) * r_moon_proj

            window = from_bounds(proj_left, proj_bottom, proj_right, proj_top, src.transform)
            data = src.read(1, window=window).astype(np.float64)
            # Mask nodata values
            nodata_val = src.nodata or -32768.0
            data[data <= nodata_val] = np.nan

        logger.info(f"Read Moon raw window shape: {data.shape}, min: {np.nanmin(data):.1f}m, max: {np.nanmax(data):.1f}m")

        # 3. Resample to 500m metric scale
        # Native resolution is ~118m, so resample factor is 118.0 / 500.0
        zoom_factor = 118.0 / 500.0
        resampled_500m = zoom(data, zoom_factor, order=1)

        # 4. Save processed GeoTIFF
        out_tif = os.path.join(PROCESSED_DIR, f"moon_{region_key}_500m.tif")
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
            native_res_m=118.0,
            citation=cfg["citation"],
            notes=cfg["notes"],
            description=cfg["description"],
            window_px=5
        )
        logger.info(f"Successfully completed Moon ingestion for '{region.name}'!")
        return region
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Moon LOLA elevation dataset")
    parser.add_argument("--region", default="tranquillitatis", choices=list(MOON_STUDY_AREAS.keys()), help="Target Moon study region")
    parser.add_argument("--file", default=None, help="Optional local GeoTIFF path")
    args = parser.parse_args()
    ingest_moon_region(args.region, args.file)

