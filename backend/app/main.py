from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.firebase_admin import init_firebase
from app.api.routes import auth, voice, vision, recommendations, reports
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(name)s - %(message)s")
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    yield

app = FastAPI(title=settings.app_name, description="WellVision AI - Real-Time Wellness Monitoring API", version="1.0.0", docs_url="/docs", redoc_url="/redoc", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

API = settings.api_prefix
app.include_router(auth.router,            prefix=API)
app.include_router(voice.router,           prefix=API)
app.include_router(vision.router,          prefix=API)
app.include_router(recommendations.router, prefix=API)
app.include_router(reports.router,         prefix=API)

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": settings.app_name, "version": "1.0.0"}
