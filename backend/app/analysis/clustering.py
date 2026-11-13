"""
Unsupervised clustering module for planetary analog terrain cells.

Performs K-Means clustering with silhouette score optimization over k in [2, 8]
and DBSCAN clustering with k-distance heuristic eps selection.
Reports centroids in physical units and assigns the target reference region to its nearest cluster.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors


def run_kmeans_clustering(
    candidate_matrix_norm: np.ndarray,
    candidate_matrix_orig: np.ndarray,
    target_vector_norm: np.ndarray,
    feature_names: List[str],
    k_range: Tuple[int, int] = (2, 8)
) -> Dict[str, Any]:
    """
    Run K-Means clustering, optimizing k by silhouette score.

    Args:
        candidate_matrix_norm: Normalized candidate features (N, D).
        candidate_matrix_orig: Physical units candidate features (N, D).
        target_vector_norm: Normalized target reference features (D,).
        feature_names: List of D feature names.
        k_range: (min_k, max_k) to evaluate.

    Returns:
        Dict containing:
            best_k: optimal cluster count
            silhouette_score: highest silhouette score achieved
            labels: cluster label for each candidate point
            centroids_orig: list of dicts with centroid coordinates in physical units
            target_cluster_id: id of the cluster closest to the target reference
    """
    n_samples = candidate_matrix_norm.shape[0]
    if n_samples < 3:
        # Too few samples for silhouette clustering
        return {
            "method": "kmeans",
            "best_k": 1,
            "silhouette_score": 0.0,
            "labels": [0] * n_samples,
            "centroids_orig": [{name: float(np.mean(candidate_matrix_orig[:, i])) for i, name in enumerate(feature_names)}],
            "target_cluster_id": 0,
            "note": "Sample count too small for multi-cluster silhouette optimization."
        }

    min_k, max_k = k_range
    max_k = min(max_k, n_samples - 1)
    min_k = min(min_k, max_k)

    if min_k >= max_k:
        best_k = min_k
        km = KMeans(n_clusters=best_k, random_state=42, n_init=10)
        labels = km.fit_predict(candidate_matrix_norm)
        sil_score = float(silhouette_score(candidate_matrix_norm, labels)) if best_k > 1 else 0.0
    else:
        best_k = min_k
        best_sil = -1.0
        best_km = None

        for k in range(min_k, max_k + 1):
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            candidate_labels = km.fit_predict(candidate_matrix_norm)
            sil = float(silhouette_score(candidate_matrix_norm, candidate_labels))
            if sil > best_sil:
                best_sil = sil
                best_k = k
                best_km = km

        km = best_km if best_km is not None else KMeans(n_clusters=best_k, random_state=42, n_init=10).fit(candidate_matrix_norm)
        labels = km.labels_
        sil_score = best_sil

    # Compute centroids in original physical units
    centroids_orig = []
    for cid in range(best_k):
        mask = (labels == cid)
        if np.sum(mask) > 0:
            cluster_orig_vals = candidate_matrix_orig[mask]
            centroid_dict = {
                "cluster_id": cid,
                "cell_count": int(np.sum(mask)),
                "features": {
                    name: round(float(np.mean(cluster_orig_vals[:, i])), 3)
                    for i, name in enumerate(feature_names)
                }
            }
        else:
            centroid_dict = {
                "cluster_id": cid,
                "cell_count": 0,
                "features": {name: 0.0 for name in feature_names}
            }
        centroids_orig.append(centroid_dict)

    # Determine which cluster centroid is closest to target_vector_norm
    norm_centroids = km.cluster_centers_
    t_dists = np.linalg.norm(norm_centroids - target_vector_norm, axis=1)
    target_cluster_id = int(np.argmin(t_dists))

    return {
        "method": "kmeans",
        "best_k": int(best_k),
        "silhouette_score": round(float(sil_score), 4),
        "labels": [int(lbl) for lbl in labels],
        "centroids_orig": centroids_orig,
        "target_cluster_id": target_cluster_id
    }


def estimate_dbscan_eps(features_norm: np.ndarray, k: int = 5) -> float:
    """
    Estimate DBSCAN eps parameter using the k-distance elbow heuristic.
    """
    n_samples = features_norm.shape[0]
    actual_k = min(k, max(1, n_samples - 1))
    if actual_k < 1:
        return 0.5

    nn = NearestNeighbors(n_neighbors=actual_k)
    nn.fit(features_norm)
    distances, _ = nn.kneighbors(features_norm)

    k_distances = np.sort(distances[:, actual_k - 1])
    # Use 80th percentile of k-distance curve as robust heuristic for eps
    eps_val = float(np.percentile(k_distances, 80))
    return max(0.1, round(eps_val, 4))


def run_dbscan_clustering(
    candidate_matrix_norm: np.ndarray,
    eps: Optional[float] = None,
    min_samples: int = 5
) -> Dict[str, Any]:
    """
    Run DBSCAN on normalized features, reporting eps and labeling noise points as -1.
    """
    n_samples = candidate_matrix_norm.shape[0]
    if eps is None:
        eps = estimate_dbscan_eps(candidate_matrix_norm, k=min_samples)

    actual_min_samples = min(min_samples, max(2, n_samples // 10))
    dbscan = DBSCAN(eps=eps, min_samples=actual_min_samples)
    labels = dbscan.fit_predict(candidate_matrix_norm)

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    noise_count = int(np.sum(labels == -1))

    return {
        "method": "dbscan",
        "eps": float(eps),
        "min_samples": actual_min_samples,
        "n_clusters": int(n_clusters),
        "noise_count": noise_count,
        "labels": [int(l) for l in labels]
    }
