from datetime import datetime
from app.schemas.recommendation_schema import Recommendation, RecommendationResponse, Priority, Category

RECS = {
"high_stress": Recommendation(id="high_stress",title="Stress Relief Needed",description="Your stress indicators are elevated.",
    tips=["Box breathing: 4s in, 4s hold, 4s out, 4s hold.","Step outside for 5-10 minutes.","Write down 3 stressors — externalising reduces load."],
    priority=Priority.critical,category=Category.stress,icon="🧘",duration="5 min"),
"moderate_stress": Recommendation(id="moderate_stress",title="Mild Stress Detected",description="Moderate stress in your voice. A brief reset will help.",
    tips=["4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.","Stretch neck and shoulders for 2 minutes."],
    priority=Priority.high,category=Category.stress,icon="😤",duration="3 min"),
"eye_fatigue": Recommendation(id="eye_fatigue",title="Eye Strain Detected",description="Your eye metrics suggest digital eye strain.",
    tips=["20-20-20 rule every 20 minutes.","Blink consciously 10 times now.","Reduce screen brightness."],
    priority=Priority.high,category=Category.fatigue,icon="👁️",duration="2 min"),
"low_energy": Recommendation(id="low_energy",title="Low Energy Levels",description="Voice energy patterns indicate fatigue.",
    tips=["Drink a large glass of water now.","Have a protein + complex-carb snack.","Walk for 5 minutes to boost blood flow."],
    priority=Priority.medium,category=Category.energy,icon="⚡",duration="20 min"),
"poor_posture": Recommendation(id="poor_posture",title="Posture Correction Needed",description="Sustained poor posture increases neck and back strain.",
    tips=["Adjust chair: elbows at 90°, screen at eye level.","Chin tuck exercise: gently pull chin back 10 times.","Set a posture reminder every 30 minutes."],
    priority=Priority.high,category=Category.posture,icon="🪑",duration="5 min"),
"drowsiness": Recommendation(id="drowsiness",title="Drowsiness Alert",description="You appear drowsy. Continuing reduces cognitive output by 30%.",
    tips=["Take a 10-20 minute break immediately.","Cold water on your face activates the dive reflex.","Avoid driving or operating machinery."],
    priority=Priority.critical,category=Category.sleep,icon="😴",duration="15 min"),
"hydration": Recommendation(id="hydration",title="Stay Hydrated",description="Regular hydration maintains focus and reduces fatigue.",
    tips=["Drink 250ml of water now.","Keep a water bottle visible at your desk.","Aim for 2L spread across the day."],
    priority=Priority.low,category=Category.hydration,icon="💧",duration="1 min"),
"great_session": Recommendation(id="great_session",title="You're in Great Shape!",description="All wellness indicators are in a healthy range.",
    tips=["Schedule cognitively demanding tasks now.","Share your positive energy with your team.","Note what's working today to replicate it."],
    priority=Priority.low,category=Category.mood,icon="🌟",duration="—"),
}

def generate_recommendations(stress_score=50,energy_level=50,posture_score=80,fatigue_score=20,
                             drowsiness_score=10,confidence_score=70,emotion="neutral",
                             wellness_score=70,slouch_score=0,neck_alert=False) -> RecommendationResponse:
    selected = []
    if stress_score >= 65: selected.append(RECS["high_stress"])
    elif stress_score >= 40: selected.append(RECS["moderate_stress"])
    if fatigue_score >= 55: selected.append(RECS["eye_fatigue"])
    if energy_level <= 30: selected.append(RECS["low_energy"])
    if drowsiness_score >= 45: selected.append(RECS["drowsiness"])
    if posture_score <= 55 or neck_alert: selected.append(RECS["poor_posture"])
    if stress_score >= 30: selected.append(RECS["hydration"])
    if not selected or wellness_score >= 78: selected = [RECS["great_session"]]
    priority_order = {Priority.critical:0,Priority.high:1,Priority.medium:2,Priority.low:3}
    selected.sort(key=lambda r: priority_order[r.priority])
    summary = (f"Excellent session. Wellness score of {wellness_score:.0f} is in the top tier." if wellness_score>=80
               else f"Good overall wellness ({wellness_score:.0f}/100)." if wellness_score>=65
               else f"Wellness score is {wellness_score:.0f}/100 — focus on the top recommendations.")
    return RecommendationResponse(wellness_score=round(wellness_score,1),recommendations=selected[:6],generated_at=datetime.utcnow().isoformat(),summary=summary)
