# 13 CLUB - Wingo Gaming Platform

Authentic full-stack Wingo lottery gaming web application with live synchronized countdown rounds, 30s / 1m / 3m / 5m game periods, dynamic UPI QR deposit system with UTR verification, withdrawal approval workflow, and an Admin Portal.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended, e.g., Node 20 LTS)
- **npm** (v9+ or v10+)

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <REPO_FOLDER_NAME>
npm install
```

### 3. Running in Development
Start the full-stack development server (Express backend + Vite client):

```bash
npm run dev
```

The application will be live at:
👉 **`http://localhost:3000`**

### 4. Production Build & Deployment
To create a production build and run the production server:

```bash
# 1. Build the Vite frontend into dist/
npm run build

# 2. Start the production server
npm start
```

---

## 🔑 Default Credentials

### Admin Dashboard (Staff Portal)
- **Access Route**: In Customer Support section or via direct URL `#admin`
- **Admin ID**: `cat`
- **Password**: `1111`

### 1000 Period Sequence Sheet
- **Access Route**: Click **"1000 Sheet"** inside Wingo Game
- **Access Password**: `112233`

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, tsx
- **Build Tool**: Vite 8
- **Audio Synthesis**: Native Web Audio API Sound Synthesizer (Zero external audio asset lag)
- **Persistence**: File-based transactional JSON store in `data/wingo_store.json` (auto-creates if missing)

---

## 📦 Scripts
- `npm run dev` - Starts server with Vite middleware in development mode
- `npm run build` - Builds production bundle into `dist/`
- `npm start` - Runs the full-stack production server
- `npm run lint` - Runs TypeScript type checking (`tsc --noEmit`)
