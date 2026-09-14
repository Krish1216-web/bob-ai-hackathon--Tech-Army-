# 🛠️ Setup & Execution Guide — ChainGuard AI

## Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

---

## Environment Variables
Copy `.env.example` in both root and backend:
```bash
cp .env.example .env
cp src/backend/.env.example src/backend/.env
```

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres` |
| `SUPABASE_URL` | Supabase project API URL | `https://[ref].supabase.co` |
| `SUPABASE_ANON_KEY` | Public anonymous key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Administrative service key | `eyJhbGciOi...` |

---

## Installation & Running

### 1. Backend Setup
```bash
cd src/backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd src/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## Running Automated Test Suite
```bash
cd src/backend
pytest -v
```

## Running Frontend Typecheck & Build
```bash
cd src/frontend
npm run build
```
