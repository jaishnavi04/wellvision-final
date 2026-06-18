import json, base64, time, logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from app.api.deps import get_current_user
from app.schemas.vision_schema import FrameAnalysisResponse, SessionSummaryResponse, EyeMetrics, DrowsinessMetrics, PostureMetrics
from app.services.vision.mediapipe_service  import extract_landmarks
from app.services.vision.eye_fatigue_service import EyeFatigueTracker
from app.services.vision.drowsiness_service  import DrowsinessTracker
from app.services.vision.posture_service     import PostureTracker

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vision", tags=["Vision Analysis"])

@router.websocket("/ws/vision")
async def vision_websocket(websocket: WebSocket):
    await websocket.accept()
    eye_tracker=EyeFatigueTracker(); drowsy_tracker=DrowsinessTracker(); posture_tracker=PostureTracker()
    frame_count=0; session_start=time.time()
    ear_history=[]; blink_rate_history=[]; posture_history=[]; drowsiness_history=[]; yawn_total=0; authenticated=False
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw); msg_type = msg.get("type","")
            if msg_type == "auth":
                from app.core.firebase_admin import verify_firebase_token
                try: verify_firebase_token(msg.get("token","")); authenticated=True; await websocket.send_text(json.dumps({"type":"auth_ok"}))
                except Exception: await websocket.send_text(json.dumps({"type":"error","message":"Invalid token"})); await websocket.close(); return
                continue
            if not authenticated: await websocket.send_text(json.dumps({"type":"error","message":"Not authenticated"})); continue
            if msg_type == "frame":
                try:
                    b64=msg.get("data","");
                    if "," in b64: b64=b64.split(",",1)[1]
                    frame_bytes=base64.b64decode(b64); frame_count+=1
                    lm=extract_landmarks(frame_bytes)
                    eye_state=None; drowsy_state=None; posture_state=None
                    if lm.face_detected:
                        eye_state=eye_tracker.update(lm.left_eye,lm.right_eye)
                        drowsy_state=drowsy_tracker.update(lm.mouth_landmarks,eye_state.perclos,eye_state.consecutive_closed,eye_state.fatigue_score)
                    if lm.pose_detected:
                        posture_state=posture_tracker.update(lm.pose_landmarks,lm.width,lm.height)
                    if eye_state: ear_history.append(eye_state.ear); blink_rate_history.append(eye_state.blink_rate)
                    if posture_state: posture_history.append(posture_state.posture_score)
                    if drowsy_state: drowsiness_history.append(drowsy_state.drowsiness_score); yawn_total=drowsy_state.yawn_count
                    result=FrameAnalysisResponse(face_detected=lm.face_detected,pose_detected=lm.pose_detected,frame_number=frame_count,timestamp=time.time(),
                        eye=EyeMetrics(ear=eye_state.ear,is_closed=eye_state.is_closed,blink_count=eye_state.blink_count,blink_rate=eye_state.blink_rate,perclos=eye_state.perclos,fatigue_score=eye_state.fatigue_score,fatigue_label=eye_state.fatigue_label) if eye_state else None,
                        drowsiness=DrowsinessMetrics(drowsiness_score=drowsy_state.drowsiness_score,drowsiness_label=drowsy_state.drowsiness_label,is_yawning=drowsy_state.is_yawning,yawn_count=drowsy_state.yawn_count,mar=drowsy_state.mar,microsleep_detected=drowsy_state.microsleep_detected,alert_triggered=drowsy_state.alert_triggered,alert_message=drowsy_state.alert_message) if drowsy_state else None,
                        posture=PostureMetrics(neck_angle=posture_state.neck_angle,shoulder_diff=posture_state.shoulder_diff,slouch_score=posture_state.slouch_score,posture_score=posture_state.posture_score,posture_label=posture_state.posture_label,neck_alert=posture_state.neck_alert,shoulder_alert=posture_state.shoulder_alert,slouch_alert=posture_state.slouch_alert,alert_message=posture_state.alert_message) if posture_state else None)
                    await websocket.send_text(result.model_dump_json())
                except Exception as exc: logger.error(f"Frame error: {exc}"); await websocket.send_text(json.dumps({"type":"error","message":"Frame processing failed"}))
            elif msg_type == "stop":
                import numpy as np
                avg=lambda lst:round(float(np.mean(lst)),1) if lst else 0.0
                avg_ear=avg(ear_history); avg_blink=avg(blink_rate_history); avg_posture=avg(posture_history); avg_drowsy=avg(drowsiness_history)
                recs=[]; 
                if avg_ear<0.20: recs.append("Apply 20-20-20 rule: every 20min look 20ft away for 20 seconds.")
                if avg_blink<12: recs.append("Blink consciously more often to prevent dry eyes.")
                if avg_posture<60: recs.append("Adjust chair height so screen is at eye level.")
                if yawn_total>=3: recs.append("Multiple yawns detected — consider a 10-15 min break.")
                if not recs: recs.append("Great session! Posture and alertness looked good.")
                summary=SessionSummaryResponse(duration_seconds=round(time.time()-session_start,1),total_frames=frame_count,avg_ear=avg_ear,avg_blink_rate=avg_blink,avg_posture_score=avg_posture,avg_drowsiness_score=avg_drowsy,total_yawns=yawn_total,
                    fatigue_label="High Fatigue" if avg_ear<0.18 else "Moderate" if avg_ear<0.22 else "Normal",
                    posture_label="Good" if avg_posture>=80 else "Fair" if avg_posture>=55 else "Poor",
                    drowsiness_label="Severely Drowsy" if avg_drowsy>=70 else "Drowsy" if avg_drowsy>=45 else "Alert",
                    recommendations=recs)
                data=summary.model_dump(); data["type"]="summary"
                await websocket.send_text(json.dumps(data)); break
    except WebSocketDisconnect: logger.info(f"Vision WS disconnected after {frame_count} frames.")
    except Exception as exc: logger.error(f"Vision WS error: {exc}", exc_info=True)
    finally: await websocket.close()
