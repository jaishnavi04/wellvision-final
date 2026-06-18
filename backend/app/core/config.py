from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache

class Settings(BaseSettings):
    firebase_credentials_path: str = "./firebase-service-account.json"
    firebase_project_id: str = "wellvision-ai-lova"
    secret_key: str = "change_me"
    algorithm: str = "HS256"
    cors_origins: list[str] = ["http://localhost:5173"]
    environment: str = "development"
    app_name: str = "WellVision AI"
    api_prefix: str = "/api/v1"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()