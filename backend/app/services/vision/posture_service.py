import numpy as np
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)
NOSE=0; LEFT_EAR=7; RIGHT_EAR=8; LEFT_SHOULDER=11; RIGHT_SHOULDER=12; LEFT_HIP=23; RIGHT_HIP=24

@dataclass
class PostureState:
    neck_angle: float = 0.0
    shoulder_diff: float = 0.0
    slouch_score: float = 0.0
    posture_score: float = 100.0
    posture_label: str = "Good"
    neck_alert: bool = False
    shoulder_alert: bool = False
    slouch_alert: bool = False
    alert_message: str = ""

class PostureTracker:
    def __init__(self):
        self.state = PostureState()
        self._history = []

    @staticmethod
    def _angle_deg(a,b,c):
        ba=np.array(a)-np.array(b); bc=np.array(c)-np.array(b)
        cos=np.dot(ba,bc)/(np.linalg.norm(ba)*np.linalg.norm(bc)+1e-6)
        return float(np.degrees(np.arccos(np.clip(cos,-1.0,1.0))))

    def update(self, pose_landmarks, img_width: int, img_height: int) -> PostureState:
        if not pose_landmarks: return self.state
        def pt(idx): lm=pose_landmarks[idx]; return (lm.x,lm.y,getattr(lm,'z',0.0))
        def vis(idx): return pose_landmarks[idx].visibility > 0.5
        if not all(vis(i) for i in [LEFT_SHOULDER,RIGHT_SHOULDER,NOSE]): return self.state
        l_sh=pt(LEFT_SHOULDER); r_sh=pt(RIGHT_SHOULDER)
        l_ear=pt(LEFT_EAR) if vis(LEFT_EAR) else None; r_ear=pt(RIGHT_EAR) if vis(RIGHT_EAR) else None
        l_hip=pt(LEFT_HIP) if vis(LEFT_HIP) else None;  r_hip=pt(RIGHT_HIP) if vis(RIGHT_HIP) else None
        mid_shoulder=((l_sh[0]+r_sh[0])/2,(l_sh[1]+r_sh[1])/2,0)
        ear_mid = ((l_ear[0]+r_ear[0])/2,(l_ear[1]+r_ear[1])/2,0) if l_ear and r_ear else l_ear or r_ear
        neck_angle=0.0
        if ear_mid:
            vertical_ref=(mid_shoulder[0],mid_shoulder[1]-0.1,0)
            neck_angle=self._angle_deg(ear_mid,mid_shoulder,vertical_ref)
        self.state.neck_angle=round(neck_angle,1); self.state.neck_alert=neck_angle>25.0
        shoulder_diff=abs(l_sh[1]-r_sh[1])
        self.state.shoulder_diff=round(shoulder_diff,4); self.state.shoulder_alert=shoulder_diff>0.06
        slouch_score=0.0
        if l_hip and r_hip:
            mid_hip=((l_hip[0]+r_hip[0])/2,(l_hip[1]+r_hip[1])/2,0)
            sh_hip_diff=abs(mid_shoulder[1]-mid_hip[1])
            slouch_score=max(0.0,(0.35-sh_hip_diff)/0.35)*100
        self.state.slouch_score=round(min(slouch_score,100.0),1); self.state.slouch_alert=self.state.slouch_score>55
        raw_score=100-min(max(neck_angle-25,0)*2,40)-min(max(shoulder_diff-0.06,0)*300,25)-self.state.slouch_score*0.35
        posture_score=max(0.0,min(raw_score,100.0))
        self._history.append(posture_score)
        if len(self._history)>10: self._history.pop(0)
        self.state.posture_score=round(float(np.mean(self._history)),1)
        ps=self.state.posture_score
        self.state.posture_label="Good" if ps>=80 else "Fair" if ps>=55 else "Poor"
        alerts=[]
        if self.state.neck_alert: alerts.append(f"Head tilted forward {neck_angle:.0f}")
        if self.state.shoulder_alert: alerts.append("Shoulders uneven")
        if self.state.slouch_alert: alerts.append("Slouching detected")
        self.state.alert_message=" | ".join(alerts) if alerts else ""
        return self.state

    def reset(self): self.__init__()
