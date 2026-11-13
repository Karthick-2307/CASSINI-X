"""
Terrain visualization module for generating hillshade and slope PNG overlays.

Generates transparent RGBA PNG overlays suitable for direct MapLibre GL
image-source mapping at accurate geographic bounds.
"""

import io
import os
from typing import Tuple, Dict, Any, Optional
import numpy as np
import rasterio
from PIL import Image

from app.analysis.features import compute_horn_slope

# In-memory overlay cache to avoid recomputing identical rasters
_OVERLAY_CACHE: Dict[str, bytes] = {}


def generate_hillshade_array(
    dem: np.ndarray,
    cell_size: float = 500.0,
    azimuth_deg: float = 315.0,
    altitude_deg: float = 45.0
) -> np.ndarray:
    """
    Computes standard hillshade illumination array (0 to 255).
    """
    azimuth_rad = np.radians(360.0 - azimuth_deg + 90.0)
    altitude_rad = np.radians(altitude_deg)

    slope_deg = compute_horn_slope(dem, cell_size_m=cell_size)
    slope_rad = np.radians(slope_deg)

    # Gradient kernels for Horn's method
    kernel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]) / (8.0 * cell_size)
    kernel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]]) / (8.0 * cell_size)

    from scipy import ndimage
    dz_dx = ndimage.convolve(dem, kernel_x, mode="nearest")
    dz_dy = ndimage.convolve(dem, kernel_y, mode="nearest")

    aspect_rad = np.arctan2(dz_dy, -dz_dx)
    aspect_rad[aspect_rad < 0] += 2 * np.pi

    shaded = (
        np.sin(altitude_rad) * np.cos(slope_rad) +
        np.cos(altitude_rad) * np.sin(slope_rad) * np.cos(azimuth_rad - aspect_rad)
    )
    hillshade = np.clip(255.0 * shaded, 0, 255).astype(np.uint8)
    return hillshade


def colorize_slope_array(slope_deg: np.ndarray, max_slope_deg: float = 25.0) -> np.ndarray:
    """
    Colorize slope values (0 to max_slope_deg) using a smooth Magma/Heat color ramp in pure NumPy.
    Returns RGB uint8 array of shape (H, W, 3).
    """
    norm = np.clip(slope_deg / max_slope_deg, 0.0, 1.0)

    # 4-stop color ramp:
    # 0.0 -> Deep violet [40, 15, 60]
    # 0.33 -> Magenta [140, 30, 95]
    # 0.66 -> Orange/Red [230, 80, 40]
    # 1.0 -> Yellow/White [255, 230, 100]
    c0 = np.array([40, 15, 60], dtype=float)
    c1 = np.array([140, 30, 95], dtype=float)
    c2 = np.array([230, 80, 40], dtype=float)
    c3 = np.array([255, 230, 100], dtype=float)

    rgb = np.zeros((slope_deg.shape[0], slope_deg.shape[1], 3), dtype=np.uint8)

    # Segment 1: [0, 0.33]
    m1 = norm <= 0.33
    t1 = (norm[m1] / 0.33)[..., None]
    rgb[m1] = np.clip(c0 + t1 * (c1 - c0), 0, 255).astype(np.uint8)

    # Segment 2: (0.33, 0.66]
    m2 = (norm > 0.33) & (norm <= 0.66)
    t2 = ((norm[m2] - 0.33) / 0.33)[..., None]
    rgb[m2] = np.clip(c1 + t2 * (c2 - c1), 0, 255).astype(np.uint8)

    # Segment 3: (0.66, 1.0]
    m3 = norm > 0.66
    t3 = ((norm[m3] - 0.66) / 0.34)[..., None]
    rgb[m3] = np.clip(c2 + t3 * (c3 - c2), 0, 255).astype(np.uint8)

    return rgb


def render_hillshade_png(tif_path: str) -> bytes:
    """
    Renders hillshade overlay as PNG bytes with alpha transparency on nodata.
    """
    cache_key = f"hillshade_{tif_path}"
    if cache_key in _OVERLAY_CACHE:
        return _OVERLAY_CACHE[cache_key]

    with rasterio.open(tif_path) as src:
        dem = src.read(1)
        nodata = src.nodata
        if nodata is not None:
            dem = np.where(dem == nodata, np.nan, dem)

    valid_mask = ~np.isnan(dem)
    filled_dem = np.where(valid_mask, dem, np.nanmedian(dem))

    hs = generate_hillshade_array(filled_dem, cell_size=500.0)

    rgba = np.zeros((hs.shape[0], hs.shape[1], 4), dtype=np.uint8)
    rgba[..., 0] = hs
    rgba[..., 1] = hs
    rgba[..., 2] = hs
    rgba[..., 3] = np.where(valid_mask, 210, 0).astype(np.uint8)

    img = Image.fromarray(rgba, "RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    _OVERLAY_CACHE[cache_key] = png_bytes
    return png_bytes


def render_slope_png(tif_path: str) -> bytes:
    """
    Renders slope overlay as colorized PNG bytes with alpha transparency on nodata.
    """
    cache_key = f"slope_{tif_path}"
    if cache_key in _OVERLAY_CACHE:
        return _OVERLAY_CACHE[cache_key]

    with rasterio.open(tif_path) as src:
        dem = src.read(1)
        nodata = src.nodata
        if nodata is not None:
            dem = np.where(dem == nodata, np.nan, dem)

    valid_mask = ~np.isnan(dem)
    filled_dem = np.where(valid_mask, dem, np.nanmedian(dem))

    slope_deg = compute_horn_slope(filled_dem, cell_size_m=500.0)
    rgb = colorize_slope_array(slope_deg, max_slope_deg=25.0)

    rgba = np.zeros((slope_deg.shape[0], slope_deg.shape[1], 4), dtype=np.uint8)
    rgba[..., 0:3] = rgb
    rgba[..., 3] = np.where(valid_mask, 195, 0).astype(np.uint8)

    img = Image.fromarray(rgba, "RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    _OVERLAY_CACHE[cache_key] = png_bytes
    return png_bytes


def get_raster_bounds_info(tif_path: str) -> Dict[str, Any]:
    """
    Extracts geographic bounds and MapLibre image coordinate quadruplet.
    """
    with rasterio.open(tif_path) as src:
        bounds = src.bounds
        left, bottom, right, top = bounds.left, bounds.bottom, bounds.right, bounds.top

    return {
        "bbox": [left, bottom, right, top],
        "coordinates": [
            [left, top],      # top-left
            [right, top],     # top-right
            [right, bottom],  # bottom-right
            [left, bottom]    # bottom-left
        ],
        "center": [(left + right) / 2.0, (bottom + top) / 2.0]
    }
