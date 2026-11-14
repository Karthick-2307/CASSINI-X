from typing import Optional, List
from pydantic import BaseModel


class ReportGenerateRequest(BaseModel):
    analysis_id: int
    candidate_ids: Optional[List[int]] = None
    route_id: Optional[int] = None
    title: Optional[str] = None


class ReportItemResponse(BaseModel):
    id: int
    analysis_id: int
    title: str
    file_path: str
    file_size_bytes: int
    created_at: str

