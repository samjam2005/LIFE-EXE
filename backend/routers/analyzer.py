"""
RedFlagLayer — /analyze endpoint
FastAPI router. Register in teammate's main.py with:

    from routers.analyzer import router as analyzer_router
    app.include_router(analyzer_router)
"""

import json
import os
from typing import List, Optional

from groq import Groq
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class Symptom(BaseModel):
    symptom: str
    duration: Optional[str] = None
    severity: Optional[str] = None
    pattern: Optional[str] = None
    details: Optional[str] = None

class MedicationsAndAllergies(BaseModel):
    current_medications: List[str] = []
    allergies: List[str] = []
    tried_for_this: List[str] = []

class RedFlag(BaseModel):
    flag: str
    reason: Optional[str] = None
    urgency: str  # "routine" | "soon" | "urgent" | "emergency"

class ReportPayload(BaseModel):
    patient_summary: Optional[str] = None
    chief_complaint: str
    symptoms: List[Symptom] = []
    medications_and_allergies: Optional[MedicationsAndAllergies] = None
    relevant_history: Optional[str] = None
    red_flags: List[RedFlag] = []
    questions_for_doctor: List[str] = []
    doctor_note: Optional[str] = None

class AnalyzeRequest(BaseModel):
    report: ReportPayload

class AnalysisFlag(BaseModel):
    symptom: str
    question_to_ask: str
    priority: str  # "low" | "medium" | "high"

class AnalyzeResponse(BaseModel):
    flags: List[AnalysisFlag]


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a clinical decision support assistant — NOT a diagnostician.

Your job is to read a structured patient intake report and surface thoughtful questions the patient should raise with their doctor. You do NOT diagnose, conclude, or interpret. You only help the patient ask better questions.

Rules you must follow without exception:
1. NEVER use language like "you have X", "this indicates Y", "this means Z", or any phrasing that implies a diagnosis or clinical conclusion.
2. NEVER suggest a specific condition, disease, or disorder by name.
3. ALWAYS frame output as: "Given [symptom] lasting [duration], it may be worth asking your doctor about..."
4. Assign priority based solely on: high = urgent/emergency visit type or severity ≥ 8, medium = severity 5–7 or urgent flag present, low = everything else.
5. Return ONLY valid JSON — no preamble, no markdown fences, no explanation text.

Output format (strict JSON, no extra keys):
{
  "flags": [
    {
      "symptom": "<symptom name>",
      "question_to_ask": "<patient-friendly question framed for doctor conversation>",
      "priority": "low | medium | high"
    }
  ]
}

Generate one flag per notable symptom or red flag. If there are no notable items, return {"flags": []}.
"""


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_report(body: AnalyzeRequest):
    """
    Second-pass LLM call that surfaces questions for the patient to raise
    with their doctor — never produces diagnostic language.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    client = Groq(api_key=api_key)

    report = body.report
    report_text = json.dumps(report.model_dump(), indent=2)

    user_message = f"""Here is the patient intake report to analyze:

{report_text}

Return a JSON object with a "flags" array. Each flag must include a symptom name, a question framed for the patient to ask their doctor, and a priority level (low/medium/high). Return only the JSON object — no other text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1024,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    raw = (response.choices[0].message.content or "").strip()

    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail=f"LLM returned non-JSON response: {raw[:200]}",
        )

    flags = [AnalysisFlag(**f) for f in parsed.get("flags", [])]
    return AnalyzeResponse(flags=flags)
