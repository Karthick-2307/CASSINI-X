"""
Unit tests for ASTRA-X Part 5: Similarity Engine & Machine Learning.

Includes all 8 hand-computed verification test cases specified in ASTRAX_05 Section 5.5:
1. Distance with weights [0.5, 0.5], target [0, 0], candidate [1, 1] -> D = 1.0, similarity = 36.79.
2. Weights [0.8, 0.2], differences [0.5, 1.0] -> D = sqrt(0.4) = 0.6325, similarity = 53.13.
3. Identical vectors -> similarity 100.
4. Weights not summing to 1 are normalised.
5. Robust scaling is fit on candidates only and applied to target.
6. Nearest-neighbour order equals brute-force order on random data.
7. Confidence decreases when valid fraction decreases.
8. Validation function returns correct rank on a tiny hand-made example.
"""

import pytest
import numpy as np

from app.analysis.normalize import (
    fit_robust_scaler,
    transform_robust_scaler,
    inverse_transform_robust_scaler,
)
from app.analysis.similarity import (
    normalize_weights,
    compute_weighted_distance,
    compute_feature_contributions,
    generate_explanation_text,
)
from app.analysis.search import (
    summarize_reference_region,
    run_nearest_neighbors_search,
)
from app.analysis.clustering import (
    run_kmeans_clustering,
    run_dbscan_clustering,
)
from app.analysis.anomaly import (
    detect_anomalies,
    ANOMALY_LABEL_DESCRIPTOR,
)
from app.analysis.confidence import compute_confidence_score
from app.analysis.validate import (
    compute_rank_from_scores,
    compute_rank_from_distances,
    evaluate_summary_metrics,
    run_synthetic_benchmark_pairing,
)


def test_hand_computed_case_1():
    """
    Test 1: Distance with weights [0.5, 0.5], target [0, 0], candidate [1, 1]
    D = sqrt(0.5*(1)^2 + 0.5*(1)^2) = 1.0
    similarity = 100 * exp(-1.0) = 36.79 (rounded)
    """
    target = np.array([0.0, 0.0])
    candidate = np.array([1.0, 1.0])
    weights = np.array([0.5, 0.5])

    dist, sim = compute_weighted_distance(target, candidate, weights)

    assert pytest.approx(dist, abs=1e-5) == 1.0
    assert pytest.approx(sim, abs=0.01) == 36.79
    # Exactly 100 * exp(-1)
    assert pytest.approx(sim, abs=1e-5) == 100.0 * np.exp(-1.0)


def test_hand_computed_case_2():
    """
    Test 2: Weights [0.8, 0.2], differences [0.5, 1.0]
    D = sqrt(0.8*(0.5)^2 + 0.2*(1.0)^2) = sqrt(0.2 + 0.2) = sqrt(0.4) = 0.6324555...
    similarity = 100 * exp(-sqrt(0.4)) = 53.1288... ~ 53.13
    """
    target = np.array([0.0, 0.0])
    candidate = np.array([0.5, 1.0])
    weights = np.array([0.8, 0.2])

    dist, sim = compute_weighted_distance(target, candidate, weights)

    expected_d = np.sqrt(0.4)
    expected_s = 100.0 * np.exp(-np.sqrt(0.4))

    assert pytest.approx(dist, abs=1e-4) == 0.6325
    assert pytest.approx(sim, abs=0.01) == 53.13
    assert pytest.approx(dist, abs=1e-6) == expected_d
    assert pytest.approx(sim, abs=1e-6) == expected_s


def test_identical_vectors_similarity():
    """
    Test 3: Identical vectors -> similarity = 100.0, distance = 0.0.
    """
    target = np.array([125.4, 14.8, 2.35])
    candidate = np.array([125.4, 14.8, 2.35])
    weights = np.array([0.333, 0.333, 0.334])

    dist, sim = compute_weighted_distance(target, candidate, weights)

    assert pytest.approx(dist, abs=1e-7) == 0.0
    assert pytest.approx(sim, abs=1e-7) == 100.0


def test_weights_normalization():
    """
    Test 4: Weights not summing to 1 are normalised.
    """
    features = ["elev", "slope", "rough"]
    raw_weights = [2.0, 3.0, 5.0]  # sum = 10.0

    w = normalize_weights(raw_weights, features)

    assert np.allclose(w, np.array([0.2, 0.3, 0.5]))
    assert pytest.approx(np.sum(w), abs=1e-9) == 1.0

    # Test dictionary input
    dict_weights = {"elev": 10.0, "slope": 10.0, "rough": 20.0}  # sum = 40.0
    w_dict = normalize_weights(dict_weights, features)
    assert np.allclose(w_dict, np.array([0.25, 0.25, 0.5]))

    # Test default equal weights
    w_default = normalize_weights(None, features)
    assert np.allclose(w_default, np.array([1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0]))


def test_robust_scaling_fit_on_candidates_only():
    """
    Test 5: Robust scaling is fit on candidates only and applied to target.
    """
    feature_names = ["elev", "slope"]
    # Candidate pool: medians = [20, 200]
    candidate_data = np.array([
        [10.0, 100.0],
        [20.0, 200.0],
        [30.0, 300.0],
    ])

    scaler_params = fit_robust_scaler(candidate_data, feature_names)

    # Median of candidates
    assert scaler_params["elev"]["median"] == 20.0
    assert scaler_params["slope"]["median"] == 200.0

    # IQR = Q75 - Q25 = 25 - 15 = 10 for elev; 250 - 150 = 100 for slope
    assert scaler_params["elev"]["iqr"] == 10.0
    assert scaler_params["slope"]["iqr"] == 100.0

    # Transform candidate: median point becomes [0, 0]
    c_norm = transform_robust_scaler(candidate_data, feature_names, scaler_params)
    assert np.allclose(c_norm[1], [0.0, 0.0])

    # Transform target: [0, 0] physical -> (0 - 20)/10 = -2.0, (0 - 200)/100 = -2.0
    target_orig = np.array([0.0, 0.0])
    target_norm = transform_robust_scaler(target_orig, feature_names, scaler_params)
    assert np.allclose(target_norm, [-2.0, -2.0])

    # Inverse transform recovers original physical values
    recovered = inverse_transform_robust_scaler(target_norm, feature_names, scaler_params)
    assert np.allclose(recovered, target_orig)


def test_nearest_neighbor_equals_brute_force():
    """
    Test 6: Nearest-neighbour order equals brute-force order on random data array.
    """
    np.random.seed(42)
    n_candidates = 50
    dim = 3
    feature_names = ["f1", "f2", "f3"]

    candidates = np.random.uniform(-5.0, 5.0, size=(n_candidates, dim))
    target = np.random.uniform(-2.0, 2.0, size=(dim,))
    weights = np.array([0.5, 0.3, 0.2])

    # 1. Brute-force calculation
    diffs = candidates - target
    sq_diffs = np.sum(diffs ** 2 * weights, axis=1)
    brute_distances = np.sqrt(sq_diffs)
    brute_order = np.argsort(brute_distances)[:20]

    # 2. Scikit-learn NearestNeighbors via run_nearest_neighbors_search
    nn_indices, nn_distances = run_nearest_neighbors_search(
        target_vector_norm=target,
        candidate_matrix_norm=candidates,
        weights=weights,
        top_k=20
    )

    # Both must match exactly in rank order
    assert len(nn_indices) == 20
    assert np.array_equal(nn_indices, brute_order)
    assert np.allclose(nn_distances, brute_distances[brute_order], atol=1e-6)


def test_confidence_decreases_with_lower_coverage():
    """
    Test 7: Confidence decreases when valid fraction decreases.
    """
    c_full = compute_confidence_score(valid_fraction=1.0)
    c_80 = compute_confidence_score(valid_fraction=0.8)
    c_50 = compute_confidence_score(valid_fraction=0.5)
    c_20 = compute_confidence_score(valid_fraction=0.2)

    assert c_full["confidence"] > c_80["confidence"]
    assert c_80["confidence"] > c_50["confidence"]
    assert c_50["confidence"] > c_20["confidence"]

    # Verify coverage component matches formula
    assert c_full["components"]["coverage_score"] == 100.0
    assert c_80["components"]["coverage_score"] == 80.0
    assert c_50["components"]["coverage_score"] == 50.0


def test_validation_function_rank_on_handmade_example():
    """
    Test 8: Validation function returns the correct rank on a tiny hand-made example.
    """
    # 4 candidates with 1 true known analog
    # Target is at [0.0, 0.0, 0.0]
    target = np.array([0.0, 0.0, 0.0])
    candidates = np.array([
        [10.0, 10.0, 10.0],  # Candidate 0: far
        [0.1, 0.1, 0.1],     # Candidate 1: known analog (very close!)
        [5.0, 5.0, 5.0],     # Candidate 2: medium
        [2.0, 2.0, 2.0],     # Candidate 3: intermediate
    ])
    feature_names = ["elevation_relative", "slope_deg", "roughness_m"]
    known_analog_idx = 1

    result = run_synthetic_benchmark_pairing(
        target_vector=target,
        candidate_matrix=candidates,
        known_analog_idx=known_analog_idx,
        feature_names=feature_names
    )

    # Known analog must be ranked #1
    assert result["model_rank"] == 1
    assert result["pool_size"] == 4
    assert result["expected_random_rank"] == 2.5
    assert result["model_similarity"] > 90.0


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
    # The extreme outlier at index 50 should be flagged
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
    # slope_deg should have kind == "higher" and largest contribution
    slope_item = [x for x in contributions if x["feature"] == "slope_deg"][0]
    assert slope_item["kind"] == "higher"
    assert slope_item["difference"] == 10.0
    assert slope_item["contribution"] > 0

    expl = generate_explanation_text(contributions)
    assert len(expl["similarities"]) >= 1
    assert len(expl["differences"]) >= 1
    assert any("Slope" in d for d in expl["differences"])
