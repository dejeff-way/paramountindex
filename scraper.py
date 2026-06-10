#!/usr/bin/env python3
"""
Paramount Index — Multi-County Procurement Wire
══════════════════════════════════════════════════════════════
Scrapes all active portals defined in portals.json using the
same Playwright + DeepSeek + SQLite pipeline as
ocean_county_scraper.py, but tagged per county.

Usage:  python3 scraper.py [--dry-run]
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
from typing import Optional

# ── Config ──────────────────────────────────────────────────
BASE_DIR = Path("/root/workspace/procurement")
DB_PATH = BASE_DIR / "leads.db"
OUTPUT_DIR = BASE_DIR / "output"
ENV_PATH = BASE_DIR / ".env"
LOG_PATH = BASE_DIR / "scraper.log"
PORTALS_PATH = BASE_DIR / "portals.json"

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("scraper")

# ── Env ──────────────────────────────────────────────────────
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

# ── Portals ──────────────────────────────────────────────────
def load_portals() -> list[dict]:
    if not PORTALS_PATH.exists():
        log.error(f"portals.json not found at {PORTALS_PATH}")
        return []
    with open(PORTALS_PATH) as f:
        portals = json.load(f)
    active = [p for p in portals if p.get("active")]
    log.info(f"Loaded {len(active)} active portals from {len(portals)} total")
    return active

# ── SQLite ──────────────────────────────────────────────────
def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            contract_title TEXT,
            county_agency TEXT DEFAULT 'County Purchasing Department',
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
            source_county TEXT,
            discovered_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            UNIQUE(project_id, source_county)
        )
    """)
    # Add source_county column if upgrading from old schema
    try:
        conn.execute("ALTER TABLE leads ADD COLUMN source_county TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists
    conn.commit()
    return conn

def is_known_project(conn: sqlite3.Connection, project_id: str, county: str) -> bool:
    cur = conn.execute(
        "SELECT 1 FROM leads WHERE project_id = ? AND source_county = ?",
        (project_id, county),
    )
    return cur.fetchone() is not None

def insert_lead(conn: sqlite3.Connection, lead: dict) -> bool:
    try:
        conn.execute("""
            INSERT OR IGNORE INTO leads
                (project_id, contract_title, classification_niche,
                 project_budget_estimate, submission_deadline_date,
                 pre_bid_conference_details, department, nigp_codes,
                 status, raw_url, overview_text, scope_text,
                 deepseek_json, source_county)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?)
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
            lead.get("source_county"),
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
               department, raw_url, overview_text, scope_text,
               deepseek_json, source_county
        FROM leads WHERE status = 'new'
        ORDER BY source_county, discovered_at DESC
    """)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]

def mark_sent(conn: sqlite3.Connection, project_id: str, county: str):
    conn.execute(
        "UPDATE leads SET status = 'sent', updated_at = datetime('now') "
        "WHERE project_id = ? AND source_county = ?",
        (project_id, county),
    )
    conn.commit()

# ── Playwright: Listing ─────────────────────────────────────
def scrape_listing(portal_url: str) -> list[dict]:
    from playwright.sync_api import sync_playwright

    projects = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            "--no-sandbox", "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
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
            page.goto(portal_url, wait_until="networkidle", timeout=45000)
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
            log.info(f"  Found {len(projects)} projects in listing")
        except Exception as e:
            log.error(f"  Listing scrape failed: {e}")
        finally:
            browser.close()
    return projects

# ── Playwright: Detail ──────────────────────────────────────
def scrape_project_detail(portal_url: str, title: str) -> dict:
    from playwright.sync_api import sync_playwright

    result = {
        "project_id": "", "department": "", "nigp_codes": "",
        "release_date": "", "due_date": "", "overview_text": "",
        "scope_text": "", "pre_bid_details": "", "raw_url": "",
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            "--no-sandbox", "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
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
            page.goto(portal_url, wait_until="networkidle", timeout=45000)
            page.wait_for_selector('[role="rowgroup"] [role="row"]', timeout=20000)
            page.wait_for_timeout(1000)

            link = page.query_selector(
                f'[role="rowgroup"] a:has-text("{title[:60]}")'
            )
            if not link:
                log.warning(f"  Could not find project in listing: {title[:50]}")
                return result

            link.click()
            page.wait_for_timeout(5000)

            url_parts = page.url.rstrip("/").split("/")
            numeric_pid = url_parts[-1] if url_parts[-1].isdigit() else ""

            meta = page.evaluate("""() => {
                const text = document.body.innerText;
                const idMatch = text.match(/Project ID:\\s*(\\S+)/);
                const main = document.querySelector('main') || document.body;
                const allText = main.innerText || '';
                const lines = allText.split('\\n');
                let department = '';
                const deptNames = [
                    'Solid Waste Management', 'Public Works', 'Purchasing',
                    'Administration', 'Parks & Recreation', 'Engineering',
                    'Information Technology', 'Fleet Services',
                    'Health Department', 'Human Services', 'Finance',
                    'Public Safety'
                ];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
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

            meta["numericId"] = numeric_pid
            result["project_id"] = meta.get("numericId", "") or meta.get("projectId", "")
            result["department"] = meta.get("department", "")
            result["nigp_codes"] = meta.get("nigpCodes", "")
            result["release_date"] = meta.get("releaseDate", "")
            result["due_date"] = meta.get("dueDate", "")
            result["raw_url"] = page.url

            # Overview tab
            overview_text = page.evaluate("""() => {
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
                        const panel = document.querySelector(
                            '[role="tabpanel"]:not([hidden])'
                        );
                        if (!panel) {
                            const main = document.querySelector('main');
                            resolve(main ? main.innerText.substring(0, 8000) : '');
                            return;
                        }
                        resolve(panel.innerText.substring(0, 8000));
                    }, 1500);
                });
            }""")
            result["overview_text"] = _clean_portal_chrome(overview_text)

            # Scope of Work
            scope_text = page.evaluate("""() => {
                const tabs = document.querySelectorAll('[role="tab"]');
                let docsTab = null;
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
                        const subTabs = document.querySelectorAll('[role="tab"]');
                        let scopeTab = null;
                        for (const st of subTabs) {
                            if (st.textContent.includes('Scope of Work') ||
                                st.textContent.includes('SCOPE OF WORK')) {
                                scopeTab = st;
                                break;
                            }
                        }
                        if (!scopeTab) {
                            const panel = document.querySelector(
                                '[role="tabpanel"]:not([hidden])'
                            );
                            resolve(panel ? panel.innerText.substring(0, 10000) : '');
                            return;
                        }
                        scopeTab.click();
                        setTimeout(() => {
                            const panel = document.querySelector(
                                '[role="tabpanel"]:not([hidden])'
                            );
                            resolve(panel ? panel.innerText.substring(0, 10000) : '');
                        }, 1500);
                    }, 1500);
                });
            }""")
            result["scope_text"] = _clean_portal_chrome(scope_text)

            # Pre-bid
            full_text = overview_text + "\n" + scope_text
            pb_match = re.search(
                r'(?:Pre[- ]?Proposal Meeting|Pre[- ]?Bid Conference|'
                r'Pre[- ]?Bid Meeting)'
                r'[:\s]*([^.!]*(?:attend|mandatory|optional|'
                r'strongly encourage)[^.]*\.)',
                full_text, re.IGNORECASE,
            )
            if pb_match:
                result["pre_bid_details"] = pb_match.group(0).strip()

        except Exception as e:
            log.error(f"  Detail extraction failed: {e}")
        finally:
            browser.close()
    return result

# ── Portal chrome cleaning ─────────────────────────────────
def _clean_portal_chrome(text: str) -> str:
    if not text:
        return ""
    chrome_patterns = [
        r'^Procurement Portal\s*$', r'^Visit Help Center\s*$',
        r'^County of Ocean Portal\s*$', r'^OPEN\s*$', r'^Follow\s*$',
        r'^Draft Response\s+No Bid\s*$', r'^Draft Response\s*$',
        r'^No Bid\s*$', r'^Time Remaining:.*$', r'^Posted\s+.*$',
        r'^All dates & times in Eastern Time\s*$',
        r'^Overview\s*$', r'^Project Documents\s*$', r'^Downloads\s*$',
        r'^Addenda & Notices\s*$', r'^Question & Answer\s*$',
        r'^View All Sections\s*$', r'^To respond to this project.*$',
        r'^Release Date:.*$', r'^Due Date:.*$', r'^Posted At:.*$',
        r'^Sealed Bid Process:.*$', r'^Private Bid:.*$',
        r'^Timeline\s*$', r'^Advertising Date:.*$',
        r'^Bid Opening Date:.*$', r'^\d+\.\s+Notice to Bidders\s*$',
        r'^\d+\.\s+Contact Information and Project Timeline\s*$',
        r'^\d+\.\s+Important Instructions for Electronic Submittal\s*$',
        r'^\d+\.\s+Instructions to Bidders\s*$',
        r'^\d+\.\s+Award Method\s*$',
        r'^\d+\.\s+Mandatory Equal Employment Opportunity\s*$',
        r'^\d+\.\s+Americans with Disabilities Act\s*$',
        r'^\d+\.\s+Scope of Work\s*$', r'^\d+\.\s+Attachments\s*$',
        r'^\d+\.\s+Vendor Questionnaire\s*$',
        r'^\d+\.\s+Pricing Proposal\s*$',
    ]
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append('')
            continue
        if any(re.match(p, stripped, re.IGNORECASE) for p in chrome_patterns):
            continue
        cleaned.append(stripped)

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

# ── DeepSeek ────────────────────────────────────────────────
def transform_with_deepseek(title: str, overview: str, scope: str) -> dict:
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
        payload = json.dumps({
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a government procurement analyst. Extract "
                        "structured data from RFP documents. Return ONLY valid "
                        "JSON matching the schema. No other text."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Extract fields from this RFP. Return ONLY JSON:\n"
                        "{\n"
                        '  "contract_title": "max 100 chars",\n'
                        '  "classification_niche": "Construction | Janitorial | '
                        "IT Services | Fleet | General | Healthcare | "
                        'Professional Services",\n'
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
        log.info(f"  DeepSeek: {parsed.get('classification_niche', '?')}")
        return parsed
    except Exception as e:
        log.error(f"  DeepSeek failed: {e}")
        return _classify_from_title(title)

def _classify_from_title(title: str) -> dict:
    title_upper = title.upper()
    categories = {
        "Construction": [
            "CONSTRUCTION", "BUILD", "RENOVATION", "ROOF", "HVAC",
            "FLOOR", "PAVING", "SIDEWALK", "BRIDGE", "HIGHWAY",
        ],
        "Janitorial": [
            "JANITORIAL", "CUSTODIAL", "CLEANING", "WASTE",
            "RECYCLING", "SANITATION",
        ],
        "IT Services": [
            "IT ", "INFORMATION TECHNOLOGY", "SOFTWARE",
            "HARDWARE", "NETWORK", "TELECOMM",
        ],
        "Fleet": [
            "FLEET", "VEHICLE", "TRUCK", "AUTOMOTIVE", "TIRE",
            "ANTIFREEZE", "OIL", "LUBRICANT", "SALT",
        ],
        "Professional Services": [
            "CONSULTING", "AUDIT", "LEGAL", "ENGINEERING", "ARCHITECT",
        ],
        "General": [
            "SIGN", "LIGHT", "PUMP", "RECEPTACLE", "BLOCK",
            "EQUIPMENT", "SUPPLY",
        ],
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

# ── Wire Generator (grouped by county) ──────────────────────
def generate_wire(new_leads: list[dict]) -> str:
    now = datetime.now(timezone.utc).strftime("%A, %B %d, %Y")
    lines = [
        "# Paramount Index — Multi-County Procurement Wire",
        f"**{now}** | Daily RFP Lead Digest",
        "",
        "---",
        "",
    ]

    if not new_leads:
        lines.append("*No new leads discovered in this scan.*")
        return "\n".join(lines)

    # Group by county
    by_county: dict[str, list[dict]] = {}
    for lead in new_leads:
        county = lead.get("source_county") or "Unknown County"
        by_county.setdefault(county, []).append(lead)

    for county, leads in sorted(by_county.items()):
        lines.append(f"## {county}")
        lines.append("")
        for i, lead in enumerate(leads, 1):
            title = lead.get("contract_title") or lead.get("project_id", "Unknown")
            niche = lead.get("classification_niche") or "Unclassified"
            budget = lead.get("project_budget_estimate") or "Not specified"
            deadline = lead.get("submission_deadline_date") or "TBD"
            pre_bid = lead.get("pre_bid_conference_details") or "None listed"
            dept = lead.get("department") or ""
            url = lead.get("raw_url", "")

            lines.append(f"### {i}. {title}")
            lines.append("")
            lines.append("| Field | Detail |")
            lines.append("|-------|--------|")
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

# ── Pipeline Orchestrator ──────────────────────────────────
def run_pipeline(dry_run: bool = False) -> int:
    log.info("=" * 60)
    log.info("MULTI-COUNTY PROCUREMENT WIRE — PIPELINE RUN")
    log.info("=" * 60)

    portals = load_portals()
    if not portals:
        log.error("No active portals — aborting")
        return 0

    conn = init_db()
    total_new = 0

    for portal in portals:
        county_slug = portal["slug"]
        county_name = portal["county"]
        portal_url = portal["url"]
        log.info(f"\n{'─' * 50}")
        log.info(f"COUNTY: {county_name} ({county_slug})")
        log.info(f"URL:    {portal_url}")
        log.info(f"{'─' * 50}")

        # Step 1: Scrape listing
        try:
            projects = scrape_listing(portal_url)
        except Exception as e:
            log.error(f"  Failed to scrape {county_name}: {e}")
            continue

        if not projects:
            log.warning(f"  No projects found for {county_name}")
            continue

        active = [p for p in projects if p.get("status", "").lower() == "open"]
        log.info(f"  Active (open): {len(active)}/{len(projects)}")

        # Step 2-5: Process each project
        for proj in active:
            title = proj["title"]
            due_date = proj.get("dueDate", "")

            log.info(f"  --- {title[:60]} ---")

            detail = scrape_project_detail(portal_url, title)
            pid = detail.get("project_id", "")
            if not pid:
                pid = hashlib.md5(f"{county_slug}:{title}".encode()).hexdigest()[:12]

            if is_known_project(conn, pid, county_slug):
                log.info(f"  Already in database: {pid}")
                continue

            deepseek_result = transform_with_deepseek(
                title,
                detail.get("overview_text", ""),
                detail.get("scope_text", ""),
            )

            deadline = deepseek_result.get("submission_deadline_date", "")
            if not deadline and due_date:
                try:
                    dt = datetime.strptime(due_date, "%m/%d/%Y")
                    deadline = dt.strftime("%Y-%m-%d")
                except ValueError:
                    deadline = ""

            lead = {
                "project_id": pid,
                "contract_title": deepseek_result.get("contract_title", title[:100]),
                "classification_niche": deepseek_result.get(
                    "classification_niche", "General"
                ),
                "project_budget_estimate": str(
                    deepseek_result.get("project_budget_estimate") or ""
                ),
                "submission_deadline_date": deadline,
                "pre_bid_conference_details": (
                    deepseek_result.get("pre_bid_conference_details")
                    or detail.get("pre_bid_details", "")
                ),
                "department": detail.get("department", ""),
                "nigp_codes": detail.get("nigp_codes", ""),
                "raw_url": detail.get("raw_url", ""),
                "overview_text": (detail.get("overview_text") or "")[:2000],
                "scope_text": (detail.get("scope_text") or "")[:4000],
                "deepseek_json": (
                    json.dumps(deepseek_result) if deepseek_result else "{}"
                ),
                "source_county": county_name,
            }

            if insert_lead(conn, lead):
                total_new += 1
                log.info(f"  ✅ NEW: {title[:50]} ({county_name})")
            else:
                log.info(f"  ℹ️  Duplicate: {pid}")

    # Wire generation
    new_leads = get_new_leads(conn)
    log.info(f"\nNew leads this run: {len(new_leads)}")
    wire = generate_wire(new_leads)
    write_wire(wire)

    for lead in new_leads:
        county = lead.get("source_county") or ""
        mark_sent(conn, lead["project_id"], county)
    log.info(f"Marked {len(new_leads)} leads as sent")

    if dry_run:
        print("\n" + "=" * 60)
        print("WIRE PREVIEW")
        print("=" * 60)
        print(wire)

    conn.close()
    log.info(f"Pipeline complete. New leads across all counties: {total_new}")
    return total_new

# ── CLI ─────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Paramount Index — Multi-County Procurement Wire"
    )
    parser.add_argument("--dry-run", action="store_true", help="Print wire preview only")
    args = parser.parse_args()

    count = run_pipeline(dry_run=args.dry_run)
    sys.exit(0 if count is not None else 1)
