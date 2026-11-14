import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db import get_db
from app.models import Planet, Region, Analysis, CandidateMatch
from app.analysis.engine import run_analysis_pipeline
from app.analysis.validate import execute_validation_pipeline
from app.schemas import (
    AnalysisRunRequest,
    AnalysisRunResponse,
    AnalysisDetailResponse,
    CandidateMatchResponse,
    AnalysisSummaryItem,
    BenchmarkValidationResponse,
)

logger = logging.getLogger("astra-x.analysis")
router = APIRouter(tags=["Similarity Engine & Analog Discovery"])


def serialize_candidate_match(match: CandidateMatch) -> CandidateMatchResponse:
    target_id = match.target_region_id
    if target_id is None and match.analysis:
        target_id = match.analysis.target_region_id

    lat_val = match.lat
    lon_val = match.lon
    if (lat_val is None or lat_val == 0.0) and match.earth_region:
        lat_val = match.earth_region.lat
        lon_val = match.earth_region.lon

    conf_components = json.loads(match.confidence_components_json) if match.confidence_components_json else None
    feat_comparison = json.loads(match.feature_comparison_json) if match.feature_comparison_json else []
    ds_refs = json.loads(match.dataset_references_json) if match.dataset_references_json else []
    expl = json.loads(match.explanation_json) if match.explanation_json else {"similarities": [], "differences": []}

    return CandidateMatchResponse(
        id=match.id,
        location_name=match.location_name or "Earth Analog Candidate",
        lat=lat_val if lat_val is not None else 0.0,
        lon=lon_val if lon_val is not None else 0.0,
        target_region_id=target_id or 0,
        similarity=match.similarity_score,
        confidence=match.confidence_score,
        confidence_components=conf_components,
        mission_suitability=None,  # STRICTLY NULL PER SCIENTIFIC HONESTY RULES
        feature_comparison=feat_comparison,
        data_coverage=match.data_coverage,
        cluster_id=match.cluster_id,
        is_anomaly=bool(match.is_anomaly),
        dataset_references=ds_refs,
        explanation=expl
    )


@router.get("/api/analyses", response_model=List[AnalysisSummaryItem])
def get_analyses(db: Session = Depends(get_db)):
    analyses = db.query(Analysis).order_by(desc(Analysis.created_at)).all()
    results = []
    for a in analyses:
        target_name = a.target_region.name if a.target_region else "Unknown"
        planet_name = (
            a.target_region.planet.name
            if a.target_region and a.target_region.planet
            else "Unknown"
        )
        top_cand = (
            db.query(CandidateMatch)
            .filter(CandidateMatch.analysis_id == a.id)
            .order_by(desc(CandidateMatch.similarity_score))
            .first()
        )
        cand_count = db.query(CandidateMatch).filter(CandidateMatch.analysis_id == a.id).count()
        results.append(
            AnalysisSummaryItem(
                id=a.id,
                target_region_id=a.target_region_id,
                target_region_name=target_name,
                planet=planet_name,
                created_at=a.created_at.isoformat() if a.created_at else "",
                status=a.status,
                candidate_count=cand_count,
                top_similarity=top_cand.similarity_score if top_cand else None
            )
        )
    return results


@router.post("/api/analysis/run", response_model=AnalysisRunResponse)
def run_analysis(req: AnalysisRunRequest, db: Session = Depends(get_db)):
    if req.top_k is not None and req.top_k <= 0:
        raise HTTPException(status_code=422, detail="top_k must be greater than 0.")
    if req.threshold is not None and (req.threshold < 0.0 or req.threshold > 100.0):
        raise HTTPException(status_code=422, detail="threshold must be between 0.0 and 100.0.")

    target_region = db.query(Region).filter(Region.id == req.target_region_id).first()
    if not target_region:
        raise HTTPException(status_code=404, detail=f"Target region id {req.target_region_id} not found.")

    try:
        analysis = run_analysis_pipeline(
            db=db,
            target_region_id=req.target_region_id,
            earth_search_area_ids=req.earth_search_area_ids,
            features=req.features,
            weights=req.weights,
            threshold=req.threshold or 0.0,
            top_k=req.top_k or 20
        )
        return AnalysisRunResponse(
            analysis_id=analysis.id,
            status=analysis.status,
            message="Analysis completed successfully."
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to execute analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to execute analysis pipeline: {str(e)}")


@router.get("/api/analysis/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with id {analysis_id} not found.")

    target_name = analysis.target_region.name if analysis.target_region else "Unknown"
    planet_name = (
        analysis.target_region.planet.name
        if analysis.target_region and analysis.target_region.planet
        else "Unknown"
    )

    candidates = (
        db.query(CandidateMatch)
        .filter(CandidateMatch.analysis_id == analysis.id)
        .order_by(desc(CandidateMatch.similarity_score))
        .all()
    )

    return AnalysisDetailResponse(
        id=analysis.id,
        target_region_id=analysis.target_region_id,
        target_region_name=target_name,
        planet=planet_name,
        features=json.loads(analysis.features_json) if analysis.features_json else [],
        weights=json.loads(analysis.weights_json) if analysis.weights_json else {},
        threshold=analysis.threshold or 0.0,
        top_k=analysis.top_k or 20,
        status=analysis.status,
        error_message=analysis.error_message,
        scaler_params=json.loads(analysis.scaler_params_json) if analysis.scaler_params_json else None,
        target_summary=json.loads(analysis.target_summary_json) if analysis.target_summary_json else None,
        clustering_info=json.loads(analysis.clustering_info_json) if analysis.clustering_info_json else None,
        created_at=analysis.created_at.isoformat() if analysis.created_at else "",
        completed_at=analysis.completed_at.isoformat() if analysis.completed_at else None,
        candidate_count=len(candidates),
        candidates=[serialize_candidate_match(c) for c in candidates]
    )


@router.get("/api/analogs", response_model=List[CandidateMatchResponse])
def get_analogs(
    planet: Optional[str] = None,
    area: Optional[str] = None,
    min_similarity: Optional[float] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = (
        db.query(CandidateMatch)
        .join(CandidateMatch.analysis)
        .join(Analysis.target_region)
        .join(Region.planet)
    )

    if planet:
        query = query.filter(Planet.name.ilike(f"%{planet}%"))
    if area:
        query = query.filter(CandidateMatch.location_name.ilike(f"%{area}%"))
    if min_similarity is not None:
        query = query.filter(CandidateMatch.similarity_score >= min_similarity)

    matches = query.order_by(desc(CandidateMatch.similarity_score)).limit(limit).all()
    return [serialize_candidate_match(m) for m in matches]


@router.get("/api/analogs/{match_id}", response_model=CandidateMatchResponse)
def get_analog_by_id(match_id: int, db: Session = Depends(get_db)):
    match = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail=f"Analog candidate with id {match_id} not found.")
    return serialize_candidate_match(match)


@router.post("/api/benchmarks/validation", response_model=BenchmarkValidationResponse, tags=["Validation & Baselines"])
@router.get("/api/benchmarks/validation", response_model=BenchmarkValidationResponse, tags=["Validation & Baselines"])
def run_or_get_validation(db: Session = Depends(get_db)):
    try:
        report = execute_validation_pipeline(
            db_session=db,
            output_json_path="data/validation_report.json"
        )
        return BenchmarkValidationResponse(**report)
    except Exception as e:
        logger.error(f"Validation execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation execution failed: {str(e)}")

