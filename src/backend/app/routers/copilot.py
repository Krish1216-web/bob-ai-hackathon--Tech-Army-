from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.services.copilot_service import CopilotService

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    return CopilotService.answer_query(
        db=db,
        query=req.query,
        api_key=req.api_key,
        provider=req.provider or "auto",
        conversation_history=req.conversation_history or []
    )
