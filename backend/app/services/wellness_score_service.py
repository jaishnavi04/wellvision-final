import numpy as np
from typing import Optional

WEIGHTS = {"stress":0.30,"energy":0.20,"posture":0.20,"fatigue":0.15,"drowsiness":0.10,"confidence":0.05}

def compute_wellness_score(stress_score=None, energy_level=None, posture_score=None,
                           fatigue_score=None, drowsiness_score=None, confidence_score=None) -> dict:
    def safe(val, default=50.0): return float(val) if val is not None else default
    s=safe(stress_score); e=safe(energy_level); p=safe(posture_score)
    f=safe(fatigue_score); d=safe(drowsiness_score); c=safe(confidence_score)
    raw = (WEIGHTS["stress"]*(100-s) + WEIGHTS["energy"]*e + WEIGHTS["posture"]*p +
           WEIGHTS["fatigue"]*(100-f) + WEIGHTS["drowsiness"]*(100-d) + WEIGHTS["confidence"]*c)
    score = float(np.clip(raw,0,100))
    label = "Excellent" if score>=80 else "Good" if score>=65 else "Fair" if score>=45 else "Poor"
    return {"wellness_score":round(score,1),"label":label,"trend_hint":"improving" if score>=75 else "declining" if score<40 else "stable"}
