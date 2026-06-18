from pydantic import BaseModel
from typing import Optional
from enum import Enum

class Priority(str, Enum):
    critical = "critical"
    high     = "high"
    medium   = "medium"
    low      = "low"

class Category(str, Enum):
    stress    = "stress"
    fatigue   = "fatigue"
    posture   = "posture"
    mood      = "mood"
    energy    = "energy"
    hydration = "hydration"
    sleep     = "sleep"
    breathing = "breathing"

class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    tips: list[str]
    priority: Priority
    category: Category
    icon: str
    duration: str

class RecommendationResponse(BaseModel):
    wellness_score: float
    recommendations: list[Recommendation]
    generated_at: str
    summary: str
