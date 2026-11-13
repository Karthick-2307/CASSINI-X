"""
Statistical anomaly detection for Earth candidate terrain cells.

Uses Isolation Forest on the normalized Earth candidate pool to flag rare or
unusual feature combinations.

IMPORTANT TERMINOLOGY RULE:
Flagged cells are strictly documented as 'statistically unusual feature combination'.
Never describe anomalies as 'scientifically interesting', 'breakthrough', or 'undiscovered'.
"""

from typing import Tuple, List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest

ANOMALY_LABEL_DESCRIPTOR = "statistically unusual feature combination"


def detect_anomalies(
    candidate_matrix_norm: np.ndarray,
    contamination: float = 0.05
) -> Tuple[np.ndarray, np.ndarray, str]:
    """
    Detect statistical outliers in normalized candidate terrain features.

    Args:
        candidate_matrix_norm: 2D array of shape (N, D).
        contamination: Expected proportion of outliers in the data (default 0.05).

    Returns:
        (is_anomaly_mask, anomaly_scores, descriptor):
            is_anomaly_mask: 1D boolean array where True indicates an outlier.
            anomaly_scores: 1D float array of raw decision function scores.
            descriptor: Fixed honest string 'statistically unusual feature combination'.
    """
    n_samples = candidate_matrix_norm.shape[0]
    if n_samples < 5:
        # Too few samples for Isolation Forest
        return np.zeros(n_samples, dtype=bool), np.zeros(n_samples, dtype=float), ANOMALY_LABEL_DESCRIPTOR

    iso = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100
    )
    preds = iso.fit_predict(candidate_matrix_norm)
    scores = iso.decision_function(candidate_matrix_norm)

    # In scikit-learn, -1 indicates an outlier/anomaly
    is_anomaly_mask = (preds == -1)

    return is_anomaly_mask, scores, ANOMALY_LABEL_DESCRIPTOR
