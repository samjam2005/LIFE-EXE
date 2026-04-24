# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

RxReady Companion — four additive modules that extend a teammate's existing health intake app (FastAPI + React). These modules must **never** modify the teammate's existing files (`main.py`, `App.js`, `App.css`). Everything here is designed for zero-conflict merge.

## Commands

### Backend (standalone development server)
```bash
cd backend
uvicorn analyzer:app --reload --port 8001
```
Requires `ANTHROPIC_API_KEY` in a `.env` file at the backend root.

### Pitch Deck
```bash
cd pitch
node build_deck.js   # Regenerates RxReady_Pitch.pptx
```
Run `npm install` first if `node_modules/` is missing.

### Frontend
No standalone dev server — components are designed to be copied into the teammate's Create React App and run with their `npm start`.

## Architecture

The companion module produces **two React components** and **one new API endpoint** that all consume the same report JSON shape produced by the teammate's existing `POST /report`.

```
Teammate's /report → report JSON
                      ├─→ POST /analyze (new) → { flags[] }
                      ├─→ <DoctorBrief report={report} />          ("For Your Doctor" tab)
                      └─→ <PatientPrepCard report={report} analysisFlags={flags} />  ("For You" tab)
```

- **`backend/routers/analyzer.py`** — FastAPI `APIRouter` registered with `app.include_router()`. The only backend code. Uses Claude to produce question-framed flags (never diagnostic language).
- **`backend/analyzer.py`** — Standalone FastAPI app wrapping the router, for independent development/testing on port 8001.
- **`frontend/src/components/DoctorBrief.jsx`** — Clinical brief with print stylesheet. CSS scoped under `.doctor-brief`.
- **`frontend/src/components/PatientPrepCard.jsx`** — 3-section patient prep card with copy-to-clipboard. CSS scoped under `.prep-card`.
- **`pitch/build_deck.js`** — pptxgenjs script generating the 8-slide hackathon pitch deck.

## Critical Constraints

- **No diagnostic language** — The `/analyze` system prompt must never produce "you have X" or name conditions. All output must be framed as questions for the patient to ask their doctor.
- **CSS scoping** — All styles use component-level namespaces (`.doctor-brief__*`, `.prep-card__*`) to avoid collisions with the teammate's `App.css`.
- **Additive dependencies only** — Python deps go in `requirements_addon.txt`, never overwriting the teammate's `requirements.txt`.
- **Props-driven components** — Components receive `report` as a prop from the parent `App.js`. They never fetch data internally.

## Design System

Dark teal medical aesthetic. Key tokens:
- Backgrounds: `#0d1f2d` (base), `#112233` (surface)
- Accent: `#00b4a6` (primary teal), `#0891b2` (secondary)
- Text: `#e8f4f8` (primary), `#7a9bb5` (muted)
- Urgency: `#ef4444` (emergency), `#f59e0b` (urgent), `#10b981` (routine)
- Font: DM Sans for React components; Cambria (headers) + Calibri (body) for pitch deck

## Report JSON Shape

Both components and the `/analyze` endpoint consume this structure from the teammate's `/report`:

```json
{
  "chief_complaint": "string",
  "symptoms": [{ "name": "string", "duration": "string", "severity": 1-10 }],
  "medications": ["string"],
  "allergies": ["string"],
  "red_flags": [{ "symptom": "string", "urgency": "routine|urgent|emergency" }],
  "questions_for_doctor": ["string"],
  "summary_plain_english": "string",
  "visit_type_recommendation": "routine|urgent|emergency"
}
```
