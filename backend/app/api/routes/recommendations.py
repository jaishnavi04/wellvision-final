from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.recommendation_schema import RecommendationResponse
from app.services.recommendation_engine import generate_recommendations
from app.services.wellness_score_service import compute_wellness_score
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationRequest(BaseModel):
    stress_score:     Optional[float] = 50
    energy_level:     Optional[float] = 50
    posture_score:    Optional[float] = 80
    fatigue_score:    Optional[float] = 20
    drowsiness_score: Optional[float] = 10
    confidence_score: Optional[float] = 70
    emotion:          Optional[str]   = "neutral"
    slouch_score:     Optional[float] = 0
    neck_alert:       Optional[bool]  = False

@router.post("/", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest, current_user: dict = Depends(get_current_user)):
    wellness = compute_wellness_score(stress_score=payload.stress_score, energy_level=payload.energy_level, posture_score=payload.posture_score, fatigue_score=payload.fatigue_score, drowsiness_score=payload.drowsiness_score, confidence_score=payload.confidence_score)
    return generate_recommendations(stress_score=payload.stress_score or 50, energy_level=payload.energy_level or 50, posture_score=payload.posture_score or 80, fatigue_score=payload.fatigue_score or 20, drowsiness_score=payload.drowsiness_score or 10, confidence_score=payload.confidence_score or 70, emotion=payload.emotion or "neutral", wellness_score=wellness["wellness_score"], slouch_score=payload.slouch_score or 0, neck_alert=payload.neck_alert or False)
