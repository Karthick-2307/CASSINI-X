"""
Nearest-neighbor search and candidate ranking for planetary analogs.

Uses scikit-learn NearestNeighbors on sqrt(w)-scaled normalized features to
efficiently rank candidates using the exact weighted Euclidean metric.
Summarizes multi-cell reference regions as median feature vectors with spread.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.neighbors import NearestNeighbors

from app.analysis.normalize import fit_robust_scaler, transform_robust_scaler
from app.analysis.similarity import normalize_weights, compute_weighted_distance


def summarize_reference_region(
    target_cells_features: np.ndarray,
    feature_names: List[str]
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Dict[str, float]]]:
    """
    Summarize a reference region containing many cells into a median feature vector
    and per-feature spread (IQR and standard deviation).

    Args:
        target_cells_features: 2D array of shape (M, D) with feature values.
        feature_names: List of D feature names.

    Returns:
        (median_vector, spread_vector, summary_dict):
            median_vector: 1D array of shape (D,) representing median physical values.
            spread_vector: 1D array of shape (D,) representing IQR spread in physical units.
            summary_dict: dictionary for API serialization with median, mean, std, iqr.
    """
    if target_cells_features.ndim != 2:
        raise ValueError("target_cells_features must be 2D (M, D).")
    if target_cells_features.shape[0] == 0:
        raise ValueError("Cannot summarize empty reference region features.")

    medians = []
    spreads = []
    summary_dict = {}

    for i, name in enumerate(feature_names):
        col = target_cells_features[:, i]
        valid_vals = col[~np.isnan(col)]
        if len(valid_vals) == 0:
            med = 0.0
            iqr_val = 0.0
            std_val = 0.0
            mean_val = 0.0
        else:
            med = float(np.median(valid_vals))
            q25 = float(np.percentile(valid_vals, 25))
            q75 = float(np.percentile(valid_vals, 75))
            iqr_val = float(q75 - q25)
            std_val = float(np.std(valid_vals))
            mean_val = float(np.mean(valid_vals))

        medians.append(med)
        spreads.append(iqr_val)
        summary_dict[name] = {
            "median": round(med, 4),
            "mean": round(mean_val, 4),
            "iqr": round(iqr_val, 4),
            "std": round(std_val, 4),
        }

    return np.array(medians, dtype=float), np.array(spreads, dtype=float), summary_dict


def run_nearest_neighbors_search(
    target_vector_norm: np.ndarray,
    candidate_matrix_norm: np.ndarray,
    weights: np.ndarray,
    top_k: int = 20
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Rank candidates relative to target using NearestNeighbors on sqrt(w)-scaled features.

    Note:
        D(x, y) = sqrt( sum w_i (x_i - y_i)^2 ) = sqrt( sum (sqrt(w_i)*x_i - sqrt(w_i)*y_i)^2 )
        Therefore standard Euclidean distance on sqrt(w)-scaled space is mathematically identical.

    Returns:
        (indices, distances): Sorted by distance ascending.
    """
    n_candidates = candidate_matrix_norm.shape[0]
    if n_candidates == 0:
        return np.array([], dtype=int), np.array([], dtype=float)

    actual_k = min(top_k, n_candidates)
    sqrt_w = np.sqrt(weights)

    target_scaled = (target_vector_norm * sqrt_w).reshape(1, -1)
    candidates_scaled = candidate_matrix_norm * sqrt_w

    nn = NearestNeighbors(n_neighbors=actual_k, metric="euclidean")
    nn.fit(candidates_scaled)

    distances, indices = nn.kneighbors(target_scaled)
    return indices[0], distances[0]
