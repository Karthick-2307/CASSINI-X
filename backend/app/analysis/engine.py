"""
End-to-end analysis engine orchestrator for planetary analog discovery.

Coordinates:
- Feature extraction & validation
- Robust scaling fit on Earth candidate pool
- Weighted Euclidean similarity ranking
- K-Means and DBSCAN clustering
- Isolation Forest anomaly detection
- Explainability and template-based diagnostic generation
- Multi-component confidence scoring
"""

from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timezone
import numpy as np
from sqlalchemy.orm import Session

from app.models import Analysis, CandidateMatch, Region, Planet, Dataset, TerrainFeature
from app.analysis.normalize import fit_robust_scaler, transform_robust_scaler
from app.analysis.similarity import (
    normalize_weights,
    compute_weighted_distance,
    compute_feature_contributions,
    generate_explanation_text
)
from app.analysis.search import summarize_reference_region
from app.analysis.clustering import run_kmeans_clustering, run_dbscan_clustering
from app.analysis.anomaly import detect_anomalies
from app.analysis.confidence import compute_confidence_score

ALLOWED_FEATURES = ["elevation_relative", "slope_deg", "roughness_m"]


def run_analysis_pipeline(
    db: Session,
    target_region_id: int,
    earth_search_area_ids: Optional[List[int]] = None,
    features: Optional[List[str]] = None,
    weights: Optional[Dict[str, float]] = None,
    threshold: float = 0.0,
    top_k: int = 20
) -> Analysis:
    """
    Execute full analog discovery analysis synchronously and persist results.
    """
    feature_names = features if features else list(ALLOWED_FEATURES)
    for feat in feature_names:
        if feat not in ALLOWED_FEATURES:
            raise ValueError(f"Feature '{feat}' is not supported. Allowed: {ALLOWED_FEATURES}")

    # Validate target region
    target_region = db.query(Region).filter(Region.id == target_region_id).first()
    if not target_region:
        raise ValueError(f"Target region with id {target_region_id} does not exist.")

    # Fetch target terrain features
    target_cells = (
        db.query(TerrainFeature)
        .filter(TerrainFeature.region_id == target_region_id)
        .all()
    )
    if not target_cells:
        raise ValueError(
            f"No terrain features computed for target region '{target_region.name}'. Ingest data first."
        )

    # Filter target cells with non-null values
    target_valid_rows = []
    for c in target_cells:
        vals = [getattr(c, f, None) for f in feature_names]
        if all(v is not None and not np.isnan(v) for v in vals):
            target_valid_rows.append(vals)

    if not target_valid_rows:
        raise ValueError("Target region contains no valid numerical feature cells.")

    target_matrix = np.array(target_valid_rows, dtype=float)
    target_median, target_spread, target_summary_dict = summarize_reference_region(
        target_matrix, feature_names
    )

    # Build Earth candidate pool
    earth_query = db.query(Region).join(Region.planet).filter(Region.planet.has(name="Earth"))
    if earth_search_area_ids:
        earth_query = earth_query.filter(Region.id.in_(earth_search_area_ids))
    earth_regions = earth_query.all()
    if not earth_regions:
        raise ValueError("No Earth candidate search areas available matching the criteria.")

    earth_region_ids = [r.id for r in earth_regions]
    candidate_cells = (
        db.query(TerrainFeature)
        .filter(TerrainFeature.region_id.in_(earth_region_ids))
        .filter(TerrainFeature.valid_fraction >= 0.8)
        .all()
    )
    if not candidate_cells:
        raise ValueError("No Earth candidate cells found meeting the valid fraction threshold (>= 0.8).")

    cand_valid_cells = []
    cand_matrix_rows = []
    for c in candidate_cells:
        vals = [getattr(c, f, None) for f in feature_names]
        if all(v is not None and not np.isnan(v) for v in vals):
            cand_valid_cells.append(c)
            cand_matrix_rows.append(vals)

    if not cand_matrix_rows:
        raise ValueError("Earth candidate cells have missing feature attributes.")

    candidate_matrix_orig = np.array(cand_matrix_rows, dtype=float)

    # 1. Fit robust scaler exclusively on candidate pool
    scaler_params = fit_robust_scaler(candidate_matrix_orig, feature_names)

    # 2. Transform candidates and target reference into normalized space
    candidate_matrix_norm = transform_robust_scaler(
        candidate_matrix_orig, feature_names, scaler_params
    )
    target_vector_norm = transform_robust_scaler(
        target_median, feature_names, scaler_params
    )

    # 3. Normalize feature weights
    norm_weights = normalize_weights(weights, feature_names)

    # 4. Compute weighted distance and similarity
    distances, similarities = compute_weighted_distance(
        target_vector_norm, candidate_matrix_norm, norm_weights
    )

    # 5. Clustering on normalized features
    kmeans_info = run_kmeans_clustering(
        candidate_matrix_norm,
        candidate_matrix_orig,
        target_vector_norm,
        feature_names,
        k_range=(2, 8)
    )
    dbscan_info = run_dbscan_clustering(candidate_matrix_norm)

    # 6. Statistical anomaly detection
    is_anomaly_mask, _, _ = detect_anomalies(candidate_matrix_norm)

    # 7. Create Analysis database record
    weights_dict = {name: float(norm_weights[i]) for i, name in enumerate(feature_names)}
    analysis = Analysis(
        target_region_id=target_region_id,
        features_json=json.dumps(feature_names),
        weights_json=json.dumps(weights_dict),
        threshold=threshold,
        top_k=top_k,
        scaler_params_json=json.dumps(scaler_params),
        target_summary_json=json.dumps(target_summary_dict),
        clustering_info_json=json.dumps({
            "kmeans": {
                "best_k": kmeans_info["best_k"],
                "silhouette_score": kmeans_info["silhouette_score"],
                "target_cluster_id": kmeans_info["target_cluster_id"],
                "centroids": kmeans_info["centroids_orig"]
            },
            "dbscan": {
                "eps": dbscan_info["eps"],
                "n_clusters": dbscan_info["n_clusters"],
                "noise_count": dbscan_info["noise_count"]
            }
        }),
        status="running"
    )
    db.add(analysis)
    db.flush()  # Populates analysis.id

    # Filter by similarity threshold and rank candidates
    qualifying_indices = np.where(similarities >= threshold)[0]
    # Sort qualifying indices descending by similarity score
    sorted_order = np.argsort(similarities[qualifying_indices])[::-1]
    ranked_indices = qualifying_indices[sorted_order]

    actual_top_k = ranked_indices[:top_k]

    # Target resolution for confidence scoring
    target_res = (
        target_region.source_dataset.resolution_m
        if target_region.source_dataset and target_region.source_dataset.resolution_m
        else 463.0
    )

    # Reference spread normalized
    spread_norm = float(np.mean([
        target_spread[i] / scaler_params[f]["iqr"]
        for i, f in enumerate(feature_names)
    ]))

    # Generate CandidateMatch records
    matches: List[CandidateMatch] = []
    for cand_idx in actual_top_k:
        c_cell = cand_valid_cells[cand_idx]
        sim_score = round(float(similarities[cand_idx]), 2)
        dist_score = round(float(distances[cand_idx]), 4)

        # Confidence calculation
        e_res = (
            c_cell.region.source_dataset.resolution_m
            if c_cell.region and c_cell.region.source_dataset and c_cell.region.source_dataset.resolution_m
            else 30.0
        )
        conf_res = compute_confidence_score(
            valid_fraction=c_cell.valid_fraction,
            earth_resolution_m=e_res,
            target_resolution_m=target_res,
            available_features_count=len(feature_names),
            expected_features_count=len(ALLOWED_FEATURES),
            reference_spread_normalized=spread_norm
        )

        # Feature contributions & qualitative differences
        c_orig_vec = candidate_matrix_orig[cand_idx]
        c_norm_vec = candidate_matrix_norm[cand_idx]
        feat_comp = compute_feature_contributions(
            target_orig=target_median,
            candidate_orig=c_orig_vec,
            target_norm=target_vector_norm,
            candidate_norm=c_norm_vec,
            weights=norm_weights,
            feature_names=feature_names
        )
        expl_text = generate_explanation_text(feat_comp)

        # Dataset references
        ds_refs = []
        if c_cell.region and c_cell.region.source_dataset_id:
            ds_refs.append(c_cell.region.source_dataset_id)

        cluster_id = kmeans_info["labels"][cand_idx]
        anomaly_flag = bool(is_anomaly_mask[cand_idx])

        cell_lat = c_cell.lat if c_cell.lat is not None else (c_cell.region.lat if c_cell.region else 0.0)
        cell_lon = c_cell.lon if c_cell.lon is not None else (c_cell.region.lon if c_cell.region else 0.0)

        match = CandidateMatch(
            analysis_id=analysis.id,
            earth_region_id=c_cell.region_id,
            terrain_feature_id=c_cell.id,
            target_region_id=target_region_id,
            location_name=c_cell.region.name if c_cell.region else "Earth Analog Location",
            lat=cell_lat,
            lon=cell_lon,
            similarity_score=sim_score,
            confidence_score=conf_res["confidence"],
            confidence_components_json=json.dumps(conf_res["components"]),
            mission_suitability_score=None,  # STRICTLY NULL IN PART 5
            data_coverage=c_cell.valid_fraction,
            cluster_id=cluster_id,
            is_anomaly=anomaly_flag,
            feature_comparison_json=json.dumps(feat_comp),
            dataset_references_json=json.dumps(ds_refs),
            explanation_json=json.dumps(expl_text),
            score_breakdown_json=json.dumps({
                "similarity": sim_score,
                "weighted_distance": dist_score,
                "confidence_score": conf_res["confidence"]
            })
        )
        matches.append(match)

    db.add_all(matches)
    analysis.status = "completed"
    analysis.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(analysis)

    return analysis
