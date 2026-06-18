from pydantic import BaseModel
from typing import Optional

class SessionRecord(BaseModel):
    session_id: str
    session_type: str
    started_at: str
    duration_seconds: float
    wellness_score: float
    stress_score: Optional[float] = None
    emotion: Optional[str] = None
    energy_level: Optional[float] = None
    posture_score: Optional[float] = None
    fatigue_score: Optional[float] = None
    drowsiness_score: Optional[float] = None
    transcript: Optional[str] = None

class WellnessReport(BaseModel):
    report_id: str
    user_id: str
    period: str
    generated_at: str
    sessions_count: int
    avg_wellness_score: float
    avg_stress_score: float
    avg_posture_score: float
    avg_energy_level: float
    dominant_emotion: str
    trend: str
    sessions: list[SessionRecord]
    top_recommendations: list[str]
    insights: list[str]

class GenerateReportRequest(BaseModel):
    period: str = "weekly"
