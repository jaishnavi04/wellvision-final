import uuid, logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.core.firebase_admin import get_firestore_client
from app.schemas.report_schema import WellnessReport, SessionRecord, GenerateReportRequest
from app.services.wellness_score_service import compute_wellness_score

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate", response_model=WellnessReport)
def generate_report(payload: GenerateReportRequest, current_user: dict = Depends(get_current_user)):
    uid=current_user["uid"]; db=get_firestore_client()
    now=datetime.utcnow(); delta={"daily":1,"weekly":7,"monthly":30}.get(payload.period,7)
    docs=db.collection("sessions").where("userId","==",uid).order_by("startedAt",direction="DESCENDING").limit(100).stream()
    sessions_data=[d.to_dict() for d in docs]
    if not sessions_data: raise HTTPException(status_code=404, detail=f"No sessions for {payload.period}.")
    wellness_scores=[]; stress_scores=[]; posture_scores=[]; energy_levels=[]; emotions=[]; sessions_out=[]
    for s in sessions_data:
        vd=s.get("voiceData",{}) or {}; vid=s.get("visionData",{}) or {}
        ws=s.get("wellnessScore") or compute_wellness_score(stress_score=vd.get("stressScore"),energy_level=vd.get("energyLevel"),posture_score=vid.get("postureScore"))["wellness_score"]
        wellness_scores.append(ws)
        if vd.get("stressScore"):  stress_scores.append(vd["stressScore"])
        if vid.get("postureScore"): posture_scores.append(vid["postureScore"])
        if vd.get("energyLevel"):  energy_levels.append(vd["energyLevel"])
        if vd.get("emotion"):      emotions.append(vd["emotion"])
        sessions_out.append(SessionRecord(session_id=s.get("sessionId",str(uuid.uuid4())),session_type=s.get("type","combined"),started_at=str(s.get("startedAt","")),duration_seconds=s.get("duration",0),wellness_score=round(ws,1),stress_score=vd.get("stressScore"),emotion=vd.get("emotion"),energy_level=vd.get("energyLevel"),posture_score=vid.get("postureScore"),transcript=(vd.get("transcript","")[:200])))
    avg=lambda lst:round(sum(lst)/len(lst),1) if lst else 0.0
    avg_wellness=avg(wellness_scores); avg_stress=avg(stress_scores) if stress_scores else 50.0; avg_posture=avg(posture_scores) if posture_scores else 75.0; avg_energy=avg(energy_levels) if energy_levels else 50.0
    dominant_emotion=max(set(emotions),key=emotions.count) if emotions else "neutral"
    mid=len(wellness_scores)//2; trend="stable"
    if mid>0:
        fh=sum(wellness_scores[:mid])/mid; sh=sum(wellness_scores[mid:])/max(len(wellness_scores)-mid,1)
        if sh-fh>5: trend="improving"
        elif fh-sh>5: trend="declining"
    insights=[]
    if trend=="improving": insights.append("Your wellness is trending upward.")
    if avg_stress>60: insights.append(f"Average stress of {avg_stress:.0f}% is high. Schedule recovery time.")
    if avg_posture<60: insights.append(f"Posture averaged {avg_posture:.0f}% — consider ergonomic changes.")
    if not insights: insights.append("Consistent patterns this period. Keep tracking.")
    report_id=str(uuid.uuid4())
    db.collection("reports").document(report_id).set({"reportId":report_id,"userId":uid,"period":payload.period,"generatedAt":datetime.utcnow().isoformat(),"avgWellnessScore":avg_wellness,"sessionsCount":len(sessions_out),"trend":trend})
    return WellnessReport(report_id=report_id,user_id=uid,period=payload.period,generated_at=datetime.utcnow().isoformat(),sessions_count=len(sessions_out),avg_wellness_score=avg_wellness,avg_stress_score=avg_stress,avg_posture_score=avg_posture,avg_energy_level=avg_energy,dominant_emotion=dominant_emotion,trend=trend,sessions=sessions_out,top_recommendations=insights[:3],insights=insights)

@router.get("/latest", response_model=WellnessReport)
def get_latest_report(current_user: dict = Depends(get_current_user)):
    uid=current_user["uid"]; db=get_firestore_client()
    docs=list(db.collection("reports").where("userId","==",uid).order_by("generatedAt",direction="DESCENDING").limit(1).stream())
    if not docs: raise HTTPException(status_code=404, detail="No reports found.")
    d=docs[0].to_dict()
    return WellnessReport(report_id=d.get("reportId",""),user_id=uid,period=d.get("period","weekly"),generated_at=d.get("generatedAt",""),sessions_count=d.get("sessionsCount",0),avg_wellness_score=d.get("avgWellnessScore",0),avg_stress_score=50,avg_posture_score=75,avg_energy_level=50,dominant_emotion="neutral",trend=d.get("trend","stable"),sessions=[],top_recommendations=[],insights=[])
