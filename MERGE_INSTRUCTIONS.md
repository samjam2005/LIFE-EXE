# Merge Instructions — RxReady Companion Module

**Target merge time: under 5 minutes.**
These instructions assume your project structure is `backend/` and `frontend/src/` at the root.

---

## Step 1 — Backend (≈ 2 min)

### 1a. Copy files

```bash
# From the repo root
cp rxready-companion/backend/analyzer.py       your-project/backend/
cp -r rxready-companion/backend/routers/       your-project/backend/routers/
```

If your project already has a `routers/` directory, just copy the single file:

```bash
cp rxready-companion/backend/routers/analyzer.py  your-project/backend/routers/
```

### 1b. Install new dependencies

```bash
pip install -r rxready-companion/backend/requirements_addon.txt
```

> **Note:** This file does not overwrite your `requirements.txt`. It only adds the packages needed by the companion module. If you already have `anthropic` and `fastapi` installed, this is a no-op.

### 1c. Register the router — ONE line in your `main.py`

Add these two lines **after** your existing router registrations:

```python
from routers.analyzer import router as analyzer_router
app.include_router(analyzer_router)
```

New endpoint added: `POST /analyze` — does not conflict with `/start`, `/chat`, or `/report`.

---

## Step 2 — Frontend (≈ 2 min)

### 2a. Copy components

```bash
cp rxready-companion/frontend/src/components/*  your-project/frontend/src/components/
```

Files added:
- `DoctorBrief.jsx` + `DoctorBrief.css`
- `PatientPrepCard.jsx` + `PatientPrepCard.css`

### 2b. Add imports to `App.js`

```js
import DoctorBrief from './components/DoctorBrief';
import PatientPrepCard from './components/PatientPrepCard';
```

### 2c. Add state for analysis flags

```js
const [analysisFlags, setAnalysisFlags] = useState([]);
```

### 2d. Fetch `/analyze` after report is generated

Find where you call `/report` and set your report state. Immediately after that, add:

```js
// After: const reportData = await reportRes.json(); setReport(reportData);
const analyzeRes = await fetch('/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ report: reportData }),
});
const { flags } = await analyzeRes.json();
setAnalysisFlags(flags);
```

### 2e. Render components in their tabs

**In the "For Your Doctor" tab** — replace or append existing content:

```jsx
<DoctorBrief report={report} />
```

**In the "For You" tab** — below your plain-English summary:

```jsx
<PatientPrepCard report={report} analysisFlags={analysisFlags} />
```

---

## Step 3 — Verify (≈ 30 sec)

1. Start backend: `uvicorn main:app --reload`
2. In a separate terminal: `npm start` in `frontend/`
3. Run through a conversation → generate report
4. Confirm:
   - "For You" tab shows `PatientPrepCard` below the summary
   - "For Your Doctor" tab shows `DoctorBrief` with print button
   - No console errors

---

## Conflict checklist

| What to check | Expected |
|---|---|
| Route `/analyze` already exists | It shouldn't — if it does, rename the import alias |
| CSS classes `.doctor-brief` or `.prep-card` in `App.css` | They shouldn't be — companion CSS is fully scoped |
| `anthropic` already in `requirements.txt` | Fine — `requirements_addon.txt` won't downgrade it |
| `components/` directory doesn't exist yet | Create it: `mkdir -p frontend/src/components` |

---

## File inventory

```
rxready-companion/
├── backend/
│   ├── analyzer.py                  ← Standalone entry (dev/testing)
│   ├── routers/
│   │   └── analyzer.py              ← Register this in main.py
│   └── requirements_addon.txt       ← pip install -r this
├── frontend/
│   └── src/
│       └── components/
│           ├── DoctorBrief.jsx
│           ├── DoctorBrief.css
│           ├── PatientPrepCard.jsx
│           └── PatientPrepCard.css
├── pitch/
│   ├── build_deck.js
│   └── RxReady_Pitch.pptx
└── MERGE_INSTRUCTIONS.md
```
