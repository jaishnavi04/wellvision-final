```markdown
# WellVision AI

WellVision AI is a wellness monitoring app that uses your webcam and microphone to analyse posture, eye fatigue, drowsiness, and vocal stress/emotion in real time, then gives personalised recommendations.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Firebase Auth
- **Backend:** FastAPI (Python), Firebase Admin SDK, Firestore
- **AI/ML:** OpenAI Whisper (speech-to-text), librosa (audio feature extraction), custom emotion/posture/fatigue analysis
- **Database:** Firestore (Firebase)

---

## Prerequisites

Install these before doing anything else:

1. **Python 3.10 or 3.11** (3.10 confirmed working; avoid 3.12+ until dependencies are verified)
2. **Node.js 18+** and npm
3. **Git**
4. **ffmpeg** — required by Whisper to decode audio. The app will fail with `WinError 2` / `FileNotFoundError` on voice analysis if this is missing.
5. **Firebase CLI** — required to deploy Firestore indexes/rules. See setup below.
6. **A Firebase project** with Firestore and Authentication (Google sign-in) enabled. You'll need:
   - A Firebase **service account JSON** (for the backend)
   - Firebase **web config** (for the frontend `.env`)

---

## Project Structure

```
wellvision-final/
├── backend/          FastAPI backend
│   ├── app/
│   ├── .env          (you create this)
│   ├── firebase-service-account.json   (you add this)
│   └── requirements.txt
├── frontend/         React + Vite frontend
│   ├── src/
│   ├── .env           (you create this)
│   └── package.json
└── firebase/          Firestore rules & indexes (firebase.json lives here, at project root)
```

**Important:** `firebase.json` and `firestore.indexes.json` live in the top-level `firebase/` folder, not inside `backend/`. All `firebase` CLI commands below must be run from inside that `firebase/` folder, or they will fail with `Error: firebase use must be run from a Firebase project directory.`

---

## ffmpeg Installation

**Windows:**
```powershell
winget install ffmpeg
```

After installing, ffmpeg is often not immediately recognised because PATH changes don't apply to already-open terminals. Do this:

1. Close **every** open terminal/PowerShell window completely (and your IDE's integrated terminal, e.g. VS Code, if open).
2. Open a brand new terminal and check:
```powershell
ffmpeg -version
```
3. If it still says `'ffmpeg' is not recognized`, check whether it's actually in your User PATH:
```powershell
[Environment]::GetEnvironmentVariable("Path", "User") -split ";" | Select-String "ffmpeg"
```
If that returns a path, but `ffmpeg -version` still fails in every new window (this can happen with conda-initialized PowerShell prompts overriding PATH), the most reliable fix is to bypass PATH entirely. Find ffmpeg.exe's exact folder:
```powershell
Get-ChildItem -Path "C:\Users\<you>\AppData\Local\Microsoft\WinGet\Packages" -Recurse -Filter "ffmpeg.exe"
```
Then add these two lines to the very top of `backend/app/services/voice/whisper_service.py`, **before** `import whisper`:
```python
import os
FFMPEG_DIR = r"C:\Users\<you>\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-X.X.X-full_build\bin"
os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ["PATH"]
```
(Replace the path with whatever the `Get-ChildItem` command above actually printed for your machine — the version number folder will differ.) This guarantees Whisper's subprocess calls can find ffmpeg regardless of shell/IDE PATH state.

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

Verify on any platform with `ffmpeg -version` in a fresh terminal before moving on.

---

## Backend Setup

```bash
cd backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 1. Add your Firebase service account

Place your Firebase service account JSON file in `backend/` and name it `firebase-service-account.json` (or update the path in `.env` if you name it differently).

### 2. Create `backend/.env`

```env
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
FIREBASE_PROJECT_ID=your-firebase-project-id
SECRET_KEY=replace_with_a_long_random_string
ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:3000"]
ENVIRONMENT=development
APP_NAME=WellVision AI
API_PREFIX=/api/v1
```

**Important — CORS_ORIGINS format:** this must be a valid JSON array of strings, exactly as shown (square brackets, double quotes). The config has a validator that also accepts a plain comma-separated string (e.g. `http://localhost:5173,http://localhost:5174`), but the JSON-array format is the one already used in this project, so stick with it unless you've checked `app/core/config.py` yourself.

**Important — include every port your frontend might run on.** Vite defaults to port `5173`, but if that port is already in use it silently falls back to `5174`, `5175`, etc. If your frontend's actual origin isn't in `CORS_ORIGINS`, every API call will fail with a CORS preflight error (`400 Bad Request` on the `OPTIONS` request, followed by "No 'Access-Control-Allow-Origin' header"). Check your `npm run dev` terminal output for the actual `Local:` URL it's running on, and make sure that exact origin is included here.

**After changing `.env`, you must fully restart the backend** — not just let `--reload` pick it up. `uvicorn --reload` watches Python source file changes, but `.env` is only read once at startup, and the settings object is cached (`@lru_cache()`), so editing `.env` while the server is running has no effect until you stop (Ctrl+C) and start it again.

### 3. Pre-download the Whisper model (do this once, before first run)

The voice analysis feature uses OpenAI Whisper, which downloads its model (~139MB for the `base` model) the first time it's used. Doing this ahead of time avoids a request timing out in the browser while the model downloads in the background.

```bash
python -c "import whisper; whisper.load_model('base')"
```

Wait for this to complete fully in the terminal before moving on. If you're on a slow or unstable connection and it fails with a checksum error (`RuntimeError: ... SHA256 checksum does not match`), the downloaded file is corrupted/incomplete — delete it and retry:

- **Windows cache location:** `C:\Users\<you>\.cache\whisper\base.pt`
- **Mac/Linux cache location:** `~/.cache/whisper/base.pt`

```powershell
Remove-Item C:\Users\<you>\.cache\whisper\base.pt
python -c "import whisper; whisper.load_model('base')"
```

If retries keep failing due to a poor connection, you can use the much smaller `tiny` model instead (~75MB) by changing the model name in `app/services/voice/whisper_service.py`, or try downloading `base.pt` manually through your browser (which resumes better on flaky connections) and placing it directly into the cache folder above.

### 4. Run the backend

```bash
uvicorn app.main:app --reload --port 8000
```

You should see `Uvicorn running on http://127.0.0.1:8000` with no errors. Leave this terminal running.

---

## Frontend Setup

Open a **new terminal** (keep the backend running in the other one):

```bash
cd frontend
npm install
```

### Create `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console → Project Settings → General → Your apps → Web app config.

### Run the frontend

```bash
npm run dev
```

This starts the Vite dev server. Check the terminal output for the actual URL (usually `http://localhost:5173`, but may fall back to `5174` or higher if that port is busy). **Note this exact port** — you'll need it to match `CORS_ORIGINS` in the backend `.env` above.

---

## Firebase / Firestore Setup

### 1. Enable required Firebase services (one-time, in Firebase Console)

1. Enable **Firestore Database** (Cloud Firestore), in production or test mode.
2. Enable **Authentication → Sign-in method → Google**.

### 2. Install the Firebase CLI

This is a separate global tool from the `firebase` npm package used inside the frontend code — it's needed to deploy Firestore indexes and rules from your machine.

```bash
npm install -g firebase-tools
```

After installing, close and reopen your terminal completely (same PATH-refresh requirement as ffmpeg), then verify:

```bash
firebase --version
```

### 3. Log in and link the project

```bash
firebase login
```

This opens a browser window — sign in with the Google account that has access to the Firebase project.

Navigate into the `firebase/` folder at the project root (this is where `firebase.json` actually lives — not inside `backend/`):

```bash
cd path/to/wellvision-final/firebase
firebase use --add
```

This prompts you to pick a project from a list (select your project, e.g. `wellvision-ai-lova`) and choose an alias — `default` is the conventional choice, just type it and press Enter.

### 4. Deploy Firestore indexes

Still inside the `firebase/` folder:

```bash
firebase deploy --only firestore:indexes
```

A successful run ends with `Deploy complete!`. This pushes the composite indexes already defined in `firestore.indexes.json` (covering the `sessions` and `reports` collections, filtered by `userId` and ordered by date) to your live Firebase project.

### 5. Wait for indexes to finish building

Deploying registers the index, but it still needs time to actually build — typically 1–5 minutes, more for larger collections. Check status at:

```
https://console.firebase.google.com/project/<your-project-id>/firestore/indexes
```

Each index will show **Building**, then flip to **Enabled**. Until it's Enabled, your app's session history / dashboard / reports queries will fail in the browser console with errors like:

```
FirebaseError: [code=failed-precondition]: The query requires an index.
```
or, once it's mid-build:
```
FirebaseError: [code=failed-precondition]: The query requires an index. That index is currently building and cannot be used yet.
```

Both are expected and temporary — just wait, then hard-refresh the frontend (Ctrl+Shift+R) once status shows Enabled. This is not a code bug; no code changes are needed, just patience.

**Alternative (if you don't want to install the CLI):** click the link included directly in the browser console error message — it opens the Firebase console with the exact required index pre-filled, and you can click "Create Index" there instead of using the CLI. Functionally equivalent, just not version-controlled in your repo.

---

## Running the Full App

You need both servers running simultaneously, in two separate terminals:

```bash
# Terminal 1
cd backend
venv\Scripts\activate   # or source venv/bin/activate on Mac/Linux
uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend
npm run dev
```

Then open the frontend URL shown in Terminal 2 (check for the actual port), sign in with Google, and grant camera/microphone permissions when prompted.

---

## Troubleshooting

**Backend won't start, `SettingsError` mentioning `cors_origins`:** Check the `.env` format — see Backend Setup step 2 above. It must be valid JSON (`["...","..."]`) or a comma-separated string, matching whatever `app/core/config.py` expects.

**Frontend shows `ERR_CONNECTION_REFUSED` calling `localhost:8000`:** The backend isn't running or crashed on startup. Check the backend terminal for errors.

**Browser console shows a CORS error and the backend logs `OPTIONS ... 400 Bad Request`:** Your frontend's actual origin/port isn't in the backend's `CORS_ORIGINS` list. Check the exact `Local:` URL printed by `npm run dev`, add it to `backend/.env`, and fully restart uvicorn (stop and re-run — `--reload` does not re-read `.env`).

**Voice analysis returns 415 Unsupported Media Type:** Should not occur with this codebase as-is; the route normalises the browser's MIME type (e.g. strips `;codecs=opus`) before checking it.

**Voice analysis returns 500 with `WinError 2` / `FileNotFoundError`:** ffmpeg isn't installed or isn't on PATH. See the ffmpeg Installation section above, including the Python-side workaround if PATH changes aren't being picked up.

**Voice analysis times out (`timeout of 120000ms exceeded`) on first try:** The Whisper model is downloading in the background for the first time. Pre-download it as described in Backend Setup step 3, or just wait and retry — it'll be instant after the first successful load.

**Webcam feed shows a black box, all stats read 0:** Make sure you're running the latest version of `useWebcam.js` from this repo — earlier versions had a timing bug where the camera stream wasn't attached to the video element correctly. Also confirm the browser actually granted camera permission (check the address bar for a blocked-camera icon).

**Firestore console errors about a missing or building index, dashboard/reports pages show blank/skeleton loaders:** Deploy the indexes as described in the Firebase/Firestore Setup section, then wait for status to show **Enabled** in the Firebase console before expecting data to load. This is expected the first time these queries run.

**`firebase` command not recognized:** The Firebase CLI isn't installed — run `npm install -g firebase-tools`, then close and reopen your terminal.

**`firebase use` says "must be run from a Firebase project directory":** You're not in the right folder. `firebase.json` lives in the top-level `firebase/` folder (not `backend/`) — `cd` into it before running any `firebase` commands.

---

## Notes for Whoever Is Setting This Up

- First-time setup will take longer than usual mainly because of the Whisper model download (~139MB), the ffmpeg install, and the Firebase CLI setup/index build — budget 20–30 minutes if your connection is slow.
- Both `.env` files (`backend/.env` and `frontend/.env`) and `firebase-service-account.json` are **not included in this repo** for security reasons — you must create/obtain these yourself as described above.
- Double-check which port Vite actually runs on (`5173` vs a fallback like `5174`) and make sure `CORS_ORIGINS` in `backend/.env` matches it exactly — this is the single most common setup snag.
- If anything in this README doesn't match what you see, check `backend/app/core/config.py` and `frontend/src/services/firebase.js` directly to confirm exact expected environment variable names.
```