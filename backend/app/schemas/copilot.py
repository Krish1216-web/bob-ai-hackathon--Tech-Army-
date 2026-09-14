from pydantic import BaseModel
from typing import List, Optional

class CopilotQueryRequest(BaseModel):
    query: str

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    sources: List[str]
    suggested_actions: Optional[List[str]] = []
