from pydantic import BaseModel
from typing import Optional

class EyeMetrics(BaseModel):
    ear: float
    is_closed: bool
    blink_count: int
    blink_rate: float
    perclos: float
    fatigue_score: float
    fatigue_label: str

class DrowsinessMetrics(BaseModel):
    drowsiness_score: float
    drowsiness_label: str
    is_yawning: bool
    yawn_count: int
    mar: float
    microsleep_detected: bool
    alert_triggered: bool
    alert_message: str

class PostureMetrics(BaseModel):
    neck_angle: float
    shoulder_diff: float
    slouch_score: float
    posture_score: float
    posture_label: str
    neck_alert: bool
    shoulder_alert: bool
    slouch_alert: bool
    alert_message: str

class FrameAnalysisResponse(BaseModel):
    face_detected: bool
    pose_detected: bool
    eye: Optional[EyeMetrics] = None
    drowsiness: Optional[DrowsinessMetrics] = None
    posture: Optional[PostureMetrics] = None
    frame_number: int = 0
    timestamp: float = 0.0

class SessionSummaryResponse(BaseModel):
    duration_seconds: float
    total_frames: int
    avg_ear: float
    avg_blink_rate: float
    avg_posture_score: float
    avg_drowsiness_score: float
    total_yawns: int
    fatigue_label: str
    posture_label: str
    drowsiness_label: str
    recommendations: list[str]
