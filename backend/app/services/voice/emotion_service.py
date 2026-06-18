import numpy as np
import logging

logger = logging.getLogger(__name__)

def _norm(value, low, high):
    return float(np.clip((value-low)/(high-low)*100, 0, 100))

def analyse_wellness(features: dict, transcript: str) -> dict:
    pitch_std  = features.get("pitch_std", 30.0)
    energy_mean= features.get("energy_mean", 0.05)
    zcr_mean   = features.get("zcr_mean", 0.05)
    voiced_ratio = features.get("voiced_ratio", 0.6)
    pitch_mean = features.get("pitch_mean", 150.0)
    spectral_centroid = features.get("spectral_centroid", 2000.0)

    pitch_stress  = _norm(pitch_std,    0, 80)
    zcr_stress    = _norm(zcr_mean,     0, 0.15)
    energy_stress = _norm(energy_mean,  0, 0.25)
    stress_score  = float(np.clip(0.40*pitch_stress + 0.35*zcr_stress + 0.25*energy_stress, 0, 100))

    energy_level = _norm(energy_mean, 0, 0.20)

    pitch_stability = 100 - _norm(pitch_std, 0, 80)
    voice_presence  = _norm(voiced_ratio, 0.3, 0.9)
    speech_energy   = _norm(energy_mean, 0.02, 0.15)
    confidence_score = float(np.clip(0.40*pitch_stability + 0.35*voice_presence + 0.25*speech_energy, 0, 100))

    emotion, emotion_intensity = _classify_emotion(stress_score, energy_level, confidence_score, pitch_mean, pitch_std, spectral_centroid, transcript)
    recommendation, tips = _generate_recommendation(emotion, stress_score, energy_level, confidence_score)

    return {
        "stress_score": round(float(stress_score), 1),
        "energy_level": round(float(energy_level), 1),
        "confidence_score": round(float(confidence_score), 1),
        "emotion": emotion,
        "emotion_intensity": round(float(emotion_intensity), 2),
        "recommendation": recommendation,
        "recommendation_tips": tips,
    }

def _classify_emotion(stress, energy, confidence, pitch_mean, pitch_std, centroid, transcript):
    txt = transcript.lower()
    negative_kw = ["tired","exhausted","can't","hate","terrible","stressed","overwhelmed"]
    positive_kw = ["great","happy","good","love","excited","amazing","wonderful"]
    if any(k in txt for k in negative_kw):
        return ("sad", 0.70) if energy < 35 else ("stressed", 0.75)
    if any(k in txt for k in positive_kw):
        return ("happy", 0.70)
    if stress > 65 and energy > 55: return ("anxious", min(1.0, stress/100))
    if stress > 55: return ("stressed", min(1.0, stress/100))
    if energy > 65 and confidence > 60: return ("happy", min(1.0, energy/100))
    if energy < 30 and confidence < 40: return ("sad", min(1.0, (100-energy)/100))
    if confidence > 65 and stress < 35: return ("calm", min(1.0, confidence/100))
    return ("neutral", round(abs(stress-50)/50, 2))

def _generate_recommendation(emotion, stress, energy, confidence):
    if stress > 70:
        return ("Your voice patterns suggest elevated stress. Time to decompress.",
                ["Box breathing: 4s in, 4s hold, 4s out, 4s hold. Repeat 4 times.",
                 "Step outside for 5-10 minutes.", "Avoid caffeine for the next 2 hours."])
    if stress > 45:
        return ("Mild stress detected. A few small breaks could help.",
                ["4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.",
                 "Stretch your neck and shoulders for 2 minutes."])
    if energy < 30:
        return ("Low energy detected. Your voice sounds fatigued.",
                ["Consider a 20-minute power nap.", "Have a light, protein-rich snack.",
                 "Splash cold water on your face to refresh alertness."])
    if emotion in ("happy",) or (stress < 30 and energy > 50):
        return ("You sound great! Your wellness indicators are in a good zone.",
                ["Keep this energy — schedule important work now.", "Share positive energy with your team."])
    return ("Your voice patterns look balanced. Maintain your current routine.",
            ["Take regular short breaks every 90 minutes.", "Stay hydrated throughout the day."])
