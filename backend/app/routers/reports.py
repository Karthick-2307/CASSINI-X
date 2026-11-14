import os
import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db import get_db
from app.models import Analysis, CandidateMatch, MissionRoute, Report
from app.reports.pdf_generator import generate_pdf_report
from app.schemas import ReportGenerateRequest, ReportItemResponse

logger = logging.getLogger("astra-x.reports")
router = APIRouter(tags=["Scientific Reports"])


@router.post("/api/reports/generate", response_model=ReportItemResponse)
def generate_report_endpoint(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == req.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis {req.analysis_id} not found.")

    cand_query = db.query(CandidateMatch).filter(CandidateMatch.analysis_id == analysis.id)
    if req.candidate_ids:
        cand_query = cand_query.filter(CandidateMatch.id.in_(req.candidate_ids))
    candidates = cand_query.order_by(desc(CandidateMatch.similarity_score)).all()

    route = None
    if req.route_id:
        route = db.query(MissionRoute).filter(MissionRoute.id == req.route_id).first()

    report_title = req.title or f"Analog Discovery Assessment - {analysis.target_region.name if analysis.target_region else 'Planetary Target'}"

    try:
        pdf_path = generate_pdf_report(
            analysis=analysis,
            candidates=candidates,
            route=route,
            output_dir="data/reports"
        )
    except Exception as e:
        logger.error(f"PDF report generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF report generation failed: {str(e)}")

    file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0

    report_record = Report(
        analysis_id=analysis.id,
        candidate_ids_json=json.dumps(req.candidate_ids or [c.id for c in candidates]),
        route_id=req.route_id,
        title=report_title,
        file_path=pdf_path
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return ReportItemResponse(
        id=report_record.id,
        analysis_id=analysis.id,
        title=report_record.title,
        file_path=report_record.file_path,
        file_size_bytes=file_size,
        created_at=report_record.created_at.isoformat() if report_record.created_at else ""
    )


@router.get("/api/reports", response_model=List[ReportItemResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(desc(Report.created_at)).all()
    results = []
    for r in reports:
        sz = os.path.getsize(r.file_path) if os.path.exists(r.file_path) else 0
        results.append(
            ReportItemResponse(
                id=r.id,
                analysis_id=r.analysis_id,
                title=r.title,
                file_path=r.file_path,
                file_size_bytes=sz,
                created_at=r.created_at.isoformat() if r.created_at else ""
            )
        )
    return results


@router.get("/api/reports/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report PDF file not found on disk.")

    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="application/pdf"
    )

