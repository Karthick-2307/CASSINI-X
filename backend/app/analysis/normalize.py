"""
Robust normalization module for planetary terrain analog discovery.

Fits median and interquartile range (IQR) exclusively on the candidate pool (Earth
cells) and applies the resulting scaler parameters to both candidate and target
reference features. Guards against zero IQR.
"""

from typing import List, Dict, Any, Union
import numpy as np


def fit_robust_scaler(
    candidate_features: np.ndarray,
    feature_names: List[str]
) -> Dict[str, Dict[str, float]]:
    """
    Fit a robust scaler (median and IQR) on the Earth candidate feature matrix.

    Args:
        candidate_features: 2D array of shape (N, D) containing candidate features.
        feature_names: List of D feature names matching columns in candidate_features.

    Returns:
        Dictionary mapping each feature name to its median, IQR, Q25, and Q75.
        Guards against zero IQR by falling back to standard deviation or 1.0.
    """
    if candidate_features.ndim != 2:
        raise ValueError(f"candidate_features must be 2D, got shape {candidate_features.shape}")
    if candidate_features.shape[1] != len(feature_names):
        raise ValueError(
            f"Feature count mismatch: array has {candidate_features.shape[1]} columns, "
            f"got {len(feature_names)} feature names."
        )
    if candidate_features.shape[0] == 0:
        raise ValueError("Cannot fit robust scaler on an empty candidate array.")

    scaler_params: Dict[str, Dict[str, float]] = {}

    for i, name in enumerate(feature_names):
        col = candidate_features[:, i]
        valid_vals = col[~np.isnan(col)]
        if len(valid_vals) == 0:
            median_val = 0.0
            iqr_val = 1.0
            q25 = 0.0
            q75 = 0.0
        else:
            median_val = float(np.median(valid_vals))
            q25 = float(np.percentile(valid_vals, 25))
            q75 = float(np.percentile(valid_vals, 75))
            iqr_val = q75 - q25

            # Guard against zero IQR (constant or near-constant feature)
            if iqr_val <= 1e-9:
                std_val = float(np.std(valid_vals))
                if std_val > 1e-9:
                    iqr_val = std_val
                else:
                    iqr_val = 1.0

        scaler_params[name] = {
            "median": median_val,
            "iqr": iqr_val,
            "q25": q25,
            "q75": q75,
        }

    return scaler_params


def transform_robust_scaler(
    features: np.ndarray,
    feature_names: List[str],
    scaler_params: Dict[str, Dict[str, float]]
) -> np.ndarray:
    """
    Transform feature vector or matrix using pre-fitted robust scaler parameters.

    Formula: x_norm = (x - median) / iqr

    Args:
        features: 1D vector of shape (D,) or 2D array of shape (N, D).
        feature_names: List of D feature names.
        scaler_params: Fitted parameters from fit_robust_scaler.

    Returns:
        Normalized features with identical shape.
    """
    is_1d = features.ndim == 1
    arr = np.atleast_2d(features).astype(float).copy()

    if arr.shape[1] != len(feature_names):
        raise ValueError(
            f"Shape mismatch: features have {arr.shape[1]} columns, expected {len(feature_names)}"
        )

    for i, name in enumerate(feature_names):
        if name not in scaler_params:
            raise KeyError(f"Feature '{name}' not found in scaler_params.")
        params = scaler_params[name]
        median_val = params["median"]
        iqr_val = params["iqr"]
        arr[:, i] = (arr[:, i] - median_val) / iqr_val

    return arr[0] if is_1d else arr


def inverse_transform_robust_scaler(
    norm_features: np.ndarray,
    feature_names: List[str],
    scaler_params: Dict[str, Dict[str, float]]
) -> np.ndarray:
    """
    Reconstruct original feature units from normalized space.

    Formula: x_orig = x_norm * iqr + median
    """
    is_1d = norm_features.ndim == 1
    arr = np.atleast_2d(norm_features).astype(float).copy()

    for i, name in enumerate(feature_names):
        if name not in scaler_params:
            raise KeyError(f"Feature '{name}' not found in scaler_params.")
        params = scaler_params[name]
        arr[:, i] = arr[:, i] * params["iqr"] + params["median"]

    return arr[0] if is_1d else arr
