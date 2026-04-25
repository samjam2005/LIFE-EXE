# MedBrief

**Know before you go.** A pre-appointment health assistant that helps patients articulate their symptoms clearly and gives doctors a structured clinical brief — all before the visit begins.

## What It Does

1. **Conversational Intake** — Patients describe symptoms in plain language. An AI assistant asks targeted follow-up questions one at a time, covering severity, duration, triggers, medications, and history.
2. **Structured Report** — After enough context is gathered, a structured JSON report is generated with symptoms, red flags, medications, and a clinical note.
3. **Patient Prep Card** ("For You" tab) — A pocket-sized card with three sections: *Say This* (key talking points), *Ask This* (questions to raise with the doctor), and *Don't Forget* (medications/allergies).
4. **Doctor Brief** ("For Your Doctor" tab) — A printable clinical summary with symptom table, red flag badges, medications, and a doctor's note. Designed to be handed to the physician or printed as a clean PDF.
5. **Red Flag Analysis** — A second-pass AI call analyzes the report and surfaces symptom-specific questions the patient should ask, prioritized by urgency. All output is framed as questions — never diagnoses.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Backend | FastAPI, Python |
| AI / LLM | Groq API (LLaMA 3.3 70B Versatile) |
| Styling | Custom CSS (Fraunces, DM Sans, DM Mono) |
| Pitch Deck | pptxgenjs (Node.js) |

## Project Structure

```
backend/
  main.py               # FastAPI app — /api/start, /api/chat, /api/report
  routers/
    analyzer.py          # /api/analyze — red flag analysis endpoint
  requirements.txt
  .env.example

frontend/
  index.html
  vite.config.js         # Dev server proxy → localhost:8000
  src/
    App.jsx              # Main app — chat UI, report generation, tab views
    App.css              # Global styles (warm cream design system)
    normalizeReport.js   # Transforms report JSON for companion components
    components/
      DoctorBrief.jsx    # Clinical brief with print stylesheet
      DoctorBrief.css
      PatientPrepCard.jsx # Patient prep card with clipboard copy
      PatientPrepCard.css

pitch/                   # Excluded from git
  build_deck.js          # Generates MedBrief_Pitch.pptx
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Groq API key to .env
uvicorn main:app --reload
```

The API server starts on `http://localhost:8000`. Test with `GET /health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server starts on `http://localhost:5173` with API requests proxied to the backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/start` | Begin a new conversation — returns the assistant's greeting |
| `POST` | `/api/chat` | Send a message with conversation history, get a follow-up reply |
| `POST` | `/api/report` | Generate a structured report from the conversation history |
| `POST` | `/api/analyze` | Second-pass analysis — returns red flag questions for the patient |
| `GET` | `/health` | Health check |

## How It Works

```
Patient → Chat UI (React) → /api/chat (Groq LLaMA) → conversation
                           → /api/report (Groq LLaMA) → report JSON
                                ├─→ /api/analyze (Groq LLaMA) → { flags[] }
                                ├─→ normalizeReport.js → normalized shape
                                │     ├─→ <PatientPrepCard />  ("For You" tab)
                                │     └─→ <DoctorBrief />      ("For Your Doctor" tab)
                                └─→ ReportView (raw shape)     (symptom cards, tables)
```

The `/api/analyze` call is non-fatal — if it fails, the app still works fully, just without the analysis-driven question prioritization in the prep card.

## Design

Warm cream aesthetic with:
- **Fraunces** (serif) for headings
- **DM Sans** for body text
- **DM Mono** for labels and metadata
- Urgency color coding: red (emergency), orange (urgent), yellow (soon), green (routine)
- Print-optimized DoctorBrief renders clean black-on-white for clinical use

## Team

Built for the Health & Wellbeing track hackathon.
