# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

MedBrief — a pre-appointment health assistant. Patients describe symptoms conversationally, Groq (LLaMA) asks follow-ups, then generates a structured report with two views: a patient prep card and a doctor-facing clinical brief. A second-pass Groq API call surfaces questions the patient should raise.

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Requires `GROQ_API_KEY` in `backend/.env`. See `.env.example`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite dev server on `localhost:5173`. API proxy configured to `localhost:8000`.

### Pitch Deck
```bash
cd pitch
node build_deck.js   # Regenerates MedBrief_Pitch.pptx
```

## Architecture

```
Patient → Chat UI (React) → /api/chat (Groq LLaMA) → conversation
                           → /api/report (Groq LLaMA) → report JSON
                                ├─→ /api/analyze (Groq LLaMA) → { flags[] }
                                ├─→ normalizeReport.js → normalized shape
                                │     ├─→ <DoctorBrief />    ("For Your Doctor" tab)
                                │     └─→ <PatientPrepCard /> ("For You" tab)
                                └─→ ReportView (raw shape)   (existing symptom cards, tables)
```

- **`backend/main.py`** — FastAPI app. Groq-powered `/api/start`, `/api/chat`, `/api/report`. Includes the analyzer router.
- **`backend/routers/analyzer.py`** — `POST /api/analyze`. Second-pass Groq/LLaMA call producing question-framed flags. Never diagnostic language.
- **`frontend/src/App.jsx`** — Main React app: chat flow, report generation, ReportView with both tabs.
- **`frontend/src/normalizeReport.js`** — Transforms raw report JSON into the shape expected by companion components (field renames, severity parsing, urgency normalization).
- **`frontend/src/components/DoctorBrief.jsx`** — Clinical brief with print stylesheet. CSS scoped under `.doctor-brief`.
- **`frontend/src/components/PatientPrepCard.jsx`** — 3-section patient prep card with copy-to-clipboard. CSS scoped under `.prep-card`.
- **`pitch/build_deck.js`** — pptxgenjs script generating the 8-slide hackathon pitch deck.

## Critical Constraints

- **No diagnostic language** — The `/api/analyze` system prompt must never produce "you have X" or name conditions. All output framed as questions for the patient to ask their doctor.
- **CSS scoping** — Companion styles use component-level namespaces (`.doctor-brief__*`, `.prep-card__*`) to avoid collisions with `App.css`.
- **Props-driven components** — DoctorBrief and PatientPrepCard receive normalized report as a prop. They never fetch data internally.
- **Non-fatal analyze call** — If `/api/analyze` fails, the app still works — companion components just render without analysis flags.

## Design System

Warm cream aesthetic (Fraunces serif + DM Sans + DM Mono):
- Backgrounds: `#f5f2ee` (page), `#ffffff` (cards)
- Ink: `#18160f` (primary), `#3a3729` (secondary), `#7a7568` (tertiary), `#b8b3a8` (muted)
- Urgency: `#dc2626` (emergency), `#ea580c` (urgent), `#ca8a04` (soon), `#16a34a` (routine)
- Pitch deck uses different tokens: `#0d1f2d` dark bg, `#00b4a6` teal accent, Cambria/Calibri fonts

## Report JSON Shape (from /api/report)

```json
{
  "patient_summary": "string",
  "chief_complaint": "string",
  "symptoms": [{ "symptom": "string", "duration": "string", "severity": "string", "pattern": "string", "details": "string" }],
  "medications_and_allergies": { "current_medications": ["string"], "allergies": ["string"], "tried_for_this": ["string"] },
  "relevant_history": "string",
  "red_flags": [{ "flag": "string", "reason": "string", "urgency": "routine|soon|urgent|emergency" }],
  "questions_for_doctor": ["string"],
  "doctor_note": "string"
}
```

`normalizeReport.js` transforms this into the companion component shape (`.name` instead of `.symptom`, numeric severity, flat arrays, etc.).
