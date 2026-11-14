from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.assistant.engine import process_assistant_query
from app.schemas import AssistantQueryRequest, AssistantQueryResponse

router = APIRouter(tags=["Scientific Assistant"])


@router.post("/api/assistant/query", response_model=AssistantQueryResponse)
@router.post("/api/assistant/ask", response_model=AssistantQueryResponse)
def ask_assistant(req: AssistantQueryRequest, db: Session = Depends(get_db)):
    result = process_assistant_query(
        db=db,
        query_text=req.query,
        region_id=req.region_id,
        analysis_id=req.analysis_id
    )
    return AssistantQueryResponse(**result)

