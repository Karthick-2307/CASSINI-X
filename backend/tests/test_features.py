import pytest
import numpy as np
from app.analysis.features import (
    compute_horn_slope,
    compute_window_roughness,
    extract_grid_features,
    compute_degree_scales,
)


def test_flat_plane_features():
    """Flat plane: slope = 0 deg, roughness = 0 m."""
    cell_size = 500.0
    flat_dem = np.full((10, 10), 1250.0, dtype=np.float64)

    slopes = compute_horn_slope(flat_dem, cell_size)
    # Inner region away from boundaries should have slope exactly 0
    assert np.allclose(slopes[2:8, 2:8], 0.0, atol=1e-5)

    roughness = compute_window_roughness(flat_dem[:5, :5])
    assert np.isclose(roughness, 0.0, atol=1e-5)


def test_tilted_plane_slope_and_roughness():
    """Tilted plane of known angle: slope equals that angle, roughness = 0."""
    cell_size = 100.0  # 100 meters per pixel
    target_slope_deg = 15.0
    slope_rad = np.radians(target_slope_deg)
    dz_per_pixel = cell_size * np.tan(slope_rad)

    # Elevation increases by dz_per_pixel for each row (y direction)
    nrows, ncols = 15, 15
    y_coords, _ = np.indices((nrows, ncols))
    tilted_dem = y_coords * dz_per_pixel

    slopes = compute_horn_slope(tilted_dem, cell_size)
    # Inner pixels should match the target slope of 15 degrees
    inner_slopes = slopes[2:-2, 2:-2]
    assert np.allclose(inner_slopes, target_slope_deg, atol=0.1)

    # Detrended plane roughness on a true plane must be 0
    window = tilted_dem[:5, :5]
    roughness = compute_window_roughness(window)
    assert np.isclose(roughness, 0.0, atol=1e-4)


def test_plane_with_known_noise_roughness():
    """Plane plus known Gaussian noise: roughness matches noise std."""
    np.random.seed(42)
    nrows, ncols = 10, 10
    target_noise_std = 7.5

    # Tilted baseline + known gaussian noise
    y_coords, x_coords = np.indices((nrows, ncols))
    plane = 2.0 * x_coords + 3.0 * y_coords + 100.0
    noise = np.random.normal(loc=0.0, scale=target_noise_std, size=(nrows, ncols))
    noisy_dem = plane + noise

    roughness = compute_window_roughness(noisy_dem)
    # Measured roughness should be close to the generated noise standard deviation
    assert np.isclose(roughness, target_noise_std, rtol=0.2)


def test_nodata_handling_threshold():
    """Cells with valid_fraction below 0.8 are excluded."""
    cell_size = 500.0
    dem = np.full((10, 10), 100.0, dtype=np.float64)

    # In top-left 5x5 cell, inject 6 NaNs out of 25 pixels (2x3 block in first cell) -> valid_fraction = 19/25 = 0.76 (< 0.8)
    dem[0:2, 0:3] = np.nan

    cells, summary = extract_grid_features(
        dem=dem,
        cell_size_m=cell_size,
        window_px=5,
        min_valid_fraction=0.8
    )

    # Total cells in 10x10 with 5x5 window is 4
    assert summary["total_cells"] == 4
    # The cell with 76% valid pixels must be excluded
    assert summary["valid_cells"] == 3
    assert summary["coverage_fraction"] == 0.75


def test_planetary_body_radius_scaling():
    """Verify ground metric degree scale differs across Earth, Mars, and Moon."""
    r_earth = 6371008.8
    r_moon = 1737400.0
    r_mars = 3389500.0

    lat = 20.0
    lon_earth, lat_earth = compute_degree_scales(lat, r_earth)
    lon_moon, lat_moon = compute_degree_scales(lat, r_moon)
    lon_mars, lat_mars = compute_degree_scales(lat, r_mars)

    # Earth ~111 km/deg lat
    assert np.isclose(lat_earth, 111195.0, atol=100.0)
    # Moon ~30.3 km/deg lat
    assert np.isclose(lat_moon, 30323.0, atol=100.0)
    # Mars ~59.1 km/deg lat
    assert np.isclose(lat_mars, 59159.0, atol=100.0)

    # Mars degree width must be strictly smaller than Earth's and larger than Moon's
    assert lon_moon < lon_mars < lon_earth
    assert lat_moon < lat_mars < lat_earth
