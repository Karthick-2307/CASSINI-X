from typing import Optional, List, Dict
from pydantic import BaseModel


class AssistantQueryRequest(BaseModel):
    query: str
    region_id: Optional[int] = None
    analysis_id: Optional[int] = None


class AssistantQueryResponse(BaseModel):
    answer: str
    intent: str
    sources: List[Dict[str, str]]
    engine: str

