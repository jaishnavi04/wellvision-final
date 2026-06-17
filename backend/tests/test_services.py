"""
WellVision AI - Backend Tests
Run: pytest tests/ -v
"""
import pytest

# ── Wellness Score Service ────────────────────────────────────────────────────
def test_compute_wellness_score_all_good():
    from app.services.wellness_score_service import compute_wellness_score
    result = compute_wellness_score(stress_score=20, energy_level=80, posture_score=85, fatigue_score=15, drowsiness_score=10, confidence_score=75)
    assert result["wellness_score"] > 70
    assert result["label"] in ("Excellent", "Good")

def test_compute_wellness_score_all_bad():
    from app.services.wellness_score_service import compute_wellness_score
    result = compute_wellness_score(stress_score=90, energy_level=20, posture_score=30, fatigue_score=80, drowsiness_score=70, confidence_score=25)
    assert result["wellness_score"] < 50
    assert result["label"] in ("Fair", "Poor")

def test_compute_wellness_score_defaults():
    from app.services.wellness_score_service import compute_wellness_score
    result = compute_wellness_score()
    assert "wellness_score" in result
    assert 0 <= result["wellness_score"] <= 100

# ── Emotion Service ───────────────────────────────────────────────────────────
def test_analyse_wellness_stressed_keywords():
    from app.services.voice.emotion_service import analyse_wellness
    features = {"pitch_std":50.0,"energy_mean":0.12,"zcr_mean":0.09,"voiced_ratio":0.6,"pitch_mean":200.0,"spectral_centroid":2500.0}
    result = analyse_wellness(features, "I feel so tired and overwhelmed")
    assert result["emotion"] in ("stressed", "sad", "anxious", "neutral")
    assert 0 <= result["stress_score"] <= 100
    assert 0 <= result["energy_level"] <= 100
    assert result["recommendation"] != ""

def test_analyse_wellness_happy_keywords():
    from app.services.voice.emotion_service import analyse_wellness
    features = {"pitch_std":20.0,"energy_mean":0.10,"zcr_mean":0.05,"voiced_ratio":0.7,"pitch_mean":180.0,"spectral_centroid":2200.0}
    result = analyse_wellness(features, "I feel great today, amazing and wonderful!")
    assert result["emotion"] in ("happy", "calm", "neutral")

# ── Eye Fatigue Tracker ───────────────────────────────────────────────────────
def test_eye_fatigue_tracker_open_eyes():
    from app.services.vision.eye_fatigue_service import EyeFatigueTracker
    tracker = EyeFatigueTracker()
    # Simulate open-eye coordinates (EAR > threshold)
    open_eye = [(0.0,0.0,0),(0.05,-0.06,0),(0.10,-0.08,0),(0.20,0.0,0),(0.15,0.06,0),(0.05,0.06,0)]
    for _ in range(10):
        state = tracker.update(open_eye, open_eye)
    assert state.ear > 0.0
    assert state.fatigue_label in ("Normal", "Moderate Fatigue", "High Fatigue")

def test_eye_fatigue_tracker_closed_eyes():
    from app.services.vision.eye_fatigue_service import EyeFatigueTracker
    tracker = EyeFatigueTracker()
    # Very closed eye (EAR ≈ 0)
    closed_eye = [(0.0,0.0,0),(0.05,-0.01,0),(0.10,-0.01,0),(0.20,0.0,0),(0.15,0.01,0),(0.05,0.01,0)]
    for _ in range(15):
        state = tracker.update(closed_eye, closed_eye)
    assert state.is_closed == True

# ── Posture Tracker ───────────────────────────────────────────────────────────
def test_posture_tracker_no_landmarks():
    from app.services.vision.posture_service import PostureTracker
    tracker = PostureTracker()
    state = tracker.update(None, 640, 480)
    assert state.posture_score == 100.0  # default when no landmarks

# ── Recommendation Engine ─────────────────────────────────────────────────────
def test_recommendations_high_stress():
    from app.services.recommendation_engine import generate_recommendations
    result = generate_recommendations(stress_score=80, wellness_score=40)
    assert len(result.recommendations) > 0
    assert result.recommendations[0].priority.value in ("critical", "high")

def test_recommendations_all_good():
    from app.services.recommendation_engine import generate_recommendations
    result = generate_recommendations(stress_score=15, energy_level=80, posture_score=90, wellness_score=85)
    assert any(r.id == "great_session" for r in result.recommendations)

# ── Config ────────────────────────────────────────────────────────────────────
def test_settings_defaults():
    from app.core.config import get_settings
    settings = get_settings()
    assert settings.app_name == "WellVision AI"
    assert settings.api_prefix == "/api/v1"
