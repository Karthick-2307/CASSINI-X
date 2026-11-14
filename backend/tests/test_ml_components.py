"""
Unit tests for Machine Learning components: Clustering, Anomaly Detection, Explainability, and Scalers.
"""

import pytest
import numpy as np

from app.analysis.normalize import (
    fit_robust_scaler,
    transform_robust_scaler,
    inverse_transform_robust_scaler,
)
from app.analysis.similarity import (
    compute_feature_contributions,
    generate_explanation_text,
)
from app.analysis.clustering import (
    run_kmeans_clustering,
    run_dbscan_clustering,
)
from app.analysis.anomaly import (
    detect_anomalies,
    ANOMALY_LABEL_DESCRIPTOR,
)
from app.analysis.validate import evaluate_summary_metrics


def test_clustering_kmeans_and_dbscan():
    """
    Test K-Means and DBSCAN clustering functions.
    """
    np.random.seed(42)
    # Create two clear clusters
    c1 = np.random.normal(loc=-3.0, scale=0.5, size=(20, 3))
    c2 = np.random.normal(loc=3.0, scale=0.5, size=(20, 3))
    candidates = np.vstack([c1, c2])
    target = np.array([3.1, 2.9, 3.0])
    feature_names = ["elev", "slope", "rough"]

    km_res = run_kmeans_clustering(
        candidate_matrix_norm=candidates,
        candidate_matrix_orig=candidates,
        target_vector_norm=target,
        feature_names=feature_names,
        k_range=(2, 5)
    )

    assert km_res["best_k"] == 2
    assert km_res["silhouette_score"] > 0.6
    assert len(km_res["labels"]) == 40
    assert km_res["target_cluster_id"] in (0, 1)

    db_res = run_dbscan_clustering(candidates, eps=1.5, min_samples=3)
    assert db_res["n_clusters"] >= 1
    assert len(db_res["labels"]) == 40


def test_anomaly_detection_descriptor():
    """
    Test Isolation Forest anomaly detection and strict nomenclature compliance.
    """
    np.random.seed(42)
    normal_points = np.random.normal(loc=0.0, scale=1.0, size=(50, 3))
    outlier = np.array([[20.0, 25.0, 30.0]])
    data = np.vstack([normal_points, outlier])

    is_anomaly, scores, descriptor = detect_anomalies(data, contamination=0.05)

    assert descriptor == ANOMALY_LABEL_DESCRIPTOR
    assert descriptor == "statistically unusual feature combination"
    assert is_anomaly[50] is True or is_anomaly[50] == 1


def test_feature_contributions_and_explanations():
    """
    Test per-feature contributions breakdown and explainability text.
    """
    t_orig = np.array([0.0, 5.0, 1.0])
    c_orig = np.array([0.0, 15.0, 1.0])
    t_norm = np.array([0.0, 0.5, 0.1])
    c_norm = np.array([0.0, 2.5, 0.1])
    weights = np.array([1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0])
    names = ["elevation_relative", "slope_deg", "roughness_m"]

    contributions = compute_feature_contributions(
        t_orig, c_orig, t_norm, c_norm, weights, names
    )

    assert len(contributions) == 3
    slope_item = [x for x in contributions if x["feature"] == "slope_deg"][0]
    assert slope_item["kind"] == "higher"
    assert slope_item["difference"] == 10.0
    assert slope_item["contribution"] > 0

    expl = generate_explanation_text(contributions)
    assert len(expl["similarities"]) >= 1
    assert len(expl["differences"]) >= 1
    assert any("Slope" in d for d in expl["differences"])


def test_robust_scaler_edge_cases():
    """
    Test edge cases in fit_robust_scaler and inverse_transform_robust_scaler:
    - 1D input throws ValueError
    - Feature mismatch throws ValueError
    - Empty candidate array throws ValueError
    - Constant feature (zero IQR) falls back to 1.0
    - Inverse transform accurately inverts transformed values
    """
    with pytest.raises(ValueError, match="must be 2D"):
        fit_robust_scaler(np.array([1.0, 2.0, 3.0]), ["f1"])

    with pytest.raises(ValueError, match="Feature count mismatch"):
        fit_robust_scaler(np.zeros((5, 3)), ["f1", "f2"])

    with pytest.raises(ValueError, match="empty candidate array"):
        fit_robust_scaler(np.zeros((0, 2)), ["f1", "f2"])

    constant_data = np.ones((10, 2)) * 42.0
    params = fit_robust_scaler(constant_data, ["f1", "f2"])
    assert params["f1"]["iqr"] == 1.0
    assert params["f1"]["median"] == 42.0

    varied_data = np.array([[10.0, 20.0], [20.0, 40.0], [30.0, 60.0]])
    params_var = fit_robust_scaler(varied_data, ["a", "b"])
    transformed = transform_robust_scaler(varied_data, ["a", "b"], params_var)
    inversed = inverse_transform_robust_scaler(transformed, ["a", "b"], params_var)
    assert np.allclose(varied_data, inversed, atol=1e-5)


def test_clustering_kmeans_edge_cases():
    """
    Test clustering edge cases with too few samples or valid small clustering.
    """
    data = np.array([[1.0, 2.0], [2.0, 3.0], [3.0, 4.0]])
    res = run_kmeans_clustering(data, data, np.array([2.0, 3.0]), ["f1", "f2"], k_range=(2, 3))
    assert res["method"] == "kmeans"
    assert "best_k" in res
    assert len(res["labels"]) == 3


def test_validate_evaluation_summary_metrics():
    """
    Test evaluate_summary_metrics on exact rank distributions.
    """
    ranks = [1, 2, 3, 4, 5]
    pool_sizes = [10] * 5
    summary = evaluate_summary_metrics(ranks, pool_sizes, top_k_list=[1, 3, 5])
    assert summary["count"] == 5
    assert summary["mean_rank"] == 3.0
    assert summary["median_rank"] == 3.0
    assert summary["hit_rates"]["hit_at_1"] == 0.2
    assert summary["hit_rates"]["hit_at_3"] == 0.6
    assert summary["hit_rates"]["hit_at_5"] == 1.0
    expected_mrr = (1.0 + 0.5 + 1.0/3.0 + 0.25 + 0.2) / 5.0
    assert pytest.approx(summary["mrr"], abs=1e-3) == expected_mrr

