# WellVision AI — README.md

```markdown
# 🧠 WellVision AI

A real-time **AI-powered wellness monitoring app** that uses your webcam and microphone to analyse posture, eye fatigue, drowsiness, and vocal stress — then delivers personalised wellness recommendations.

🔗 **Live Demo:** [https://wellvision-ai.vercel.app](https://wellvision-ai.vercel.app)

---

## 👋 About the Project

**WellVision AI** is a full-stack wellness platform built to help users stay aware of their physical and mental state during long work or study sessions. Using computer vision and audio ML pipelines, it continuously monitors your posture, eye strain, drowsiness level, and emotional tone — all in real time, right from the browser.

---

## ✨ Features

- 📷 **Posture Analysis** — Detects slouching and misalignment via webcam
- 👁️ **Eye Fatigue Detection** — Monitors blink rate and gaze patterns
- 😴 **Drowsiness Monitoring** — Real-time alertness scoring
- 🎙️ **Vocal Stress & Emotion Analysis** — Speech-to-text + audio feature extraction
- 🔐 **Firebase Auth** — Secure Google sign-in
- 📊 **Personalised Recommendations** — AI-driven wellness nudges based on your session data
- 🗃️ **Session History** — All results stored and queryable via Firestore
- 📱 Fully responsive — desktop, tablet, and mobile

---

## 🛠️ Tech Stack
###
### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| Firebase Auth | Google sign-in & session management |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API server |
| Firebase Admin SDK | Server-side auth & Firestore access |
| Firestore | NoSQL database for session data |

### AI / ML
| Technology | Purpose |
|---|---|
| OpenAI Whisper | Speech-to-text transcription |
| librosa | Audio feature extraction |
| Custom ML modules | Emotion, posture & fatigue analysis |

### Services
| Service | Purpose |
|---|---|
| Firebase | Auth, Firestore DB, hosting config |
| Vercel | Frontend hosting & CI/CD |
| GitHub | Version control & source |
###
---

## 📂 Project Structure

###
wellvision-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routes/
│   │   ├── posture.py           # Posture analysis endpoints
│   │   ├── fatigue.py           # Eye fatigue endpoints
│   │   ├── drowsiness.py        # Drowsiness detection endpoints
│   │   └── voice.py             # Voice stress & emotion endpoints
│   ├── services/
│   │   ├── posture_service.py   # CV posture analysis logic
│   │   ├── fatigue_service.py   # Blink & gaze analysis logic
│   │   ├── drowsiness_service.py# Alertness scoring logic
│   │   └── voice_service.py     # Whisper + librosa pipeline
│   ├── firebase_admin.py        # Firebase Admin SDK init
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Backend environment variables
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/              # Icons, images, logos
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Fixed top navigation
│   │   │   ├── Dashboard.jsx    # Main monitoring dashboard
│   │   │   ├── PostureCard.jsx  # Posture analysis UI card
│   │   │   ├── FatigueCard.jsx  # Eye fatigue UI card
│   │   │   ├── DrowsinessCard.jsx # Drowsiness UI card
│   │   │   ├── VoiceCard.jsx    # Vocal stress UI card
│   │   │   ├── Recommendations.jsx # AI wellness suggestions
│   │   │   ├── History.jsx      # Session history view
│   │   │   └── Login.jsx        # Google sign-in screen
│   │   ├── firebase/
│   │   │   └── config.js        # Firebase web SDK init
│   │   ├── hooks/
│   │   │   ├── useCamera.js     # Webcam access hook
│   │   │   └── useMicrophone.js # Mic access hook
│   │   ├── utils/
│   │   │   └── api.js           # Axios API helpers
│   │   ├── App.jsx              # Root component & routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── .env                     # Frontend environment variables
│   ├── tailwind.config.js       # Tailwind theme configuration
│   ├── vite.config.js           # Vite build configuration
│   └── package.json
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore composite indexes
├── firebase.json                # Firebase CLI config
└── README.md
###
---

## ⚙️ Prerequisites

Install these before doing anything else:

1. **Python 3.10 or 3.11** — 3.10 confirmed working; avoid 3.12+ until all dependencies are verified
2. **Node.js 18+** and npm
3. **Git**
4. **ffmpeg** — required by Whisper to decode audio; the app will fail with `WinError 2` / `FileNotFoundError` on voice analysis if this is missing
5. **Firebase CLI** — required to deploy Firestore indexes and rules
6. **A Firebase project** with Firestore and Authentication (Google sign-in) enabled

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/wellvision-ai.git
cd wellvision-ai
```

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Place your Firebase **service account JSON** (downloaded from Firebase Console → Project Settings → Service Accounts) in `backend/` and name it `serviceAccountKey.json`.

Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```
API available at 👉 [http://localhost:8000](http://localhost:8000)  
Swagger docs at 👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:8000
```

> Get these values from Firebase Console → Project Settings → Your Apps → Web App config.

Start the frontend dev server:
```bash
npm run dev
```
Open 👉 [http://localhost:5173](http://localhost:5173)

---

### 4️⃣ Firebase CLI Setup

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your Firebase project
firebase deploy --only firestore
```

This deploys `firestore.rules` and `firestore.indexes.json` to your project.

---

## 🏗️ Build for Production

### Frontend
```bash
cd frontend
npm run build
```
Generates an optimised `dist/` folder ready for deployment.

### Backend
Deploy to any Python-compatible host (Railway, Render, Cloud Run, etc.) using the same environment variables.

---

## 🚀 Deployment

### Frontend — Vercel
- Connect your GitHub repo to [Vercel](https://vercel.com)
- Set root directory to `frontend/`
- Add all `VITE_*` environment variables in the Vercel dashboard
- Every push to `main` triggers a new deployment automatically

### Backend — Render / Railway
- Set root directory to `backend/`
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Add the `FIREBASE_SERVICE_ACCOUNT_PATH` env variable (or paste the JSON contents directly as `FIREBASE_SERVICE_ACCOUNT_JSON`)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <strong>Lovaraju Dungala</strong></p>
```
