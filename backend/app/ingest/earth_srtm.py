import os
import gzip
import io
import argparse
import logging
import urllib.request
import numpy as np
import rasterio
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
logger = logging.getLogger("astra-x.ingest.earth")

# 4 Curated Earth Search Areas (Section 4.3)
EARTH_STUDY_AREAS = {
    "lanzarote": {
        "name": "Lanzarote Volcanic Field",
        "center_lat": 29.05,
        "center_lon": -13.65,
        "tile": "N29W014",
        "bbox": [-13.9, 28.8, -13.4, 29.3],
        "citation": "ESA PANGAEA Planetary Analog Programme (Canary Islands, Spain)",
        "notes": "Approximate, verify against source. Basaltic lava tubes and arid volcanic ash plains.",
        "description": "Lanzarote basaltic lava flow networks, hornitos, and lava tubes analogous to lunar and Martian volcanic plains."
    },
    "atacama": {
        "name": "Atacama Yungay Basin",
        "center_lat": -24.0,
        "center_lon": -69.5,
        "tile": "S24W070",
        "bbox": [-70.0, -24.5, -69.0, -23.5],
        "citation": "NASA ASTEP and Mars Analog Field Research (Antofagasta, Chile)",
        "notes": "Approximate, verify against source. Hyper-arid desert soil analog.",
        "description": "Hyper-arid desert floor with evaporite crusts and minimal soil moisture analogous to desiccated Martian basins."
    },
    "hawaii": {
        "name": "Mauna Kea & Kilauea Flanks",
        "center_lat": 19.5,
        "center_lon": -155.5,
        "tile": "N19W156",
        "bbox": [-156.0, 19.0, -155.0, 20.0],
        "citation": "NASA HI-SEAS & PISCES Field Programs (Hawaii, USA)",
        "notes": "Approximate, verify against source. High-altitude basaltic tephra and aa flows.",
        "description": "High-altitude basaltic volcanic regolith, cinder cones, and lava flow fields analogous to Martian shield volcanism."
    },
    "haughton": {
        "name": "Haughton Impact Structure (Devon Island)",
        "center_lat": 75.38,
        "center_lon": -89.67,
        "tile": "N75W090",
        "bbox": [-90.2, 75.1, -89.1, 75.6],
        "citation": "NASA Haughton-Mars Project (Devon Island, Nunavut, Canada)",
        "notes": "Approximate, verify against source. Polar desert impact crater analog.",
        "description": "Devon Island polar desert impact crater with shatter cones, permafrost polygons, and paleolake deposits."
    }
}


def download_or_read_hgt(tile_name: str, local_file: Optional[str] = None) -> np.ndarray:
    """
    Downloads and decodes 1-arc-second SRTM HGT tile (3601 x 3601, 16-bit signed big-endian).
    """
    if local_file and os.path.exists(local_file):
        logger.info(f"Reading local SRTM tile: {local_file}")
        with open(local_file, "rb") as f:
            content = f.read()
    else:
        # Fetch from open AWS Terrain Tiles
        lat_prefix = tile_name[0:3]  # e.g. N29
        url = f"https://elevation-tiles-prod.s3.amazonaws.com/skadi/{lat_prefix}/{tile_name}.hgt.gz"
        logger.info(f"Downloading open SRTM tile from: {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "ASTRA-X/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            compressed = resp.read()
        content = gzip.decompress(compressed)

    # 1-arc-second HGT tiles are exactly 3601 x 3601 int16 big-endian
    data = np.frombuffer(content, dtype=">i2").reshape((3601, 3601)).astype(np.float64)
    # Void values in SRTM are -32768
    data[data <= -32768] = np.nan
    data[data < -500] = np.nan
    return data


def ingest_earth_region(region_key: str = "lanzarote", local_file: Optional[str] = None):
    db = SessionLocal()
    try:
        if region_key not in EARTH_STUDY_AREAS:
            raise ValueError(f"Unknown region '{region_key}'. Choose from: {list(EARTH_STUDY_AREAS.keys())}")

        cfg = EARTH_STUDY_AREAS[region_key]
        planet = get_planet_by_name(db, "Earth")

        # 1. Register or get Dataset in DB
        dataset_name = "SRTM 1-Arc-Second Global DEM"
        dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
        if not dataset:
            dataset = Dataset(
                planet_id=planet.id,
                name=dataset_name,
                source="USGS / NASA / NGA / AWS Open Terrain Tiles",
                url="https://registry.opendata.aws/terrain-tiles/",
                resolution_m=30.0,
                crs="EPSG:4326 (WGS84)",
                units="meters",
                acquisition_date="February 2000 (SRTM / Skadi v1)",
                processing_steps="AWS Skadi HGT 1-arc-second void-filled, cropped and resampled to 500m analysis metric grid.",
                licence="Public Domain / Open Data",
                status="active"
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

        # 2. Read Elevation Data
        hgt_data = download_or_read_hgt(cfg["tile"], local_file)

        # 3. Resample to 500m metric scale
        # At 30m resolution, 500m resolution corresponds to a ~16x zoom-out factor
        zoom_factor = 30.0 / 500.0
        resampled_500m = zoom(hgt_data, zoom_factor, order=1)

        # 4. Save processed GeoTIFF
        out_tif = os.path.join(PROCESSED_DIR, f"earth_{region_key}_500m.tif")
        save_processed_geotiff(
            data=resampled_500m,
            out_path=out_tif,
            top_left_x=cfg["bbox"][0],
            top_left_y=cfg["bbox"][3],
            pixel_size_x=(cfg["bbox"][2] - cfg["bbox"][0]) / resampled_500m.shape[1],
            pixel_size_y=(cfg["bbox"][3] - cfg["bbox"][1]) / resampled_500m.shape[0],
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
            bbox=cfg["bbox"],
            dem_resampled_500m=resampled_500m,
            cell_size_m=500.0,
            source_dataset_id=dataset.id,
            native_res_m=30.0,
            citation=cfg["citation"],
            notes=cfg["notes"],
            description=cfg["description"],
            window_px=5
        )
        logger.info(f"Successfully completed Earth ingestion for '{region.name}'!")
        return region
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Earth SRTM elevation dataset")
    parser.add_argument("--region", default="lanzarote", choices=list(EARTH_STUDY_AREAS.keys()), help="Target Earth study region")
    parser.add_argument("--file", default=None, help="Optional local HGT or GeoTIFF path")
    args = parser.parse_args()
    ingest_earth_region(args.region, args.file)
