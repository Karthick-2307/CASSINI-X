"""
Confidence scoring module for planetary analog evaluations.

CRITICAL PRINCIPLE:
Confidence is NOT similarity. While similarity measures feature distance in
normalized space, confidence measures the observational and analytical integrity
of the data comparison:
1. Data coverage (valid non-nodata fraction of the candidate window).
2. Resolution mismatch ratio between planetary and terrestrial datasets.
3. Feature completeness (fraction of active features with valid measurements).
4. Spread/heterogeneity of the planetary reference region (higher spread implies
   greater regional ambiguity and lower confidence).

Formula:
    confidence = (
        0.35 * coverage_score +
        0.25 * resolution_score +
        0.20 * feature_score +
        0.20 * spread_score
    )
"""

from typing import Dict, Any, Optional
import numpy as np


def compute_confidence_score(
    valid_fraction: float,
    earth_resolution_m: Optional[float] = 30.0,
    target_resolution_m: Optional[float] = 463.0,
    available_features_count: int = 3,
    expected_features_count: int = 3,
    reference_spread_normalized: float = 1.0
) -> Dict[str, Any]:
    """
    Compute 0-100 confidence score and individual diagnostic components.

    Args:
        valid_fraction: Fraction of valid raster cells in candidate window (0.0 to 1.0).
        earth_resolution_m: Native resolution of Earth raster in meters (default 30m).
        target_resolution_m: Native resolution of target body raster in meters (e.g. 463m MOLA).
        available_features_count: Number of features present and valid.
        expected_features_count: Total expected feature dimensions (default 3).
        reference_spread_normalized: Average normalized IQR spread of the target region.

    Returns:
        Dict containing:
            confidence: Overall composite confidence score (0.0 - 100.0).
            components: Breakdown of individual component scores (0.0 - 100.0).
            formula: Human-readable documentation of the calculation.
    """
    # 1. Coverage component (0 - 100)
    clamped_vf = max(0.0, min(1.0, float(valid_fraction)))
    coverage_score = clamped_vf * 100.0

    # 2. Resolution mismatch component (20 - 100)
    e_res = max(1.0, float(earth_resolution_m or 30.0))
    t_res = max(1.0, float(target_resolution_m or 463.0))
    mismatch_ratio = max(e_res, t_res) / min(e_res, t_res)
    # Decay resolution score smoothly with log/exp penalty
    resolution_score = float(max(20.0, 100.0 * np.exp(-0.04 * (mismatch_ratio - 1.0))))

    # 3. Feature count component (0 - 100)
    exp_count = max(1, expected_features_count)
    feature_fraction = min(1.0, max(0.0, available_features_count / exp_count))
    feature_score = feature_fraction * 100.0

    # 4. Reference spread component (10 - 100)
    # Higher spread indicates higher spatial ambiguity in the reference region
    spread_score = float(max(10.0, min(100.0, 100.0 * np.exp(-0.35 * max(0.0, reference_spread_normalized)))))

    # Composite weighted confidence
    w_coverage = 0.35
    w_resolution = 0.25
    w_features = 0.20
    w_spread = 0.20

    composite = (
        w_coverage * coverage_score +
        w_resolution * resolution_score +
        w_features * feature_score +
        w_spread * spread_score
    )
    final_confidence = round(max(0.0, min(100.0, composite)), 2)

    return {
        "confidence": final_confidence,
        "components": {
            "coverage_score": round(coverage_score, 2),
            "resolution_score": round(resolution_score, 2),
            "feature_score": round(feature_score, 2),
            "spread_score": round(spread_score, 2),
            "valid_fraction": round(clamped_vf, 4),
            "resolution_mismatch_ratio": round(mismatch_ratio, 2),
            "features_available": available_features_count,
            "reference_spread": round(reference_spread_normalized, 4)
        },
        "formula": (
            "confidence = 0.35 * (valid_fraction * 100) + "
            "0.25 * max(20, 100 * exp(-0.04 * (ratio - 1))) + "
            "0.20 * (features_avail / features_exp * 100) + "
            "0.20 * max(10, 100 * exp(-0.35 * ref_spread))"
        )
    }
