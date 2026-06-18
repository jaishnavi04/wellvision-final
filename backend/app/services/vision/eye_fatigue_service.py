import numpy as np
from collections import deque
from dataclasses import dataclass
import time, logging

logger = logging.getLogger(__name__)
EAR_THRESHOLD  = 0.21
BLINK_FRAMES   = 2
PERCLOS_WINDOW = 60
FATIGUE_PERCLOS= 0.15

@dataclass
class EyeState:
    ear: float = 0.0
    is_closed: bool = False
    blink_count: int = 0
    blink_rate: float = 0.0
    perclos: float = 0.0
    fatigue_score: float = 0.0
    fatigue_label: str = "Normal"
    consecutive_closed: int = 0

class EyeFatigueTracker:
    def __init__(self):
        self.state = EyeState()
        self._blink_times: deque = deque()
        self._closed_log: deque = deque()
        self._session_start = time.time()

    @staticmethod
    def _ear(eye_pts: list) -> float:
        if len(eye_pts) < 6:
            return 0.3
        def dist(a, b):
            return np.linalg.norm(np.array(a[:2]) - np.array(b[:2]))
        p1, p2, p3, p4, p5, p6 = eye_pts[:6]
        vertical = dist(p2, p6) + dist(p3, p5)
        horizontal = dist(p1, p4) * 2.0
        return float(vertical/horizontal) if horizontal > 0 else 0.3

    def update(self, left_eye: list, right_eye: list) -> EyeState:
        now = time.time()
        ear = (self._ear(left_eye) + self._ear(right_eye)) / 2.0
        self.state.ear = round(ear, 4)
        is_closed = ear < EAR_THRESHOLD
        self.state.is_closed = is_closed
        if is_closed:
            self.state.consecutive_closed += 1
        else:
            if self.state.consecutive_closed >= BLINK_FRAMES:
                self.state.blink_count += 1
                self._blink_times.append(now)
            self.state.consecutive_closed = 0
        while self._blink_times and now - self._blink_times[0] > 60:
            self._blink_times.popleft()
        elapsed_min = (now - self._session_start) / 60.0
        if elapsed_min > 0:
            self.state.blink_rate = round(min(len(self._blink_times)/min(elapsed_min,1.0), 40), 1)
        self._closed_log.append((now, is_closed))
        cutoff = now - PERCLOS_WINDOW
        while self._closed_log and self._closed_log[0][0] < cutoff:
            self._closed_log.popleft()
        if self._closed_log:
            closed_frames = sum(1 for _, c in self._closed_log if c)
            self.state.perclos = round(closed_frames/len(self._closed_log), 4)
        perclos_score = min(self.state.perclos/FATIGUE_PERCLOS, 1.0) * 60
        blink_fatigue = 40.0 if self.state.blink_rate < 8 else 20.0 if self.state.blink_rate < 12 else 0.0
        fatigue = min(perclos_score + blink_fatigue, 100.0)
        self.state.fatigue_score = round(fatigue, 1)
        self.state.fatigue_label = "High Fatigue" if fatigue >= 60 else "Moderate Fatigue" if fatigue >= 35 else "Normal"
        return self.state

    def reset(self): self.__init__()
