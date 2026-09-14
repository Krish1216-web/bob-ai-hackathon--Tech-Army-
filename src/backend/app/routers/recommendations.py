from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.recommendation import RecommendationResponse, RecommendationActionRequest, RecommendationActionResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def list_recommendations(include_actioned: bool = Query(False), db: Session = Depends(get_db)):
    return RecommendationService.get_all(db, include_actioned)

@router.post("/{action_id}/action", response_model=RecommendationActionResponse)
def execute_recommendation_action(
    action_id: str,
    req: RecommendationActionRequest = RecommendationActionRequest(accept=True),
    db: Session = Depends(get_db)
):
    res = RecommendationService.execute_action(db, action_id, req.accept)
    if not res.success:
        raise HTTPException(status_code=404, detail=res.message)
    return res
