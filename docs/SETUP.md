# WellVision AI — Complete Setup Guide

## Prerequisites
- Node.js 20+
- Python 3.11+
- Firebase account (free tier)
- ffmpeg (for Whisper audio processing)

## Step 1 — Firebase Setup
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method:
   - Email/Password ✓
   - Google ✓
4. Create **Firestore Database** (native mode, any region)
5. Paste `firebase/firestore.rules` content into Firestore → Rules
6. Paste `firebase/firestore.indexes.json` into Firestore → Indexes
7. Go to Project Settings → General → Your apps → Add web app
8. Copy the config values into `frontend/.env`
9. Go to Project Settings → Service Accounts → Generate new private key
10. Save the downloaded JSON as `backend/firebase-service-account.json`

## Step 2 — Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env and fill in all VITE_FIREBASE_* values
npm install
npm run dev
# App runs at http://localhost:5173
```

## Step 3 — Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install system dependency (required by Whisper)
# Ubuntu: sudo apt install ffmpeg -y
# macOS:  brew install ffmpeg
# Windows: download from https://ffmpeg.org and add to PATH

pip install -r requirements.txt
cp .env.example .env
# Edit .env: set FIREBASE_PROJECT_ID and FIREBASE_CREDENTIALS_PATH

uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

## Step 4 — Docker (optional)
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example  backend/.env
# Fill both .env files, then:
docker-compose up --build
```

## Step 5 — Verify everything works
1. Open http://localhost:5173
2. Register a new account
3. Log in → you should see the Dashboard
4. Go to Voice Session → allow microphone → record → analyse
5. Go to Vision Session → allow camera → start session
6. Go to Reports → click Generate
7. Check http://localhost:8000/docs for all API endpoints

## Environment Variables

### frontend/.env
| Variable | Description |
|---|---|
| VITE_FIREBASE_API_KEY | Firebase web API key |
| VITE_FIREBASE_AUTH_DOMAIN | yourproject.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | Your Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | yourproject.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | From Firebase console |
| VITE_FIREBASE_APP_ID | From Firebase console |
| VITE_API_BASE_URL | http://localhost:8000 |

### backend/.env
| Variable | Description |
|---|---|
| FIREBASE_CREDENTIALS_PATH | Path to service account JSON |
| FIREBASE_PROJECT_ID | Your Firebase project ID |
| SECRET_KEY | Random 32-char hex string |
| CORS_ORIGINS | http://localhost:5173 |
| ENVIRONMENT | development or production |

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET  | /health | Health check |
| GET  | /api/v1/auth/verify | Verify Firebase token |
| GET  | /api/v1/auth/me | Get user profile |
| PATCH| /api/v1/auth/me | Update profile |
| POST | /api/v1/voice/analyze | Analyse audio file |
| WS   | /api/v1/vision/ws/vision | Vision WebSocket stream |
| POST | /api/v1/recommendations/ | Get AI recommendations |
| POST | /api/v1/reports/generate | Generate wellness report |
| GET  | /api/v1/reports/latest | Get latest report |
