from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
import json

from routers.analyzer import router as analyzer_router

app = FastAPI()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyzer_router, prefix="/api")

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ── PROMPTS ───────────────────────────────────────────────────────────────────

CHAT_SYSTEM = """You are MedBrief — a warm, calm pre-appointment health assistant. Your job is to help patients articulate their symptoms clearly before seeing a doctor.

You are NOT a doctor. You do NOT diagnose. You organize and clarify.

YOUR APPROACH:
- Conversational, warm, never clinical or cold
- Ask ONE follow-up question at a time — never bombard
- Cover these areas naturally across the conversation (don't rush):
  * Main symptoms and chief complaint
  * Duration (when did it start?)
  * Severity (1-10 scale, or descriptive)
  * Pattern (constant, comes and goes, worse at certain times?)
  * Triggers or relievers
  * Associated symptoms
  * Current medications and allergies
  * Relevant medical history
  * What they've already tried
- After 6-8 exchanges, tell the patient you have enough to generate their report

TONE: Like a knowledgeable friend who happens to know medicine. Warm, reassuring, never alarmist.

IMPORTANT: Never give diagnoses. Never say "you have X". Always say "this is worth discussing with your doctor."

Start by greeting the patient and asking what brings them in today."""

REPORT_PROMPT = """You are a medical documentation assistant. Based on this patient conversation, generate a structured pre-appointment report.

CONVERSATION:
{conversation}

Generate ONLY valid JSON with this exact structure:
{{
  "patient_summary": "2-3 sentence plain-English summary of why they're here — what the patient would say in their own words",
  "chief_complaint": "One sentence — the main reason for the visit",
  "symptoms": [
    {{
      "symptom": "symptom name",
      "duration": "how long",
      "severity": "mild/moderate/severe + any scale they gave",
      "pattern": "constant/intermittent/etc",
      "details": "any other relevant details"
    }}
  ],
  "medications_and_allergies": {{
    "current_medications": ["list of medications mentioned, or 'None reported'"],
    "allergies": ["list of allergies, or 'None reported'"],
    "tried_for_this": ["what they've already tried for current symptoms"]
  }},
  "relevant_history": "Any relevant medical history mentioned, or 'Not reported'",
  "red_flags": [
    {{
      "flag": "the concerning symptom or detail",
      "reason": "why this warrants attention",
      "urgency": "routine/soon/urgent/emergency"
    }}
  ],
  "questions_for_doctor": ["3-5 questions the patient should ask their doctor based on their symptoms"],
  "doctor_note": "A concise 3-4 sentence clinical summary written for the doctor — objective, clear, uses appropriate medical language"
}}

Be thorough. If something wasn't mentioned, say 'Not reported'. For red_flags, only include genuinely concerning patterns — not every symptom. urgency levels: routine (mention at visit), soon (within days), urgent (today), emergency (go now)."""


# ── MODELS ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list[dict]

class ReportRequest(BaseModel):
    history: list[dict]


# ── ENDPOINTS ─────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        messages = req.history + [{"role": "user", "content": req.message}]
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=512,
            messages=[{"role": "system", "content": CHAT_SYSTEM}] + messages
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/start")
async def start():
    try:
        messages = [{"role": "user", "content": "Hello, I need to prepare for my doctor's appointment."}]
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=256,
            messages=[{"role": "system", "content": CHAT_SYSTEM}] + messages
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report")
async def generate_report(req: ReportRequest):
    try:
        conversation_text = "\n".join([
            f"{'Patient' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
            for m in req.history
        ])
        prompt = REPORT_PROMPT.format(conversation=conversation_text)
        messages = [{"role": "user", "content": prompt}]
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=2048,
            messages=[{"role": "system", "content": CHAT_SYSTEM}] + messages
        )
        raw = (response.choices[0].message.content or "").strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(raw)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
