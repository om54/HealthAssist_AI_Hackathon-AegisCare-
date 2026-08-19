# SIH Healthcare Platform

A full-stack healthcare platform with AI-powered triage, doctor-patient management, and appointment booking. Built for Smart India Hackathon (SIH).

## Architecture

```
SIH_Selfmade/
├── frontend/        # Next.js 16 + TypeScript + Tailwind CSS
├── backend/
│   ├── nodejs/      # Express.js REST API (auth, users, doctors, admin)
│   └── python/      # FastAPI AI microservice (Google Gemini)
```

## Features

- **AI Health Triage** — Symptom analysis, specialist recommendation, and urgency scoring via Google Gemini
- **User Portal** — Signup/login, family member management, problem reporting, appointment booking
- **Doctor Portal** — View assigned patient problems, submit verified solutions
- **Admin Panel** — Manage doctors, retrain AI model with verified clinical data
- **Nearby Doctors** — Find doctors by city or PIN code

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Node Backend | Express.js 5, MongoDB (Mongoose), JWT, bcrypt, Zod |
| Python Backend | FastAPI, Google Gemini (`google-genai`), Motor (async MongoDB) |
| Database | MongoDB |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB instance
- Google Gemini API key

---

### 1. Node.js Backend

```bash
cd backend/nodejs
npm install
```

Create `.env` from `.env.example`:
```env
MONGOOSE_URL=<your_mongodb_connection_string>
JWT_USER_SECRET=<your_jwt_user_secret>
JWT_ADMIN_SECRET=<your_jwt_admin_secret>
JWT_DOCTOR_SECRET=<your_jwt_doctor_secret>
```

```bash
npm run dev   # development (nodemon)
# or
npm run run   # production
```

Runs on `http://localhost:5000`

---

### 2. Python AI Backend

```bash
cd backend/python
pip install -r requirements.txt
```

Create `.env` from `.env.example`:
```env
GEMINI_API_KEY=<your_gemini_api_key>
GEMINI_MODEL=gemini-2.5-flash
MONGOOSE_URL=<your_mongodb_connection_string>
PORT=8000
```

```bash
python main.py
```

Runs on `http://localhost:8000`

---

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_NODE_API_URL=http://localhost:5000
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Runs on `http://localhost:3000`

---

## API Overview

### Node.js API (`/api/v1`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/signup` | — | Register a new patient |
| POST | `/users/login` | — | Login and receive JWT |
| POST | `/users/logout` | User | Logout (revoke token) |
| POST | `/users/add-family-member` | User | Add a family member |
| GET | `/users/all-family-members` | User | List family members |
| POST | `/users/new-problem` | User | Report a health problem |
| POST | `/users/ai-analyze-health` | User | AI triage + auto-save to DB |
| GET | `/users/all-problems` | User | Get problems + doctor solutions |
| GET | `/users/doctors-near-me` | User | Find nearby doctors |
| POST | `/users/new-appointment/:doctorId/:problemId` | User | Book appointment |
| PUT | `/users/appointment/:doctorId/:appointmentId` | User | Confirm appointment done |
| POST | `/users/update-password` | — | Update password |
| POST | `/users/forgot-password` | — | Reset forgotten password |
| POST | `/doctor-admin/...` | Doctor | Doctor routes |
| POST | `/admin/...` | Admin | Admin routes |

### Python AI API (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/api/v1/specialists` | List supported specialist types |
| GET | `/api/v1/ai/status` | AI model status and config |
| POST | `/api/v1/ai/analyze-problem` | Analyze symptoms with Gemini AI |
| POST | `/api/v1/ai/admin-train` | Admin: retrain AI with new examples |

## AI Triage Flow

1. User submits symptoms via frontend
2. Node.js backend validates and forwards to Python AI service
3. Gemini AI returns: possible conditions, recommended specialist, triage urgency, and health advice
4. Result is saved to MongoDB with `status: "pending_doctor_review"`
5. Doctor reviews and submits a verified solution
6. Admin can use verified solutions to retrain the AI model
