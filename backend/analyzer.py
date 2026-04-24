"""
RedFlagLayer — standalone entry point for local development / testing.

Run with:
    uvicorn analyzer:app --reload --port 8001

Or merge into teammate's main.py (see MERGE_INSTRUCTIONS.md).
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers.analyzer import router as analyzer_router

app = FastAPI(title="RxReady RedFlagLayer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyzer_router)


@app.get("/health")
def health():
    return {"status": "ok", "module": "RedFlagLayer"}
