"""
RedFlagLayer — /analyze endpoint
FastAPI router. Register in teammate's main.py with:

    from routers.analyzer import router as analyzer_router
    app.include_router(analyzer_router)
"""

import json
import os
from typing import List, Optional

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class Symptom(BaseModel):
    name: str
    duration: str
    severity: int

class RedFlag(BaseModel):
    symptom: str
    urgency: str  # "routine" | "urgent" | "emergency"

class ReportPayload(BaseModel):
    chief_complaint: str
    symptoms: List[Symptom]
    medications: List[str]
    allergies: List[str]
    red_flags: List[RedFlag]
    questions_for_doctor: List[str]
    summary_plain_english: str
    visit_type_recommendation: str  # "routine" | "urgent" | "emergency"

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
    Second-pass Claude call that surfaces questions for the patient to raise
    with their doctor — never produces diagnostic language.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    client = anthropic.Anthropic(api_key=api_key)

    report = body.report
    report_text = json.dumps(report.model_dump(), indent=2)

    user_message = f"""Here is the patient intake report to analyze:

{report_text}

Return a JSON object with a "flags" array. Each flag must include a symptom name, a question framed for the patient to ask their doctor, and a priority level (low/medium/high). Return only the JSON object — no other text."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    raw = message.content[0].text.strip()

    # Strip accidental markdown fences if Claude wraps anyway
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Claude returned non-JSON response: {raw[:200]}",
        )

    flags = [AnalysisFlag(**f) for f in parsed.get("flags", [])]
    return AnalyzeResponse(flags=flags)
