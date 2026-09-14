from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CopilotQueryRequest(BaseModel):
    query: str
    api_key: Optional[str] = None
    provider: Optional[str] = "auto" # "gemini", "groq", "openai", "watsonx", "auto"
    conversation_history: Optional[List[Dict[str, Any]]] = []

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    sources: List[str]
    suggested_actions: Optional[List[str]] = []
    provider_used: Optional[str] = "IBM watsonx.ai + RAG Engine"
