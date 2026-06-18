from pydantic import BaseModel
from typing import Optional

class AudioFeatures(BaseModel):
    mfcc_mean: float
    mfcc_std: float
    pitch_mean: float
    pitch_std: float
    energy_mean: float
    zcr_mean: float
    tempo: float
    spectral_centroid: float

class VoiceAnalysisResponse(BaseModel):
    transcript: str
    language: str
    stress_score: float
    energy_level: float
    confidence_score: float
    emotion: str
    emotion_intensity: float
    features: Optional[AudioFeatures] = None
    recommendation: str
    recommendation_tips: list[str]
