from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class TokenVerifyResponse(BaseModel):
    valid: bool
    uid: str
    email: Optional[str] = None
    message: str = "Token is valid"

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    settings: Optional[dict] = None
