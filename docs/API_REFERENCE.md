# WellVision AI — API Reference

## Authentication
All protected endpoints require:
```
Authorization: Bearer <firebase_id_token>
```
Get the token: `await firebase.auth().currentUser.getIdToken()`

## Voice Analysis
### POST /api/v1/voice/analyze
Upload audio file for analysis.

**Request:** `multipart/form-data`
- `audio` (File): .webm / .wav / .mp3 / .mp4 / .ogg — max 25MB

**Response:**
```json
{
  "transcript": "I've been feeling overwhelmed today...",
  "language": "en",
  "stress_score": 72.4,
  "energy_level": 38.1,
  "confidence_score": 44.7,
  "emotion": "stressed",
  "emotion_intensity": 0.72,
  "recommendation": "Your voice patterns suggest elevated stress.",
  "recommendation_tips": ["Box breathing...", "Step outside..."],
  "features": {
    "mfcc_mean": -12.34,
    "pitch_mean": 187.3,
    "energy_mean": 0.082,
    "tempo": 94.5
  }
}
```

## Vision Analysis (WebSocket)
### WS /api/v1/vision/ws/vision

**Protocol:**
```
Client → { "type": "auth",  "token": "<firebase_id_token>" }
Server → { "type": "auth_ok" }
Client → { "type": "frame", "data": "<base64_jpeg>", "frameNum": 1 }
Server → { face_detected, eye: {...}, posture: {...}, drowsiness: {...} }
Client → { "type": "stop" }
Server → { "type": "summary", duration_seconds, avg_posture_score, ... }
```

## Recommendations
### POST /api/v1/recommendations/
```json
{
  "stress_score": 72,
  "energy_level": 35,
  "posture_score": 55,
  "fatigue_score": 40,
  "drowsiness_score": 15,
  "confidence_score": 60
}
```

## Reports
### POST /api/v1/reports/generate
```json
{ "period": "weekly" }
```
Returns aggregated wellness report with insights.
