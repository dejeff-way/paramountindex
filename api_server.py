#!/usr/bin/env python3
"""
Paramount Index — FastAPI Server
══════════════════════════════════════════════════════════════
Wraps leads.db behind a REST API for the React dashboard.

Dependencies (install before running):
  pip install fastapi uvicorn

Run:
  uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
══════════════════════════════════════════════════════════════
"""

import json
import sqlite3
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Config ──────────────────────────────────────────────────
BASE_DIR = Path("/root/workspace/procurement")
DB_PATH = BASE_DIR / "leads.db"
SUBSCRIBERS_PATH = BASE_DIR / "subscribers.txt"

# ── App ─────────────────────────────────────────────────────
app = FastAPI(
    title="Paramount Index API",
    description="B2B government procurement intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://paramount-index.pages.dev",
        "https://paramountindex.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ─────────────────────────────────────────────────
def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    # Parse deepseek_json from string to object
    if "deepseek_json" in d and isinstance(d["deepseek_json"], str):
        try:
            d["deepseek_json"] = json.loads(d["deepseek_json"])
        except (json.JSONDecodeError, TypeError):
            d["deepseek_json"] = {}
    return d


# ── Models ──────────────────────────────────────────────────
class SubscribeRequest(BaseModel):
    email: str


# ── Routes ──────────────────────────────────────────────────
@app.get("/leads")
def get_leads(
    county: Optional[str] = Query(None, description="Filter by source county"),
    niche: Optional[str] = Query(None, description="Filter by classification niche"),
    keyword: Optional[str] = Query(None, description="Search title/overview/scope"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Results per page"),
):
    """
    Get leads with optional filters and pagination.
    """
    conn = get_db()
    try:
        where = ["1=1"]
        params: list = []

        if county:
            where.append(
                "(source_county LIKE ? OR department LIKE ? OR county_agency LIKE ?)"
            )
            c = f"%{county}%"
            params.extend([c, c, c])

        if niche:
            where.append("classification_niche = ?")
            params.append(niche)

        if keyword:
            where.append(
                "(contract_title LIKE ? OR overview_text LIKE ? OR scope_text LIKE ?)"
            )
            kw = f"%{keyword}%"
            params.extend([kw, kw, kw])

        if status:
            where.append("status = ?")
            params.append(status)

        where_clause = " AND ".join(where)

        # Count
        count_sql = f"SELECT COUNT(*) FROM leads WHERE {where_clause}"
        total = conn.execute(count_sql, params).fetchone()[0]

        # Fetch page
        offset = (page - 1) * per_page
        data_sql = f"""
            SELECT * FROM leads
            WHERE {where_clause}
            ORDER BY
                CASE WHEN submission_deadline_date IS NULL OR submission_deadline_date = '' THEN 1 ELSE 0 END,
                submission_deadline_date ASC
            LIMIT ? OFFSET ?
        """
        rows = conn.execute(data_sql, params + [per_page, offset]).fetchall()

        return {
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": max(1, (total + per_page - 1) // per_page),
            "leads": [row_to_dict(r) for r in rows],
        }
    finally:
        conn.close()


@app.get("/leads/{project_id}")
def get_lead(project_id: str):
    """
    Get a single lead by project_id.
    """
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM leads WHERE project_id = ?", (project_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")
        return row_to_dict(row)
    finally:
        conn.close()


@app.post("/api/subscribe")
def subscribe(req: SubscribeRequest):
    """
    Append email to subscribers.txt.
    """
    email = req.email.strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    SUBSCRIBERS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SUBSCRIBERS_PATH, "a") as f:
        f.write(f"{email}\n")

    return {"status": "ok", "message": "Subscribed successfully"}


@app.get("/api/subscribers/count")
def subscriber_count():
    """
    Return subscriber count (admin utility).
    """
    if not SUBSCRIBERS_PATH.exists():
        return {"count": 0}
    with open(SUBSCRIBERS_PATH) as f:
        count = sum(1 for line in f if line.strip())
    return {"count": count}


@app.get("/health")
def health():
    return {"status": "ok", "db": str(DB_PATH.exists())}
