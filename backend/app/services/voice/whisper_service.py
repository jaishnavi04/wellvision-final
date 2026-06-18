import os
FFMPEG_DIR = r"C:\Users\lagud\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ["PATH"]
import whisper
import tempfile, os, logging
from pathlib import Path

logger = logging.getLogger(__name__)
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading Whisper base model...")
        _model = whisper.load_model("base")
        logger.info("Whisper loaded.")
    return _model

def transcribe_audio(audio_bytes: bytes, original_filename: str = "audio.webm") -> dict:
    suffix = Path(original_filename).suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        result = get_model().transcribe(tmp_path, fp16=False)
        return {"text": result.get("text","").strip(), "language": result.get("language","en"), "segments": result.get("segments",[])}
    except Exception as exc:
        logger.error(f"Whisper error: {exc}")
        raise
    finally:
        os.unlink(tmp_path)
