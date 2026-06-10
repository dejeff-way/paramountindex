#!/usr/bin/env python3
"""
Paramount Index — Ocean County Procurement Wire
══════════════════════════════════════════════════════════════
B2B Local RFP Arbitrage Engine
Target:   OpenGov portal, Ocean County NJ
          https://procurement.opengov.com/portal/oceancounty

Architecture:
  Playwright (headless Chromium) → Project Listing
    → Detail Page (Overview + Project Documents inline text)
    → DeepSeek API Structured JSON Transformation
    → SQLite Dedup Pipeline
    → Daily Premium Markdown Email Wire

Key Insight: OpenGov renders the FULL RFP document text inline
in the DOM via the "Project Documents" tab. No PDF download or
OCR pipeline required — we extract structured text directly.

Cron:     3x daily at 10:00, 16:00, 22:00 UTC (6 AM, 12 PM, 6 PM ET)
Author:   JARVIS / Elite Systems Architect
══════════════════════════════════════════════════════════════
"""

import os
import re
import sys
import json
import sqlite3
import hashlib
import logging
import argparse
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Any

# -------------------------------------------------------------------
# Config
# -------------------------------------------------------------------
BASE_DIR = Path("/root/workspace/procurement")
TEMP_DIR = BASE_DIR / "temp_bids"
DB_PATH = BASE_DIR / "leads.db"
OUTPUT_DIR = BASE_DIR / "output"
ENV_PATH = BASE_DIR / ".env"
LOG_PATH = BASE_DIR / "scraper.log"

PORTAL_URL = "https://procurement.opengov.com/portal/oceancounty"

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("ocean_county")

# -------------------------------------------------------------------
# Env
# -------------------------------------------------------------------
def load_env():
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

def get_deepseek_key() -> str:
    load_env()
    return os.environ.get("DEEPSEEK_API_KEY", "")

# -------------------------------------------------------------------
# SQLite Schema
# -------------------------------------------------------------------
def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL UNIQUE,
            contract_title TEXT,
            county_agency TEXT DEFAULT 'Ocean County Purchasing Department',
            classification_niche TEXT,
            project_budget_estimate TEXT,
            submission_deadline_date TEXT,
            pre_bid_conference_details TEXT,
            department TEXT,
            nigp_codes TEXT,
            status TEXT DEFAULT 'new',
            raw_url TEXT,
            overview_text TEXT,
            scope_text TEXT,
            deepseek_json TEXT,
            discovered_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    return conn

def is_known_project(conn: sqlite3.Connection, project_id: str) -> bool:
    cur = conn.execute("SELECT 1 FROM leads WHERE project_id = ?", (project_id,))
    return cur.fetchone() is not None

def insert_lead(conn: sqlite3.Connection, lead: dict) -> bool:
    try:
        conn.execute("""
            INSERT OR IGNORE INTO leads
                (project_id, contract_title, classification_niche,
                 project_budget_estimate, submission_deadline_date,
                 pre_bid_conference_details, department, nigp_codes,
                 status, raw_url, overview_text, scope_text, deepseek_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)
        """, (
            lead.get("project_id"),
            lead.get("contract_title"),
            lead.get("classification_niche"),
            lead.get("project_budget_estimate"),
            lead.get("submission_deadline_date"),
            lead.get("pre_bid_conference_details"),
            lead.get("department"),
            lead.get("nigp_codes"),
            lead.get("raw_url"),
            lead.get("overview_text"),
            lead.get("scope_text"),
            lead.get("deepseek_json"),
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def get_new_leads(conn: sqlite3.Connection) -> list[dict]:
    cur = conn.execute("""
        SELECT project_id, contract_title, county_agency,
               classification_niche, project_budget_estimate,
               submission_deadline_date, pre_bid_conference_details,
               department, raw_url, overview_text, scope_text, deepseek_json
        FROM leads WHERE status = 'new'
        ORDER BY discovered_at DESC
    """)
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in rows]

def mark_sent(conn: sqlite3.Connection, project_id: str):
    conn.execute("UPDATE leads SET status = 'sent', updated_at = datetime('now') WHERE project_id = ?", (project_id,))
    conn.commit()

# -------------------------------------------------------------------
# Playwright Scraper — Listing
# -------------------------------------------------------------------
def scrape_listing() -> list[dict]:
    """
    Scrape the main project listing page.
    Returns list of {title, status, addenda, releaseDate, dueDate}.
    """
    log.info("Launching Chromium for listing scrape...")
    from playwright.sync_api import sync_playwright

    projects = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
        ])
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
        )
        page = ctx.new_page()

        try:
            page.goto(PORTAL_URL, wait_until="networkidle", timeout=45000)
            page.wait_for_selector('[role="rowgroup"] [role="row"]', timeout=20000)
            page.wait_for_timeout(2000)

            projects = page.evaluate("""() => {
                const rows = document.querySelectorAll(
                    '[role="rowgroup"] [role="row"]'
                );
                return Array.from(rows).map(row => {
                    const cells = row.querySelectorAll('[role="gridcell"]');
                    return {
                        title: (cells[0]?.textContent || '').trim(),
                        status: (cells[1]?.textContent || '').trim(),
                        addenda: (cells[2]?.textContent || '').trim(),
                        releaseDate: (cells[3]?.textContent || '').trim(),
                        dueDate: (cells[4]?.textContent || '').trim(),
                    };
                });
            }""")

            log.info(f"Found {len(projects)} projects in listing")

        except Exception as e:
            log.error(f"Listing scrape failed: {e}")
            raise
        finally:
            browser.close()

    return projects

# -------------------------------------------------------------------
# Playwright Scraper — Project Detail
# -------------------------------------------------------------------
def scrape_project_detail(title: str) -> dict:
    """
    Navigate to a project detail page by clicking through from listing.
    Extracts: project_id, department, nigp_codes, release/due dates,
    overview text, scope-of-work text, pre-bid conference info.
    """
    from playwright.sync_api import sync_playwright

    result = {
        "project_id": "",
        "department": "",
        "nigp_codes": "",
        "release_date": "",
        "due_date": "",
        "overview_text": "",
        "scope_text": "",
        "pre_bid_details": "",
        "raw_url": "",
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
        ])
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
        )
        page = ctx.new_page()

        try:
            # Load listing
            page.goto(PORTAL_URL, wait_until="networkidle", timeout=45000)
            page.wait_for_selector('[role="rowgroup"] [role="row"]', timeout=20000)
            page.wait_for_timeout(1000)

            # Find and click the matching project
            link = page.query_selector(f'[role="rowgroup"] a:has-text("{title[:60]}")')
            if not link:
                log.warning(f"  Could not find project in listing: {title[:50]}")
                return result

            link.click()
            page.wait_for_timeout(5000)

            # Extract numeric project ID from URL directly
            url_parts = page.url.rstrip("/").split("/")
            numeric_pid = url_parts[-1] if url_parts[-1].isdigit() else ""

            # --- Extract meta from detail page header ---
            meta = page.evaluate("""() => {
                const text = document.body.innerText;

                // Project ID (alphanumeric code shown on page)
                const idMatch = text.match(/Project ID:\\s*(\\S+)/);

                // Department badge: look for the text between the CC icon and NIGP codes
                // The DOM structure has icons with text like "Solid Waste Management"
                const main = document.querySelector('main') || document.body;
                const allText = main.innerText || '';

                // Find department - it's the text between the icons and NIGP codes
                const lines = allText.split('\\n');
                let department = '';
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    // Known department names that appear as badges
                    const deptNames = [
                        'Solid Waste Management', 'Public Works', 'Purchasing',
                        'Administration', 'Parks & Recreation', 'Engineering',
                        'Information Technology', 'Fleet Services', 'Health Department',
                        'Human Services', 'Finance', 'Public Safety'
                    ];
                    for (const dept of deptNames) {
                        if (line.includes(dept)) {
                            department = dept;
                            break;
                        }
                    }
                    if (department) break;
                }

                const nigpMatch = text.match(/(\\d{5}(?:,\\s*\\d{5})*)/);
                const relMatch = text.match(/Release Date:\\s*([^\\n]+)/);
                const dueMatch = text.match(/Due Date:\\s*([^\\n]+)/);

                return {
                    projectId: idMatch ? idMatch[1] : '',
                    department: department,
                    nigpCodes: nigpMatch ? nigpMatch[1] : '',
                    releaseDate: relMatch ? relMatch[1].trim() : '',
                    dueDate: dueMatch ? dueMatch[1].trim() : '',
                };
            }""")

            # Use numeric ID from URL as primary key, text ID as secondary
            meta["numericId"] = numeric_pid
            result["project_id"] = meta.get("numericId", "") or meta.get("projectId", "")
            result["department"] = meta.get("department", "")
            result["nigp_codes"] = meta.get("nigpCodes", "")
            result["release_date"] = meta.get("releaseDate", "")
            result["due_date"] = meta.get("dueDate", "")
            result["raw_url"] = page.url

            # --- Extract Overview tab text (content only, no chrome) ---
            overview_text = page.evaluate("""() => {
                // Click Overview tab if not already selected
                const tabs = document.querySelectorAll('[role="tab"]');
                for (const tab of tabs) {
                    if (tab.textContent.trim() === 'Overview') {
                        const isSelected = tab.getAttribute('aria-selected') === 'true';
                        if (!isSelected) tab.click();
                        break;
                    }
                }

                return new Promise(resolve => {
                    setTimeout(() => {
                        // Target the active tab panel, NOT the entire main
                        const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
                        if (!panel) {
                            // Fallback: try to find the overview content section
                            const main = document.querySelector('main');
                            resolve(main ? main.innerText.substring(0, 8000) : '');
                            return;
                        }
                        resolve(panel.innerText.substring(0, 8000));
                    }, 1500);
                });
            }""")
            # Strip OpenGov portal chrome from overview
            result["overview_text"] = _clean_portal_chrome(overview_text)

            # --- Extract Project Documents: Scope of Work (content only) ---
            scope_text = page.evaluate("""() => {
                const tabs = document.querySelectorAll('[role="tab"]');
                let docsTab = null;
                let scopeTab = null;

                // First find Project Documents tab
                for (const tab of tabs) {
                    if (tab.textContent.trim() === 'Project Documents') {
                        docsTab = tab;
                        break;
                    }
                }
                if (!docsTab) return '';

                docsTab.click();
                return new Promise(resolve => {
                    setTimeout(() => {
                        // Now find Scope of Work sub-tab
                        const subTabs = document.querySelectorAll('[role="tab"]');
                        for (const st of subTabs) {
                            if (st.textContent.includes('Scope of Work') ||
                                st.textContent.includes('SCOPE OF WORK')) {
                                scopeTab = st;
                                break;
                            }
                        }
                        if (!scopeTab) {
                            // Get whatever is visible in the project documents panel
                            const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
                            resolve(panel ? panel.innerText.substring(0, 10000) : '');
                            return;
                        }

                        scopeTab.click();
                        setTimeout(() => {
                            // Target the active tab panel only
                            const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
                            resolve(panel ? panel.innerText.substring(0, 10000) : '');
                        }, 1500);
                    }, 1500);
                });
            }""")
            result["scope_text"] = _clean_portal_chrome(scope_text)

            # --- Extract pre-bid conference details from full text ---
            full_text = overview_text + "\n" + scope_text
            pb_match = re.search(
                r'(?:Pre[- ]?Proposal Meeting|Pre[- ]?Bid Conference|Pre[- ]?Bid Meeting)'
                r'[:\s]*([^.!]*(?:attend|mandatory|optional|strongly encourage)[^.]*\.)',
                full_text, re.IGNORECASE
            )
            if pb_match:
                result["pre_bid_details"] = pb_match.group(0).strip()

            log.info(f"  Detail extracted: {result['project_id']} | {result['department']}")

        except Exception as e:
            log.error(f"  Detail extraction failed for '{title[:40]}': {e}")
            result["error"] = str(e)
        finally:
            browser.close()

    return result


# -------------------------------------------------------------------
# DeepSeek Transformation
# -------------------------------------------------------------------
def _clean_portal_chrome(text: str) -> str:
    """Strip OpenGov portal UI chrome from extracted text."""
    if not text:
        return ""

    # Lines/patterns that are portal UI, not bid content
    chrome_patterns = [
        r'^Procurement Portal\s*$',
        r'^Visit Help Center\s*$',
        r'^County of Ocean Portal\s*$',
        r'^OPEN\s*$',
        r'^Follow\s*$',
        r'^Draft Response\s+No Bid\s*$',
        r'^Draft Response\s*$',
        r'^No Bid\s*$',
        r'^Time Remaining:.*$',
        r'^Posted\s+.*$',
        r'^All dates & times in Eastern Time\s*$',
        r'^Overview\s*$',
        r'^Project Documents\s*$',
        r'^Downloads\s*$',
        r'^Addenda & Notices\s*$',
        r'^Question & Answer\s*$',
        r'^View All Sections\s*$',
        r'^To respond to this project.*$',
        r'^Release Date:.*$',
        r'^Due Date:.*$',
        r'^Posted At:.*$',
        r'^Sealed Bid Process:.*$',
        r'^Private Bid:.*$',
        r'^Timeline\s*$',
        r'^Advertising Date:.*$',
        r'^Bid Opening Date:.*$',
        r'^\d+\.\s+Notice to Bidders\s*$',
        r'^\d+\.\s+Contact Information and Project Timeline\s*$',
        r'^\d+\.\s+Important Instructions for Electronic Submittal\s*$',
        r'^\d+\.\s+Instructions to Bidders\s*$',
        r'^\d+\.\s+Award Method\s*$',
        r'^\d+\.\s+Mandatory Equal Employment Opportunity\s*$',
        r'^\d+\.\s+Americans with Disabilities Act\s*$',
        r'^\d+\.\s+Scope of Work\s*$',
        r'^\d+\.\s+Attachments\s*$',
        r'^\d+\.\s+Vendor Questionnaire\s*$',
        r'^\d+\.\s+Pricing Proposal\s*$',
        r'^View All Sections\s*$',
    ]

    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append('')
            continue
        # Check against all chrome patterns
        is_chrome = False
        for pattern in chrome_patterns:
            if re.match(pattern, stripped, re.IGNORECASE):
                is_chrome = True
                break
        if not is_chrome:
            cleaned.append(stripped)

    # Collapse multiple blank lines
    result_lines = []
    prev_blank = False
    for line in cleaned:
        if line == '':
            if not prev_blank:
                result_lines.append(line)
            prev_blank = True
        else:
            result_lines.append(line)
            prev_blank = False

    return '\n'.join(result_lines).strip()


def transform_with_deepseek(title: str, overview: str, scope: str) -> dict:
    """Send extracted text to DeepSeek for structured JSON."""
    api_key = get_deepseek_key()
    if not api_key:
        log.warning("DEEPSEEK_API_KEY not set — using title-based classification")
        return _classify_from_title(title)

    text_block = f"TITLE: {title}\n\n"
    if overview:
        text_block += f"OVERVIEW:\n{overview[:4000]}\n\n"
    if scope:
        text_block += f"SCOPE OF WORK:\n{scope[:6000]}"

    try:
        import urllib.request
        import urllib.error

        payload = json.dumps({
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a government procurement analyst. Extract structured "
                        "data from RFP documents. Return ONLY valid JSON matching the "
                        "schema. No other text."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Extract fields from this RFP. Return ONLY JSON:\n"
                        "{\n"
                        '  "contract_title": "max 100 chars",\n'
                        '  "classification_niche": "Construction | Janitorial | '
                        "IT Services | Fleet | General | Healthcare | Professional Services\",\n"
                        '  "project_budget_estimate": integer or null,\n'
                        '  "submission_deadline_date": "YYYY-MM-DD" or null,\n'
                        '  "pre_bid_conference_details": "string or null"\n'
                        "}\n\n"
                        f"DOCUMENT:\n{text_block[:10000]}"
                    ),
                },
            ],
            "temperature": 0.1,
            "max_tokens": 1000,
        })

        req = urllib.request.Request(
            "https://api.deepseek.com/v1/chat/completions",
            data=payload.encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            content = result["choices"][0]["message"]["content"]

        content = re.sub(r'^```(?:json)?\s*', '', content.strip())
        content = re.sub(r'\s*```$', '', content)
        parsed = json.loads(content)
        log.info(f"  DeepSeek classification: {parsed.get('classification_niche', '?')}")
        return parsed

    except Exception as e:
        log.error(f"  DeepSeek failed: {e}")
        return _classify_from_title(title)


def _classify_from_title(title: str) -> dict:
    """Fallback: keyword-based classification from title alone."""
    title_upper = title.upper()

    categories = {
        "Construction": ["CONSTRUCTION", "BUILD", "RENOVATION", "ROOF", "HVAC",
                         "FLOOR", "PAVING", "SIDEWALK", "BRIDGE", "HIGHWAY"],
        "Janitorial": ["JANITORIAL", "CUSTODIAL", "CLEANING", "WASTE",
                       "RECYCLING", "SANITATION"],
        "IT Services": ["IT ", "INFORMATION TECHNOLOGY", "SOFTWARE",
                        "HARDWARE", "NETWORK", "TELECOMM"],
        "Fleet": ["FLEET", "VEHICLE", "TRUCK", "AUTOMOTIVE", "TIRE",
                  "ANTIFREEZE", "OIL", "LUBRICANT", "SALT"],
        "Professional Services": ["CONSULTING", "AUDIT", "LEGAL",
                                   "ENGINEERING", "ARCHITECT"],
        "General": ["SIGN", "LIGHT", "PUMP", "RECEPTACLE", "BLOCK",
                    "EQUIPMENT", "SUPPLY"],
    }

    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in title_upper:
                return {
                    "contract_title": title[:100],
                    "classification_niche": cat,
                    "project_budget_estimate": None,
                    "submission_deadline_date": None,
                    "pre_bid_conference_details": None,
                }

    return {
        "contract_title": title[:100],
        "classification_niche": "General",
        "project_budget_estimate": None,
        "submission_deadline_date": None,
        "pre_bid_conference_details": None,
    }


# -------------------------------------------------------------------
# Email Wire Generator
# -------------------------------------------------------------------
def generate_wire(new_leads: list[dict]) -> str:
    now = datetime.now(timezone.utc).strftime("%A, %B %d, %Y")
    lines = [
        f"# Paramount Index — Ocean County Wire",
        f"**{now}** | Daily RFP Lead Digest",
        "",
        "---",
        "",
    ]

    if not new_leads:
        lines.append("*No new leads discovered in this scan.*")
        lines.append("")
        lines.append("All active projects were previously captured.")
        return "\n".join(lines)

    lines.append(f"### {len(new_leads)} New {'Lead' if len(new_leads)==1 else 'Leads'} Discovered")
    lines.append("")

    for i, lead in enumerate(new_leads, 1):
        title = lead.get("contract_title") or lead.get("project_id", "Unknown")
        niche = lead.get("classification_niche") or "Unclassified"
        budget = lead.get("project_budget_estimate") or "Not specified"
        deadline = lead.get("submission_deadline_date") or "TBD"
        pre_bid = lead.get("pre_bid_conference_details") or "None listed"
        dept = lead.get("department") or "Ocean County"
        url = lead.get("raw_url", "")

        lines.append(f"#### {i}. {title}")
        lines.append("")
        lines.append(f"| Field | Detail |")
        lines.append(f"|-------|--------|")
        lines.append(f"| **Department** | {dept} |")
        lines.append(f"| **Category** | {niche} |")
        lines.append(f"| **Budget** | {budget} |")
        lines.append(f"| **Deadline** | {deadline} |")
        lines.append(f"| **Pre-Bid** | {pre_bid} |")
        if url:
            lines.append(f"| **Source** | [View on Portal]({url}) |")
        lines.append("")

    lines.append("---")
    lines.append("*Generated autonomously by Paramount Index.*")
    lines.append("*Server: srv1688558 | Pipeline: daily at 3:00 AM ET*")

    return "\n".join(lines)


def write_wire(markdown: str):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = OUTPUT_DIR / f"wire-{date_str}.md"
    path.write_text(markdown)
    log.info(f"Wire written: {path}")

    latest = OUTPUT_DIR / "latest.md"
    if latest.exists() or latest.is_symlink():
        latest.unlink()
    latest.symlink_to(path.name)


# -------------------------------------------------------------------
# Pipeline Orchestrator
# -------------------------------------------------------------------
def run_pipeline(dry_run: bool = False) -> int:
    log.info("=" * 60)
    log.info("OCEAN COUNTY PROCUREMENT WIRE — PIPELINE RUN")
    log.info("=" * 60)

    conn = init_db()
    new_lead_count = 0

    # Step 1: Scrape listing
    projects = scrape_listing()
    if not projects:
        log.warning("No projects found — aborting")
        conn.close()
        return 0

    # Filter to open projects only
    active = [p for p in projects if p.get("status", "").lower() == "open"]
    log.info(f"Active (open) projects: {len(active)}/{len(projects)}")

    # Step 2-5: Process each active project
    for proj in active:
        title = proj["title"]
        due_date = proj["dueDate"]

        log.info(f"--- Processing: {title[:60]} ---")

        # Step 2: Extract detail by clicking through
        detail = scrape_project_detail(title)
        pid = detail.get("project_id", "")

        if not pid:
            log.warning(f"  No project ID — using title hash as fallback")
            pid = hashlib.md5(title.encode()).hexdigest()[:12]

        # Check dedup
        if is_known_project(conn, pid):
            log.info(f"  Already in database: {pid}")
            continue

        # Step 3: Transform with DeepSeek
        deepseek_result = transform_with_deepseek(
            title,
            detail.get("overview_text", ""),
            detail.get("scope_text", ""),
        )

        # Parse deadline
        deadline = deepseek_result.get("submission_deadline_date", "")
        if not deadline and due_date:
            try:
                dt = datetime.strptime(due_date, "%m/%d/%Y")
                deadline = dt.strftime("%Y-%m-%d")
            except ValueError:
                deadline = ""

        # Step 4: Insert into SQLite
        lead = {
            "project_id": pid,
            "contract_title": deepseek_result.get("contract_title", title[:100]),
            "classification_niche": deepseek_result.get("classification_niche", "General"),
            "project_budget_estimate": str(deepseek_result.get("project_budget_estimate") or ""),
            "submission_deadline_date": deadline,
            "pre_bid_conference_details": deepseek_result.get("pre_bid_conference_details") or detail.get("pre_bid_details", ""),
            "department": detail.get("department", ""),
            "nigp_codes": detail.get("nigp_codes", ""),
            "raw_url": detail.get("raw_url", ""),
            "overview_text": (detail.get("overview_text") or "")[:2000],
            "scope_text": (detail.get("scope_text") or "")[:4000],
            "deepseek_json": json.dumps(deepseek_result) if deepseek_result else "{}",
        }

        if insert_lead(conn, lead):
            new_lead_count += 1
            log.info(f"  ✅ NEW LEAD: {title[:50]} (ID: {pid})")
        else:
            log.info(f"  ℹ️  Duplicate: {pid}")

    # Step 5: Generate and write wire
    new_leads = get_new_leads(conn)
    log.info(f"New leads this run: {len(new_leads)}")

    wire = generate_wire(new_leads)
    write_wire(wire)

    # Mark delivered leads as sent
    for lead in new_leads:
        mark_sent(conn, lead["project_id"])
    log.info(f"Marked {len(new_leads)} leads as sent")

    if dry_run:
        print("\n" + "=" * 60)
        print("WIRE PREVIEW")
        print("=" * 60)
        print(wire)

    conn.close()
    log.info(f"Pipeline complete. New leads: {new_lead_count}")
    return new_lead_count


# -------------------------------------------------------------------
# CLI
# -------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Paramount Index — Ocean County Procurement Wire")
    parser.add_argument("--dry-run", action="store_true", help="Print wire preview only")
    args = parser.parse_args()

    count = run_pipeline(dry_run=args.dry_run)
    sys.exit(0 if count is not None else 1)
