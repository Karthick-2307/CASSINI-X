import os
import glob
import numpy as np
import rasterio
import matplotlib.pyplot as plt
from app.analysis.features import compute_horn_slope

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed"))


def generate_hillshade(dem: np.ndarray, cell_size: float = 500.0, azimuth_deg: float = 315.0, altitude_deg: float = 45.0) -> np.ndarray:
    """
    Computes standard hillshade illumination array (0 to 255).
    """
    azimuth_rad = np.radians(360.0 - azimuth_deg + 90.0)
    altitude_rad = np.radians(altitude_deg)

    # Compute gradients with Horn method
    slope_deg = compute_horn_slope(dem, cell_size_m=cell_size)
    slope_rad = np.radians(slope_deg)

    # Gradient directions
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


def run_visual_check(tif_path: str = None):
    """
    Renders hillshade and slope maps to PNG in data/processed/.
    """
    if tif_path is None or not os.path.exists(tif_path):
        tifs = glob.glob(os.path.join(PROCESSED_DIR, "*.tif"))
        if not tifs:
            print("No processed GeoTIFF found. Run an ingest script first.")
            return
        tif_path = tifs[0]

    print(f"Generating visual inspection for: {tif_path}")
    with rasterio.open(tif_path) as src:
        dem = src.read(1)
        nodata = src.nodata
        if nodata is not None:
            dem = np.where(dem == nodata, np.nan, dem)

    # Fill NaNs with median for smooth hillshading
    valid_mask = ~np.isnan(dem)
    filled_dem = np.where(valid_mask, dem, np.nanmedian(dem))

    hillshade = generate_hillshade(filled_dem, cell_size=500.0)
    slope_deg = compute_horn_slope(filled_dem, cell_size_m=500.0)

    # Save Composite Inspection Plot
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    im0 = axes[0].imshow(hillshade, cmap="gray")
    axes[0].set_title(f"Terrain Hillshade ({os.path.basename(tif_path)})", fontsize=12, fontweight="bold")
    axes[0].axis("off")

    im1 = axes[1].imshow(slope_deg, cmap="magma", vmin=0, vmax=30)
    axes[1].set_title("Slope Inclination (Degrees)", fontsize=12, fontweight="bold")
    axes[1].axis("off")
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04, label="Slope (°)")

    plt.tight_layout()
    out_png = os.path.join(PROCESSED_DIR, "visual_check_hillshade_slope.png")
    plt.savefig(out_png, dpi=150)
    plt.close()

    print(f"Visual check figure generated successfully: {out_png}")
    return out_png


if __name__ == "__main__":
    run_visual_check()
