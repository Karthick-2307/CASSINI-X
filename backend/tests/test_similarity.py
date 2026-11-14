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
)
from app.analysis.similarity import (
    normalize_weights,
    compute_weighted_distance,
)
from app.analysis.search import run_nearest_neighbors_search
from app.analysis.confidence import compute_confidence_score
from app.analysis.validate import run_synthetic_benchmark_pairing


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

    # Error when all weights are zero
    with pytest.raises(ValueError, match="Sum of feature weights must be strictly positive"):
        normalize_weights([0.0, 0.0, 0.0], features)


def test_robust_scaling_fit_on_candidates_only():
    """
    Test 5: Robust scaling is fit on candidates only and applied to target.
    Target must NOT affect the median or IQR of the scaler.
    """
    candidate_col = np.array([[10.0], [20.0], [30.0], [40.0], [50.0]])
    feature_names = ["elev"]

    # 1. Fit scaler strictly on candidates
    params = fit_robust_scaler(candidate_col, feature_names)

    assert params["elev"]["median"] == 30.0
    assert params["elev"]["iqr"] == 20.0
    assert params["elev"]["q25"] == 20.0
    assert params["elev"]["q75"] == 40.0

    # 2. Transform candidates
    cand_norm = transform_robust_scaler(candidate_col, feature_names, params)
    expected_cand_norm = np.array([[-1.0], [-0.5], [0.0], [0.5], [1.0]])
    assert np.allclose(cand_norm, expected_cand_norm, atol=1e-6)

    # 3. Transform an extreme target (e.g. 1030) using candidate parameters
    target_orig = np.array([[1030.0]])
    target_norm = transform_robust_scaler(target_orig, feature_names, params)
    assert pytest.approx(target_norm[0, 0], abs=1e-6) == 50.0

    # Check that candidate median remains 30.0 despite the extreme target
    assert params["elev"]["median"] == 30.0


def test_nearest_neighbor_equals_brute_force():
    """
    Test 6: Nearest-neighbour order equals brute-force order on random data.
    """
    np.random.seed(42)
    n_candidates = 100
    n_features = 3

    target = np.random.uniform(-2.0, 2.0, size=n_features)
    candidates = np.random.uniform(-3.0, 3.0, size=(n_candidates, n_features))
    weights = np.array([0.5, 0.3, 0.2])

    # 1. Brute-force calculation
    brute_distances = np.zeros(n_candidates)
    for i in range(n_candidates):
        diff = candidates[i] - target
        d2 = np.sum(weights * (diff ** 2))
        brute_distances[i] = np.sqrt(d2)

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
    target = np.array([0.0, 0.0, 0.0])
    candidates = np.array([
        [10.0, 10.0, 10.0],
        [0.1, 0.1, 0.1],
        [5.0, 5.0, 5.0],
        [2.0, 2.0, 2.0],
    ])
    feature_names = ["elevation_relative", "slope_deg", "roughness_m"]
    known_analog_idx = 1

    result = run_synthetic_benchmark_pairing(
        target_vector=target,
        candidate_matrix=candidates,
        known_analog_idx=known_analog_idx,
        feature_names=feature_names
    )

    assert result["model_rank"] == 1
    assert result["pool_size"] == 4
    assert result["expected_random_rank"] == 2.5
    assert result["model_similarity"] > 90.0
