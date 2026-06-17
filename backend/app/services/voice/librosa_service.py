import librosa, numpy as np, tempfile, os, logging
from pathlib import Path

logger = logging.getLogger(__name__)

def extract_features(audio_bytes: bytes, original_filename: str = "audio.webm") -> dict:
    suffix = Path(original_filename).suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes); tmp_path = tmp.name
    try:
        y, sr = librosa.load(tmp_path, sr=None, mono=True)
        if len(y) == 0:
            raise ValueError("Empty audio")
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        f0, voiced_flag, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        f0_voiced = f0[voiced_flag] if voiced_flag is not None else np.array([0.0])
        rms = librosa.feature.rms(y=y)
        zcr = librosa.feature.zero_crossing_rate(y)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        voiced_ratio = float(np.sum(voiced_flag)/len(voiced_flag)) if voiced_flag is not None and len(voiced_flag)>0 else 0.5
        return {
            "mfcc_mean": float(np.mean(mfcc)), "mfcc_std": float(np.std(mfcc)),
            "pitch_mean": float(np.mean(f0_voiced)) if len(f0_voiced)>0 else 0.0,
            "pitch_std":  float(np.std(f0_voiced))  if len(f0_voiced)>0 else 0.0,
            "energy_mean": float(np.mean(rms)), "energy_max": float(np.max(rms)),
            "zcr_mean": float(np.mean(zcr)),
            "tempo": float(tempo) if not isinstance(tempo, np.ndarray) else float(tempo[0]),
            "spectral_centroid": float(np.mean(spec_centroid)),
            "voiced_ratio": voiced_ratio,
            "duration": float(librosa.get_duration(y=y, sr=sr)),
            "sample_rate": sr,
        }
    except Exception as exc:
        logger.error(f"Librosa error: {exc}"); raise
    finally:
        os.unlink(tmp_path)
