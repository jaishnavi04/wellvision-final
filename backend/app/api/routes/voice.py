import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.voice_schema import VoiceAnalysisResponse, AudioFeatures
from app.services.voice.whisper_service  import transcribe_audio
from app.services.voice.librosa_service  import extract_features
from app.services.voice.emotion_service  import analyse_wellness

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice Analysis"])
ALLOWED_TYPES = {"audio/webm","audio/wav","audio/mpeg","audio/mp4","audio/ogg","audio/x-wav","audio/wave"}

@router.post("/analyze", response_model=VoiceAnalysisResponse)
async def analyze_voice(audio: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content_type = (audio.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=f"Unsupported format: {audio.content_type}")
    audio_bytes = await audio.read()
    if len(audio_bytes)/1024/1024 > 25:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 25MB)")
    if len(audio_bytes) < 1000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Audio too short or empty.")
    filename = audio.filename or "recording.webm"
    logger.info(f"Voice upload: {filename} for uid={current_user['uid']}")
    try:
        transcription = transcribe_audio(audio_bytes, filename)
        features      = extract_features(audio_bytes, filename)
        wellness      = analyse_wellness(features, transcription["text"])
        return VoiceAnalysisResponse(
            transcript=transcription["text"], language=transcription["language"],
            stress_score=wellness["stress_score"], energy_level=wellness["energy_level"],
            confidence_score=wellness["confidence_score"], emotion=wellness["emotion"],
            emotion_intensity=wellness["emotion_intensity"],
            features=AudioFeatures(mfcc_mean=round(features["mfcc_mean"],4),mfcc_std=round(features["mfcc_std"],4),pitch_mean=round(features["pitch_mean"],2),pitch_std=round(features["pitch_std"],2),energy_mean=round(features["energy_mean"],6),zcr_mean=round(features["zcr_mean"],6),tempo=round(features["tempo"],2),spectral_centroid=round(features["spectral_centroid"],2)),
            recommendation=wellness["recommendation"], recommendation_tips=wellness["recommendation_tips"],
        )
    except Exception as exc:
        logger.error(f"Voice analysis failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Voice analysis failed. Please try again.")