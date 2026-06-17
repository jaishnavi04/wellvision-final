import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore
from app.core.config import get_settings
import logging
import os

logger = logging.getLogger(__name__)
_db = None

def init_firebase() -> None:
    if firebase_admin._apps:
        return

    settings = get_settings()

    if not os.path.exists(settings.firebase_credentials_path):
        logger.warning(
            f"Firebase credentials not found: {settings.firebase_credentials_path}. Firebase disabled."
        )
        return

    try:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        firebase_admin.initialize_app(
            cred,
            {"projectId": settings.firebase_project_id}
        )
        logger.info("Firebase Admin SDK initialised.")
    except Exception as exc:
        logger.error(f"Firebase init failed: {exc}")

def get_firestore_client():
    global _db
    if not firebase_admin._apps:
        return None

    if _db is None:
        _db = firestore.client()

    return _db

def verify_firebase_token(id_token: str) -> dict:
    return firebase_auth.verify_id_token(id_token)