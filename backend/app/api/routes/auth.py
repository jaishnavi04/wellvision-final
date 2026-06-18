from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.core.firebase_admin import get_firestore_client
from app.schemas.auth_schema import TokenVerifyResponse, UserProfile, UserUpdateRequest
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/verify", response_model=TokenVerifyResponse)
def verify_token(current_user: dict = Depends(get_current_user)):
    return TokenVerifyResponse(valid=True, uid=current_user["uid"], email=current_user.get("email"))

@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    doc = get_firestore_client().collection("users").document(uid).get()
    if not doc.exists:
        return UserProfile(uid=uid, email=current_user.get("email"), display_name=current_user.get("name"), photo_url=current_user.get("picture"))
    data = doc.to_dict()
    return UserProfile(uid=uid, email=data.get("email"), display_name=data.get("displayName"), photo_url=data.get("photoURL"))

@router.patch("/me", response_model=UserProfile)
def update_my_profile(payload: UserUpdateRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    ref = get_firestore_client().collection("users").document(uid)
    updates: dict = {"lastActive": SERVER_TIMESTAMP}
    if payload.display_name is not None: updates["displayName"] = payload.display_name
    if payload.settings     is not None: updates["settings"]    = payload.settings
    ref.set(updates, merge=True)
    data = ref.get().to_dict() or {}
    return UserProfile(uid=uid, email=data.get("email"), display_name=data.get("displayName"), photo_url=data.get("photoURL"))
