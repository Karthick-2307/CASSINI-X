import numpy as np
from scipy import ndimage
from typing import Dict, Any, List, Tuple, Optional


def compute_degree_scales(lat_deg: float, planet_radius_m: float) -> Tuple[float, float]:
    """
    Computes metric ground distances per degree on a planetary body.
    Returns: (meters_per_deg_lon, meters_per_deg_lat)
    """
    lat_rad = np.radians(lat_deg)
    m_per_deg_lat = (np.pi * planet_radius_m) / 180.0
    m_per_deg_lon = (np.pi * planet_radius_m * np.cos(lat_rad)) / 180.0
    return float(m_per_deg_lon), float(m_per_deg_lat)


def compute_horn_slope(dem: np.ndarray, cell_size_m: float) -> np.ndarray:
    """
    Computes terrain slope in degrees using Horn's 3x3 finite-difference method.
    """
    # Horn's kernels
    kernel_x = np.array([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ], dtype=np.float64) / (8.0 * cell_size_m)

    kernel_y = np.array([
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
    ], dtype=np.float64) / (8.0 * cell_size_m)

    dz_dx = ndimage.convolve(dem, kernel_x, mode="nearest")
    dz_dy = ndimage.convolve(dem, kernel_y, mode="nearest")

    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    slope_deg = np.degrees(slope_rad)
    return slope_deg


def compute_window_roughness(window: np.ndarray) -> float:
    """
    Computes surface roughness: standard deviation of residuals after removing
    the least-squares best-fit plane z = a*x + b*y + c across valid pixels.
    """
    valid_mask = ~np.isnan(window)
    if np.sum(valid_mask) < 4:
        return 0.0

    nrows, ncols = window.shape
    y_coords, x_coords = np.indices((nrows, ncols))

    x = x_coords[valid_mask].astype(np.float64)
    y = y_coords[valid_mask].astype(np.float64)
    z = window[valid_mask].astype(np.float64)

    # Design matrix [x, y, 1]
    A = np.column_stack([x, y, np.ones_like(x)])
    try:
        plane_params, residuals, rank, s = np.linalg.lstsq(A, z, rcond=None)
        fitted_plane = A @ plane_params
        detrended = z - fitted_plane
        roughness = float(np.std(detrended))
        return roughness
    except Exception:
        return 0.0


def extract_grid_features(
    dem: np.ndarray,
    cell_size_m: float,
    window_px: int = 5,
    min_valid_fraction: float = 0.8,
    study_area_median_elev: Optional[float] = None
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Extracts fixed-scale terrain features over non-overlapping windows.

    Parameters:
      dem: 2D elevation array (with np.nan for nodata)
      cell_size_m: metric pixel size (e.g. 500m)
      window_px: window size in pixels (default 5, giving 2.5km cells at 500m)
      min_valid_fraction: minimum fraction of valid pixels (0.8)
      study_area_median_elev: median elevation of study area for relative elevation

    Returns:
      (list of cell feature dicts, summary dictionary)
    """
    valid_study_mask = ~np.isnan(dem)
    if not np.any(valid_study_mask):
        return [], {"error": "DEM contains only nodata pixels"}

    if study_area_median_elev is None:
        study_area_median_elev = float(np.median(dem[valid_study_mask]))

    # Compute Horn slope grid
    slope_grid = compute_horn_slope(dem, cell_size_m)
    # Mask out slopes where dem was NaN
    slope_grid[~valid_study_mask] = np.nan

    nrows, ncols = dem.shape
    cells: List[Dict[str, Any]] = []
    total_cells = 0
    valid_cells = 0

    cell_idx = 0
    for r in range(0, nrows - window_px + 1, window_px):
        for c in range(0, ncols - window_px + 1, window_px):
            total_cells += 1
            cell_dem = dem[r:r + window_px, c:c + window_px]
            cell_slope = slope_grid[r:r + window_px, c:c + window_px]

            valid_count = np.sum(~np.isnan(cell_dem))
            valid_frac = float(valid_count / (window_px * window_px))

            if valid_frac < min_valid_fraction:
                continue

            valid_cells += 1
            valid_elevs = cell_dem[~np.isnan(cell_dem)]
            valid_slopes = cell_slope[~np.isnan(cell_slope)]

            cell_mean_elev = float(np.mean(valid_elevs))
            cell_elev_relative = float(cell_mean_elev - study_area_median_elev)
            cell_mean_slope = float(np.mean(valid_slopes)) if len(valid_slopes) > 0 else 0.0
            cell_roughness = compute_window_roughness(cell_dem)

            cells.append({
                "cell_index": cell_idx,
                "row": r,
                "col": c,
                "elevation_relative": cell_elev_relative,
                "elevation_absolute_mean": cell_mean_elev,
                "slope_deg": cell_mean_slope,
                "roughness_m": cell_roughness,
                "valid_fraction": valid_frac,
            })
            cell_idx += 1

    coverage_frac = float(valid_cells / total_cells) if total_cells > 0 else 0.0

    summary = {
        "total_cells": total_cells,
        "valid_cells": valid_cells,
        "coverage_fraction": coverage_frac,
        "study_area_median_elevation_m": study_area_median_elev,
        "elevation_relative_mean": float(np.mean([c["elevation_relative"] for c in cells])) if cells else 0.0,
        "elevation_relative_std": float(np.std([c["elevation_relative"] for c in cells])) if cells else 0.0,
        "slope_deg_mean": float(np.mean([c["slope_deg"] for c in cells])) if cells else 0.0,
        "slope_deg_max": float(np.max([c["slope_deg"] for c in cells])) if cells else 0.0,
        "roughness_m_mean": float(np.mean([c["roughness_m"] for c in cells])) if cells else 0.0,
    }

    return cells, summary
