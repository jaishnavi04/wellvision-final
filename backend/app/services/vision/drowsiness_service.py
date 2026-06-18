import numpy as np
from dataclasses import dataclass
import time, logging

logger = logging.getLogger(__name__)
MAR_THRESHOLD      = 0.65
YAWN_MIN_DURATION  = 1.5
MICROSLEEP_FRAMES  = 10

@dataclass
class DrowsinessState:
    drowsiness_score: float = 0.0
    drowsiness_label: str = "Alert"
    is_yawning: bool = False
    yawn_count: int = 0
    mar: float = 0.0
    microsleep_detected: bool = False
    alert_triggered: bool = False
    alert_message: str = ""

class DrowsinessTracker:
    def __init__(self):
        self.state = DrowsinessState()
        self._yawn_start = None
        self._yawn_frames = 0
        self._microsleep_frames = 0

    @staticmethod
    def _mar(mouth_pts: list) -> float:
        if len(mouth_pts) < 8: return 0.0
        def dist(a,b): return np.linalg.norm(np.array(a[:2])-np.array(b[:2]))
        horizontal = dist(mouth_pts[0], mouth_pts[1])
        if horizontal < 1e-6: return 0.0
        vertical = (dist(mouth_pts[2],mouth_pts[3])+dist(mouth_pts[4],mouth_pts[5])+dist(mouth_pts[6],mouth_pts[7]))/3.0
        return float(vertical/horizontal)

    def update(self, mouth_pts: list, perclos: float, consecutive_closed: int, fatigue_score: float) -> DrowsinessState:
        now = time.time()
        mar = self._mar(mouth_pts)
        self.state.mar = round(mar, 4)
        if mar > MAR_THRESHOLD:
            self._yawn_frames += 1
            if self._yawn_start is None: self._yawn_start = now
            self.state.is_yawning = True
            if (now-self._yawn_start)>=YAWN_MIN_DURATION and self._yawn_frames==MICROSLEEP_FRAMES:
                self.state.yawn_count += 1
        else:
            if self.state.is_yawning: self._yawn_start=None; self._yawn_frames=0
            self.state.is_yawning = False
        if consecutive_closed >= MICROSLEEP_FRAMES: self._microsleep_frames+=1; self.state.microsleep_detected=True
        else: self._microsleep_frames=0; self.state.microsleep_detected=False
        score = min(min(perclos/0.25,1.0)*50 + (fatigue_score/100)*30 + min(self.state.yawn_count*5,15) + (20 if self.state.microsleep_detected else 0), 100.0)
        self.state.drowsiness_score = round(score, 1)
        if score >= 70 or self.state.microsleep_detected:
            self.state.drowsiness_label="Severely Drowsy"; self.state.alert_triggered=True; self.state.alert_message="Microsleep detected! Take a break immediately."
        elif score >= 45:
            self.state.drowsiness_label="Drowsy"; self.state.alert_triggered=True; self.state.alert_message="Drowsiness detected. Consider a short break."
        elif self.state.is_yawning:
            self.state.drowsiness_label="Slightly Drowsy"; self.state.alert_triggered=False; self.state.alert_message="Yawning detected. Stay hydrated."
        else:
            self.state.drowsiness_label="Alert"; self.state.alert_triggered=False; self.state.alert_message=""
        return self.state

    def reset(self): self.__init__()
