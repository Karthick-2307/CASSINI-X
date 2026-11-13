"""
Weighted similarity and distance calculations for planetary analog discovery.

Implements weighted Euclidean distance on normalized feature space:
    D(x, y) = sqrt( sum_i w_i * (x_i - y_i)^2 )
    similarity = 100 * exp(-D)

NOTE: The exponential transform similarity = 100 * exp(-D) is an illustrative
relative matching score, not a calibrated statistical probability.
"""

from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np


def normalize_weights(
    weights: Optional[Union[Dict[str, float], List[float], np.ndarray]],
    feature_names: List[str]
) -> np.ndarray:
    """
    Ensure feature weights are non-negative, match feature_names, and sum to 1.0.
    Defaults to equal weights: w_i = 1 / N.
    """
    n = len(feature_names)
    if n == 0:
        raise ValueError("feature_names list cannot be empty.")

    if weights is None:
        w = np.full(n, 1.0 / n, dtype=float)
        return w

    if isinstance(weights, dict):
        w_list = [float(weights.get(name, 1.0 / n)) for name in feature_names]
        w = np.array(w_list, dtype=float)
    elif isinstance(weights, (list, tuple, np.ndarray)):
        w = np.array(weights, dtype=float)
        if len(w) != n:
            raise ValueError(f"Weights count ({len(w)}) does not match features count ({n}).")
    else:
        raise TypeError(f"Unsupported weights type: {type(weights)}")

    if np.any(w < 0):
        raise ValueError("Feature weights must be non-negative.")

    total = np.sum(w)
    if total <= 1e-9:
        raise ValueError("Sum of feature weights must be strictly positive.")

    return w / total


def compute_weighted_distance(
    target: np.ndarray,
    candidates: np.ndarray,
    weights: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute weighted Euclidean distance D and similarity score = 100 * exp(-D).

    Args:
        target: 1D array of shape (D,) representing target reference features.
        candidates: 2D array of shape (N, D) or 1D array (D,) representing candidate features.
        weights: 1D array of shape (D,) non-negative weights summing to 1.0.

    Returns:
        (distances, similarities):
            distances: array of shape (N,)
            similarities: array of shape (N,) in range (0, 100]
    """
    is_1d = candidates.ndim == 1
    cand_arr = np.atleast_2d(candidates).astype(float)
    targ_arr = np.asarray(target, dtype=float)

    if cand_arr.shape[1] != len(weights) or len(targ_arr) != len(weights):
        raise ValueError("Dimension mismatch between target, candidates, and weights.")

    # Weighted squared differences: sum_i w_i * (x_i - y_i)^2
    diffs = cand_arr - targ_arr
    weighted_sq_diffs = (diffs ** 2) * weights
    sq_distances = np.sum(weighted_sq_diffs, axis=1)
    # Clip negative rounding issues
    distances = np.sqrt(np.maximum(sq_distances, 0.0))

    # Illustrative transform: similarity = 100 * exp(-D)
    similarities = 100.0 * np.exp(-distances)

    if is_1d:
        return distances[0], similarities[0]
    return distances, similarities


def compute_feature_contributions(
    target_orig: np.ndarray,
    candidate_orig: np.ndarray,
    target_norm: np.ndarray,
    candidate_norm: np.ndarray,
    weights: np.ndarray,
    feature_names: List[str],
    units_map: Optional[Dict[str, str]] = None
) -> List[Dict[str, Any]]:
    """
    Compute per-feature breakdown for explainability:
    w_i * (x_norm_i - y_norm_i)^2, signed differences, and qualitative kind.

    Args:
        target_orig: Target values in original physical units (D,).
        candidate_orig: Candidate values in original physical units (D,).
        target_norm: Target values in robust normalized space (D,).
        candidate_norm: Candidate values in robust normalized space (D,).
        weights: Normalized weights array (D,).
        feature_names: Names of the features.
        units_map: Optional mapping of feature names to physical units.

    Returns:
        List of dicts:
        [{
            "feature": name,
            "unit": unit,
            "target_value": float,
            "candidate_value": float,
            "difference": float (candidate - target),
            "normalized_difference": float,
            "contribution": float (w_i * diff_norm^2),
            "kind": "matching" | "higher" | "lower"
        }, ...]
    """
    if units_map is None:
        units_map = {
            "elevation_relative": "m",
            "slope_deg": "deg",
            "roughness_m": "m"
        }

    norm_diffs = candidate_norm - target_norm
    sq_contribs = weights * (norm_diffs ** 2)

    breakdown = []
    for i, name in enumerate(feature_names):
        t_val = float(target_orig[i])
        c_val = float(candidate_orig[i])
        diff_orig = c_val - t_val
        n_diff = float(norm_diffs[i])
        contrib = float(sq_contribs[i])
        unit = units_map.get(name, "")

        if abs(n_diff) < 0.25:
            kind = "matching"
        elif diff_orig > 0:
            kind = "higher"
        else:
            kind = "lower"

        breakdown.append({
            "feature": name,
            "unit": unit,
            "target_value": round(t_val, 3),
            "candidate_value": round(c_val, 3),
            "difference": round(diff_orig, 3),
            "normalized_difference": round(n_diff, 4),
            "contribution": round(contrib, 5),
            "kind": kind
        })

    return breakdown


def generate_explanation_text(
    feature_comparison: List[Dict[str, Any]]
) -> Dict[str, List[str]]:
    """
    Generate factual, template-based explanations from computed contributions.
    No invented claims, strictly referencing physical feature values and differences.
    """
    # Sort by contribution: lowest contribution means closest match
    sorted_by_sim = sorted(feature_comparison, key=lambda x: x["contribution"])

    similarities: List[str] = []
    differences: List[str] = []

    for item in sorted_by_sim:
        feat = item["feature"].replace("_", " ")
        unit = item["unit"]
        t_val = item["target_value"]
        c_val = item["candidate_value"]
        diff = item["difference"]

        if item["kind"] == "matching":
            similarities.append(
                f"{feat.capitalize()} closely aligns with the reference region: {c_val} {unit} vs reference {t_val} {unit} (difference: {diff:+.2f} {unit})."
            )
        else:
            dir_str = "higher" if diff > 0 else "lower"
            differences.append(
                f"{feat.capitalize()} is {abs(diff):.2f} {unit} {dir_str} than reference (candidate: {c_val} {unit}, reference: {t_val} {unit})."
            )

    return {
        "similarities": similarities,
        "differences": differences
    }

