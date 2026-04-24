# PRD: RxReady Companion Module
**Product Requirements Document**
**Version:** 1.0
**Status:** Active — Hackathon Build
**Track:** Health and Wellbeing

---

## 1. Overview

### 1.1 Background

RxReady is a pre-appointment brain dump tool built for the Health and Wellbeing hackathon track. The core problem: healthcare is expensive, confusing, and inaccessible. Patients arrive at appointments disorganized, forget key symptoms, and lack the literacy to advocate for themselves in a 18-minute window with their doctor.

The primary application (owned by teammate) solves this with a conversational AI intake flow — the patient describes symptoms like texting a friend, Claude asks smart follow-up questions, and the app generates two structured outputs: a plain-English summary for the patient and a clinical brief for the doctor.

This PRD covers the **companion module** — four additive workstreams built in parallel that enhance and extend the core app without modifying any existing files.

### 1.2 Objectives

- Build four standalone modules that complement the core RxReady intake flow
- Use identical tech stack (Python FastAPI + React) for seamless merge
- Serve both sides of the doctor-patient interaction
- Produce a polished hackathon pitch deck
- Enable a sub-5-minute merge with teammate's codebase at end of hackathon

### 1.3 Success Criteria

- All four modules are functional and independently testable
- Zero conflicts with teammate's existing endpoints or CSS
- Merge instructions are clear enough that teammate can integrate without assistance
- Pitch deck is presentation-ready with no placeholder content

---

## 2. Context: Teammate's Existing Codebase

This section documents the existing system that the companion module must integrate with. **Do not modify any files described here.**

### 2.1 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.x, FastAPI, Uvicorn |
| AI | Anthropic Claude API (`anthropic` SDK) |
| Frontend | React (Create React App) |
| Env | `python-dotenv`, `.env` file with `ANTHROPIC_API_KEY` |

### 2.2 Existing Backend Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/start` | Initializes session, returns `session_id` and opening message |
| POST | `/chat` | Takes `{ session_id, message }`, returns next Claude follow-up question |
| POST | `/report` | Takes `{ session_id }`, returns structured report JSON |

### 2.3 Report JSON Schema

All companion modules consume this shape, produced by `/report`:

```json
{
  "chief_complaint": "string",
  "symptoms": [
    { "name": "string", "duration": "string", "severity": "integer (1–10)" }
  ],
  "medications": ["string"],
  "allergies": ["string"],
  "red_flags": [
    { "symptom": "string", "urgency": "routine | urgent | emergency" }
  ],
  "questions_for_doctor": ["string"],
  "summary_plain_english": "string",
  "visit_type_recommendation": "routine | urgent | emergency"
}
```

### 2.4 Existing Frontend Structure

```
frontend/
└── src/
    ├── App.js       ← Chat UI + report view, two tabs: "For You" / "For Your Doctor"
    ├── App.css      ← Dark teal medical aesthetic
    └── index.js
```

The app has a progress bar that unlocks "Generate Report" after 6 conversation exchanges.

---

## 3. Design System

All companion modules must match the existing dark teal aesthetic exactly.

### 3.1 Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0d1f2d` | Page/slide backgrounds |
| `--bg-surface` | `#112233` | Cards, panels |
| `--accent-primary` | `#00b4a6` | CTAs, highlights, borders |
| `--accent-secondary` | `#0891b2` | Secondary interactive elements |
| `--text-primary` | `#e8f4f8` | Body text |
| `--text-muted` | `#7a9bb5` | Labels, captions |
| `--urgency-emergency` | `#ef4444` | Emergency red flags |
| `--urgency-urgent` | `#f59e0b` | Urgent amber |
| `--urgency-routine` | `#10b981` | Routine green |

### 3.2 Typography

- **React components:** `DM Sans` from Google Fonts
- **Pitch deck headers:** Cambria
- **Pitch deck body:** Calibri

### 3.3 CSS Scoping Rules

All component styles must be scoped to component-level class names to prevent collisions with `App.css`:
- `DoctorBrief.jsx` → `.doctor-brief` namespace
- `PatientPrepCard.jsx` → `.prep-card` namespace

---

## 4. Module Specifications

### 4.1 Module 1 — DoctorBrief Component

**File:** `frontend/src/components/DoctorBrief.jsx` + `DoctorBrief.css`
**Type:** React component
**Purpose:** Replace/enhance the "For Your Doctor" tab with a scannable clinical brief a doctor can read in 30 seconds.

#### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `report` | `object` | Yes | Full report JSON from `/report` endpoint |

#### UI Sections (top to bottom)

1. **Chief Complaint Header** — large, prominent, first thing the doctor sees
2. **Symptom Table** — columns: Symptom / Duration / Severity (rendered as `/10`)
3. **Medications & Allergies** — two-column side-by-side layout
4. **Red Flags** — each flag displayed with a colored urgency badge (green/amber/red matching design tokens)
5. **Questions to Address** — bulleted list of `questions_for_doctor`
6. **Print / Save as PDF Button** — calls `window.print()`, triggers print-specific CSS

#### Print Stylesheet Requirements

- Strip dark background, render clean black-on-white
- Preserve all clinical content exactly
- Format for standard letter paper (8.5" × 11")
- Hide the print button itself in print mode
- Suitable to hand to a doctor on a clipboard

#### Integration

```jsx
// In teammate's App.js — single import line needed:
import DoctorBrief from './components/DoctorBrief';

// In the "For Your Doctor" tab render:
<DoctorBrief report={report} />
```

---

### 4.2 Module 2 — RedFlagLayer Endpoint

**Files:** `backend/analyzer.py`, `backend/routers/analyzer.py`
**Type:** FastAPI router + endpoint
**Purpose:** Second-pass Claude API call that analyzes the structured report and returns flagged items framed strictly as questions to raise — never as diagnoses.

#### Endpoint

```
POST /analyze
```

#### Request Body

```json
{ "report": { ...report JSON... } }
```

#### Response Body

```json
{
  "flags": [
    {
      "symptom": "string",
      "question_to_ask": "string",
      "priority": "low | medium | high"
    }
  ]
}
```

#### System Prompt Engineering Requirements

The Claude system prompt for this endpoint must:
- Instruct Claude to act as a clinical decision support tool, **not** a diagnostician
- **Explicitly prohibit** any language of the form "you have X" or "this means Y"
- Frame all outputs as: *"Given symptom Y lasting Z days, it may be worth asking your doctor about..."*
- Never suggest a conclusion — only surface questions
- Return **only valid JSON**, no preamble or markdown

#### Integration Requirements

- Implemented as a FastAPI `APIRouter` in `backend/routers/analyzer.py`
- Registered in teammate's `main.py` with a single additive line:
  ```python
  from routers.analyzer import router as analyzer_router
  app.include_router(analyzer_router)
  ```
- Must not conflict with existing routes `/start`, `/chat`, `/report`
- All new Python dependencies go in `requirements_addon.txt`, not overwriting `requirements.txt`

---

### 4.3 Module 3 — PatientPrepCard Component

**File:** `frontend/src/components/PatientPrepCard.jsx` + `PatientPrepCard.css`
**Type:** React component
**Purpose:** Post-report patient-facing card that prepares them for what to actually say and ask in the appointment room.

#### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `report` | `object` | Yes | Full report JSON from `/report` endpoint |
| `analysisFlags` | `array` | No | Flags array from `/analyze` endpoint response |

#### UI Sections

The card has exactly three sections, no more:

1. **Say This** (3 items)
   - Chief complaint in plain language (from `chief_complaint`)
   - Top severity symptom (highest `severity` value from `symptoms[]`)
   - Duration of the primary issue

2. **Ask This** (2 items)
   - First two entries from `questions_for_doctor[]`
   - If `analysisFlags` is provided, prioritize `high` priority flags

3. **Don't Forget** (1 item)
   - If `medications[]` is non-empty: *"Mention you're taking [medication]"*
   - If `allergies[]` is non-empty: *"Tell them about your [allergy] allergy"*
   - If both: combine the most critical one

#### Behaviors

- **Copy to Clipboard button** — copies the full prep card as plain text (no markdown, no HTML)
- **Emergency pulse animation** — if `visit_type_recommendation === "emergency"`, the urgency badge gets a CSS `@keyframes` pulse animation in `--urgency-emergency` red
- Rendered **inside the "For You" tab**, below the plain-English summary

#### Integration

```jsx
// In teammate's App.js:
import PatientPrepCard from './components/PatientPrepCard';

// In the "For You" tab render, after summary:
<PatientPrepCard report={report} analysisFlags={analysisFlags} />
```

---

### 4.4 Module 4 — Pitch Deck

**Files:** `pitch/build_deck.js` (pptxgenjs Node script), `pitch/RxReady_Pitch.pptx` (output)
**Type:** PowerPoint presentation
**Purpose:** Polished hackathon pitch deck, presentation-ready with no placeholder content.

#### Slide Specifications

| # | Title | Layout | Key Content |
|---|---|---|---|
| 1 | Title | Dark bg | "RxReady" large, tagline "Know before you go.", teal accent |
| 2 | The Problem | Light bg, 3-column stat callouts | "1 in 3 patients forget key symptoms", "Avg appointment: 18 minutes", "Billions navigate healthcare alone" |
| 3 | The Solution | Light bg, two-column | Left: 4-step flow (Describe → Claude asks → Report generated → Walk in prepared). Right: visual representation of chat UI using shapes |
| 4 | For the Patient | Light bg | "For You" tab features: plain English summary, prep card sections, urgency badge |
| 5 | For the Doctor | Light bg | DoctorBrief features: symptom table, red flags with urgency badges, print-ready format |
| 6 | How It Works | Light bg, architecture diagram | Patient → FastAPI → Claude API → Structured Report → Two Views (shapes and arrows, no images) |
| 7 | Why We Win | Light bg, 3 differentiators | "Serves both sides of the room", "Framed as questions not diagnoses (safe)", "Print-ready in one click" |
| 8 | Demo + Ask | Dark bg | "See it live." — prize callout: 1st place $350 + $500 API credits, 2nd place $200 |

#### Deck Design Rules

- Dark background (`#0d1f2d`) on slides 1 and 8 only — "sandwich" structure
- Light background (`#f0f8ff`) on all content slides (2–7)
- `#00b4a6` as the single accent color used consistently throughout
- **Prohibited:** accent lines under titles, colored header/footer bars, cream backgrounds, unicode bullets
- Cambria for all slide headers (36–44pt bold), Calibri for body (14–16pt)
- Every slide must have at least one visual element — shape, stat callout, or diagram
- No text-only slides

---

## 5. Project Structure

```
rxready-companion/
├── backend/
│   ├── analyzer.py                  ← RedFlagLayer: entry point
│   ├── routers/
│   │   └── analyzer.py              ← FastAPI router for /analyze
│   └── requirements_addon.txt       ← New deps only, does not overwrite teammate's
├── frontend/
│   └── src/
│       └── components/
│           ├── DoctorBrief.jsx      ← Module 1
│           ├── DoctorBrief.css      ← Includes @media print styles
│           ├── PatientPrepCard.jsx  ← Module 3
│           └── PatientPrepCard.css
├── pitch/
│   ├── build_deck.js                ← pptxgenjs build script
│   └── RxReady_Pitch.pptx           ← Generated output
└── MERGE_INSTRUCTIONS.md            ← Step-by-step for teammate
```

---

## 6. Merge Instructions (for teammate)

All merge steps must be documented in `MERGE_INSTRUCTIONS.md`. The target: **under 5 minutes to fully integrate.**

### 6.1 Backend

```bash
# 1. Copy new files into his backend/
cp rxready-companion/backend/analyzer.py his-project/backend/
cp -r rxready-companion/backend/routers/ his-project/backend/routers/

# 2. Install new dependencies
pip install -r rxready-companion/backend/requirements_addon.txt

# 3. Add ONE line to his main.py (after existing router setup):
from routers.analyzer import router as analyzer_router
app.include_router(analyzer_router)
```

### 6.2 Frontend

```bash
# 1. Copy components
cp rxready-companion/frontend/src/components/* his-project/frontend/src/components/

# 2. Add to App.js imports:
import DoctorBrief from './components/DoctorBrief';
import PatientPrepCard from './components/PatientPrepCard';

# 3. Add to "For Your Doctor" tab JSX:
<DoctorBrief report={report} />

# 4. Add to "For You" tab JSX (after summary):
<PatientPrepCard report={report} analysisFlags={analysisFlags} />

# 5. Add analysisFlags state (if not already present):
const [analysisFlags, setAnalysisFlags] = useState([]);

# 6. After report is generated, fetch /analyze:
const res = await fetch('/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ report })
});
const { flags } = await res.json();
setAnalysisFlags(flags);
```

---

## 7. Constraints & Non-Negotiables

| Constraint | Reason |
|---|---|
| Do NOT modify `main.py`, `App.js`, or `App.css` | Prevents merge conflicts |
| All new CSS scoped to component class names | Prevents style collisions |
| New pip deps in `requirements_addon.txt` only | Preserves his lockfile |
| `/analyze` must not overlap with `/start`, `/chat`, `/report` | Prevents routing conflicts |
| RedFlagLayer prompt must never produce diagnostic language | Safety and legal framing |
| Components must accept `report` as a prop (not fetch internally) | Keeps data flow in his App.js |

---

## 8. Build Order

Start in this sequence to unblock the most work earliest:

1. `backend/routers/analyzer.py` — unblocks frontend flag integration
2. `DoctorBrief.jsx` + `DoctorBrief.css` — largest UI surface, needs most time
3. `PatientPrepCard.jsx` + `PatientPrepCard.css` — depends on analyzer response shape
4. `pitch/build_deck.js` → run to generate `RxReady_Pitch.pptx`
5. `MERGE_INSTRUCTIONS.md` — write last once all files are finalized

---

## 9. Out of Scope

- Authentication or session persistence across browser refreshes
- EHR / Epic integration
- Mobile-responsive layout (desktop demo only for hackathon)
- Modifying teammate's conversational intake flow or Claude prompts in `/chat`
- Any diagnostic or prescriptive medical output
